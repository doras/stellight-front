<template>
  <div class="daily-schedule-view" ref="root">
    <div class="daily-toolbar">
      <v-btn
        icon="$prev"
        variant="text"
        density="comfortable"
        aria-label="이전 날"
        @click="jumpByDays(-1)"
      />
      <v-btn
        variant="tonal"
        class="mx-1"
        @click="goToday"
      >
        오늘
      </v-btn>
      <v-btn
        icon="$next"
        variant="text"
        density="comfortable"
        aria-label="다음 날"
        @click="jumpByDays(1)"
      />
      <span class="toolbar-date ml-3">{{ formatDayTitle(navTargetDate ?? visibleDate) }}</span>
      <v-progress-linear
        v-if="loading"
        class="toolbar-progress"
        indeterminate
        color="primary"
        height="2"
      />
    </div>

    <div class="text-center my-3">
      <v-btn variant="text" @click="prependDay">
        {{ formatDayTitle(previousDate) }} 보기
      </v-btn>
    </div>

    <section
      v-for="day in days"
      :key="day.date"
      class="day-section"
      :data-anchor="day.date"
    >
      <h2 class="day-header">
        <span>{{ formatDayTitle(day.date) }}</span>
        <span v-if="getRelativeDayLabel(day.date)" class="relative-day-label">
          {{ getRelativeDayLabel(day.date) }}
        </span>
      </h2>

      <div
        v-if="day.dayOffs.length > 0"
        class="day-off-row"
        :class="{ dimmed: isPastDay(day.date) }"
      >
        <span class="day-off-label">휴방</span>
        <button
          v-for="schedule in day.dayOffs"
          :key="schedule.id"
          type="button"
          class="day-off-chip-button"
          @click="$emit('select', schedule)"
        >
          <StellarNameChip
            :stellar="findStellar(schedule.stellarId)"
            :fallbackName="schedule.stellarNameKor"
            :marked="hasDayOffDetail(schedule)"
          />
        </button>
      </div>

      <div
        v-for="block in day.blocks"
        :key="block.index"
        class="schedule-block"
        :class="{ dimmed: isDimmed(day.date, block.index) }"
        :data-anchor="getBlockKey(day.date, block.index)"
      >
        <h3 class="block-header">
          <v-icon icon="$clockOutline" size="18" class="block-icon" />
          {{ formatBlockRange(block.index) }}
          <span
            v-if="nowTargetKey === getBlockKey(day.date, block.index)"
            class="now-badge"
          >
            지금
          </span>
        </h3>
        <div class="card-grid">
          <ScheduleCard
            v-for="schedule in block.schedules"
            :key="schedule.id"
            :stellars="stellars"
            :schedule="schedule"
            @select="$emit('select', $event)"
          />
        </div>
      </div>

      <!--
        At the end of the day: after the auto-scroll, the rest of the day is read downward,
        so "time not fixed" streams (often "sometime in the evening") stay on the reading path
      -->
      <div
        v-if="day.untimed.length > 0"
        class="schedule-block"
        :class="{ dimmed: isPastDay(day.date) }"
        :data-anchor="`${day.date}|untimed`"
      >
        <h3 class="block-header">
          <v-icon icon="$clockOutline" size="18" class="block-icon" />
          시간 미정
        </h3>
        <div class="card-grid">
          <ScheduleCard
            v-for="schedule in day.untimed"
            :key="schedule.id"
            :stellars="stellars"
            :schedule="schedule"
            @select="$emit('select', $event)"
          />
        </div>
      </div>

      <p v-if="isEmptyDay(day)" class="empty-day text-medium-emphasis">
        등록된 스케줄이 없습니다.
      </p>
    </section>

    <div class="text-center my-3">
      <v-btn variant="text" @click="appendDay">
        {{ formatDayTitle(nextDate) }} 보기
      </v-btn>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import ScheduleCard from '@/components/ScheduleCard.vue';
import StellarNameChip from '@/components/StellarNameChip.vue';
import { findStellar, isDayOff, nowInScheduleZone, parseScheduleDate } from '@/utils/common';

const BLOCK_HOURS = 3;
const BLOCKS_PER_DAY = 24 / BLOCK_HOURS;
const NOW_UPDATE_INTERVAL_MS = 60 * 1000;
// A navigation scroll is regarded as finished when no scroll event comes for this long
// (fallback for browsers without the scrollend event)
const NAV_SCROLL_IDLE_MS = 200;
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
const RELATIVE_DAY_LABELS = { '-1': '어제', '0': '오늘', '1': '내일' };

const toISODate = dateTime => dateTime.toISODate();

export default {
  name: 'DailyScheduleView',
  components: { ScheduleCard, StellarNameChip },
  props: {
    stellars: {
      type: Array,
      required: true,
    },
    // Schedules to show, already filtered and sorted (fixed time first, then time, then stellar rank)
    schedules: {
      type: Array,
      required: true,
    },
    // Visible range as ISO dates (yyyy-MM-dd), both inclusive
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    // Incremented by the parent each time the schedules of the current range are loaded
    dataVersion: {
      type: Number,
      required: true,
    },
    // Whether the parent is loading schedules (e.g. for an extended range)
    loading: {
      type: Boolean,
      default: false,
    },
    // Range being loaded ({ start, end }), applied as startDate/endDate when its data arrives
    requestedRange: {
      type: Object,
      default: null,
    },
  },
  emits: ['select', 'update:range'],
  data() {
    return {
      now: nowInScheduleZone(),
      visibleDate: toISODate(nowInScheduleZone()),
      // Scroll action that waits for the data of an extended range
      // ({ type: 'auto' } or { type: 'date', date }, with the dataVersion at the request)
      pendingScroll: null,
      // Date shown in the toolbar while navigating to it (◀ / ▶ / 오늘), instead of the dates
      // that the smooth scroll passes by. Released when the scroll ends or the user scrolls.
      navTargetDate: null,
    };
  },
  computed: {
    today() {
      return this.now.startOf('day');
    },
    // The range including one still loading, so that a new request extends it instead of
    // asking for the same days again (e.g. "이전 날 보기" tapped several times while loading)
    rangeStart() {
      return this.requestedRange?.start ?? this.startDate;
    },
    rangeEnd() {
      return this.requestedRange?.end ?? this.endDate;
    },
    previousDate() {
      return toISODate(DateTime.fromISO(this.rangeStart).minus({ days: 1 }));
    },
    nextDate() {
      return toISODate(DateTime.fromISO(this.rangeEnd).plus({ days: 1 }));
    },
    days() {
      const start = DateTime.fromISO(this.startDate);
      const end = DateTime.fromISO(this.endDate);
      const dayCount = Math.round(end.diff(start, 'days').days) + 1;

      const dayMap = new Map();
      for (let i = 0; i < dayCount; i++) {
        const date = toISODate(start.plus({ days: i }));
        dayMap.set(date, {
          date,
          dayOffs: [],
          untimed: [],
          blockSchedules: Array.from({ length: BLOCKS_PER_DAY }, () => []),
        });
      }

      // Day attribution follows the calendar date of startDateTime (no "broadcast day")
      for (const schedule of this.schedules) {
        const day = dayMap.get(schedule.startDateTime.substring(0, 10));
        if (!day) continue;

        if (isDayOff(schedule)) {
          day.dayOffs.push(schedule);
        } else if (!schedule.isFixedTime) {
          day.untimed.push(schedule);
        } else {
          const hour = parseInt(schedule.startDateTime.substring(11, 13), 10);
          day.blockSchedules[Math.floor(hour / BLOCK_HOURS)].push(schedule);
        }
      }

      return [...dayMap.values()].map(day => ({
        date: day.date,
        dayOffs: day.dayOffs,
        untimed: day.untimed,
        // Empty blocks are hidden
        blocks: day.blockSchedules
          .map((schedules, index) => ({ index, schedules }))
          .filter(block => block.schedules.length > 0),
      }));
    },
    // Index of the current block within today (0-7); blocks are compared by their ordinal from today's 00-03 block (see getBlockOrdinal)
    currentBlockOrdinal() {
      return Math.floor(this.now.hour / BLOCK_HOURS);
    },
    // Non-empty timed blocks in time order, with their ordinal relative to today's first block
    nonEmptyBlocks() {
      return this.days.flatMap(day => day.blocks.map(block => ({
        date: day.date,
        index: block.index,
        ordinal: this.getBlockOrdinal(day.date, block.index),
      })));
    },
    // Auto-scroll target block:
    // 1. the latest non-empty block among the current one and the one right before it
    //    (streams that started in the previous block are likely still live),
    // 2. otherwise the next non-empty block,
    // 3. otherwise none (scroll to today's header).
    nowTarget() {
      const current = this.currentBlockOrdinal;
      const recent = this.nonEmptyBlocks
        .filter(block => block.ordinal === current || block.ordinal === current - 1)
        .sort((a, b) => b.ordinal - a.ordinal);
      if (recent.length > 0) return recent[0];

      return this.nonEmptyBlocks.find(block => block.ordinal > current) ?? null;
    },
    nowTargetKey() {
      return this.nowTarget ? this.getBlockKey(this.nowTarget.date, this.nowTarget.index) : null;
    },
  },
  watch: {
    dataVersion() {
      // Run the scroll action after the DOM is updated with the new data
      this.$nextTick(() => {
        if (!this.pendingScroll) return;
        const action = this.pendingScroll;
        this.pendingScroll = null;
        this.runScrollAction(action);
      });
    },
    loading(isLoading) {
      // The load for the pending scroll failed (no new data): give up the navigation
      if (!isLoading && this.pendingScroll && this.pendingScroll.version === this.dataVersion) {
        this.pendingScroll = null;
        this.releaseNavigation();
      }
    },
  },
  created() {
    // Not reactive: none of these is used in rendering
    this.nowTimer = null;
    this.navIdleTimer = null;
    // Top visible element measured before a re-render, to restore its position after it
    this.scrollAnchor = null;
    // Element scrolled to by the current navigation
    this.navTargetElement = null;
  },
  mounted() {
    // The parent mounts this view once the data of its range is loaded: auto-scroll to now
    this.autoScroll('instant');

    this.nowTimer = setInterval(this.updateNow, NOW_UPDATE_INTERVAL_MS);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('scrollend', this.onScrollEnd);
    window.addEventListener('wheel', this.onUserScrollInput, { passive: true });
    window.addEventListener('touchstart', this.onUserScrollInput, { passive: true });
    window.addEventListener('keydown', this.onKeyDown);
  },
  beforeUnmount() {
    clearInterval(this.nowTimer);
    clearTimeout(this.navIdleTimer);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('scrollend', this.onScrollEnd);
    window.removeEventListener('wheel', this.onUserScrollInput);
    window.removeEventListener('touchstart', this.onUserScrollInput);
    window.removeEventListener('keydown', this.onKeyDown);
  },
  beforeUpdate() {
    // Remember the top visible block so that re-rendering (new data, prepended day, ...)
    // does not move what the user is looking at
    this.scrollAnchor = this.captureScrollAnchor();
  },
  updated() {
    this.restoreScrollAnchor(this.scrollAnchor);
    this.scrollAnchor = null;
  },
  methods: {
    findStellar(stellarId) {
      return findStellar(this.stellars, stellarId);
    },
    updateNow() {
      this.now = nowInScheduleZone();
    },
    onVisibilityChange() {
      if (document.visibilityState === 'visible') this.updateNow();
    },
    onScroll() {
      if (this.navTargetDate !== null) {
        // Keep showing the navigation target; extend the idle timer while the scroll goes on
        if (this.navIdleTimer) this.deferNavigationRelease();
        return;
      }
      this.updateVisibleDate();
    },
    onScrollEnd() {
      // scrollend may also come from another scroll (e.g. the scroll anchor correction of a prepended day),
      // so release only when the navigation target is reached
      if (this.navIdleTimer && this.isNavigationTargetReached()) this.finishNavigation();
    },
    isNavigationTargetReached() {
      const element = this.navTargetElement;
      if (!element?.isConnected) return true;
      const expectedTop = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
      if (Math.abs(element.getBoundingClientRect().top - expectedTop) <= 2) return true;
      // The page cannot scroll further toward the target
      return window.scrollY <= 0 || this.isScrolledToBottom();
    },
    onKeyDown(event) {
      if (SCROLL_KEYS.has(event.key)) this.onUserScrollInput(event);
    },
    // The user scrolls by themselves: stop following the navigation, including one waiting for data
    onUserScrollInput(event) {
      if (this.navTargetDate === null && !this.pendingScroll) return;
      // Tapping (or pressing Space on) ◀ / ▶ / 오늘 is not scrolling: it must not cancel the navigation
      // that the button itself continues, e.g. the second of two quick taps on ▶
      if (event?.target instanceof Element && event.target.closest('.daily-toolbar')) return;
      this.pendingScroll = null;
      this.releaseNavigation();
    },
    // Shows the date in the toolbar until releaseNavigation()
    lockNavigation(date) {
      clearTimeout(this.navIdleTimer);
      this.navIdleTimer = null;
      this.navTargetDate = date;
    },
    deferNavigationRelease() {
      clearTimeout(this.navIdleTimer);
      this.navIdleTimer = setTimeout(this.finishNavigation, NAV_SCROLL_IDLE_MS);
    },
    // The navigation scroll ended: keep showing the target date, even if its header could not reach
    // the top (e.g. the last day of the range). It is recomputed when the user scrolls.
    finishNavigation() {
      this.releaseNavigation(true);
    },
    // Cancelled navigation (user scroll, failed load): show the date at the scroll position
    releaseNavigation(keepTargetDate = false) {
      clearTimeout(this.navIdleTimer);
      this.navIdleTimer = null;
      this.navTargetElement = null;
      if (this.navTargetDate === null) return;
      this.visibleDate = this.navTargetDate;
      this.navTargetDate = null;
      if (!keepTargetDate) this.updateVisibleDate();
    },
    // Height covered by the app bar and the toolbar (where the sticky date header sits)
    getStickyTop() {
      const toolbar = this.$refs.root?.querySelector('.daily-toolbar');
      return toolbar ? toolbar.getBoundingClientRect().bottom : 0;
    },
    updateVisibleDate() {
      const sections = this.$refs.root?.querySelectorAll('.day-section') ?? [];
      const stickyTop = this.getStickyTop();
      let visibleDate = sections[0]?.dataset.anchor ?? this.visibleDate;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= stickyTop + 1) {
          visibleDate = section.dataset.anchor;
        }
      }
      // At the bottom of the page, the header of the last day cannot reach the top.
      // Regard the last day as the current one, so that ▶ loads the next day at once.
      const lastSection = sections[sections.length - 1];
      if (lastSection && this.isScrolledToBottom() && lastSection.getBoundingClientRect().top < window.innerHeight) {
        visibleDate = lastSection.dataset.anchor;
      }
      this.visibleDate = visibleDate;
    },
    // Scrolled down to the end of the page (and the page is scrollable at all)
    isScrolledToBottom() {
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      return window.scrollY > 0 && window.innerHeight + window.scrollY >= scrollingElement.scrollHeight - 1;
    },
    captureScrollAnchor() {
      const stickyTop = this.getStickyTop();
      const elements = this.$refs.root?.querySelectorAll('[data-anchor]') ?? [];
      // Use the first element that starts in the visible area: its position does not depend on
      // the content above it, which may grow (e.g. a prepended day being filled with schedules).
      // Fall back to the last element covering the top of the visible area.
      let anchor = null;
      let covering = null;
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        if (rect.top >= stickyTop) {
          anchor = element;
          break;
        }
        if (rect.bottom > stickyTop) covering = element;
      }
      anchor = anchor ?? covering;
      if (!anchor) return null;
      return { key: anchor.dataset.anchor, top: anchor.getBoundingClientRect().top };
    },
    restoreScrollAnchor(anchor) {
      if (!anchor) return;
      const element = this.findAnchorElement(anchor.key);
      if (!element) return;
      const diff = element.getBoundingClientRect().top - anchor.top;
      if (Math.abs(diff) >= 1) window.scrollBy({ top: diff, behavior: 'instant' });
    },
    // Day sections and schedule blocks are found by data-anchor (date, or "date|block")
    findAnchorElement(key) {
      return this.$refs.root?.querySelector(`[data-anchor="${CSS.escape(key)}"]`) ?? null;
    },
    // Block number counted from today's 00-03 block: negative for past days (yesterday's 21-24 block is -1)
    getBlockOrdinal(date, blockIndex) {
      const dayOffset = Math.round(parseScheduleDate(date).diff(this.today, 'days').days);
      return dayOffset * BLOCKS_PER_DAY + blockIndex;
    },
    getBlockKey(date, blockIndex) {
      return `${date}|${blockIndex}`;
    },
    // Past blocks are dimmed, except the one right before the current block (its streams may still be live)
    isDimmed(date, blockIndex) {
      return this.getBlockOrdinal(date, blockIndex) < this.currentBlockOrdinal - 1;
    },
    isPastDay(date) {
      return parseScheduleDate(date) < this.today;
    },
    // A day off with more to read in the dialog: a remark, or text added to the title (e.g. "휴방 (일본 여행)")
    hasDayOffDetail(schedule) {
      return !!schedule.remark || schedule.title.trim() !== '휴방';
    },
    isEmptyDay(day) {
      return day.dayOffs.length === 0 && day.untimed.length === 0 && day.blocks.length === 0;
    },
    getRelativeDayLabel(date) {
      const offset = Math.round(parseScheduleDate(date).diff(this.today, 'days').days);
      return RELATIVE_DAY_LABELS[offset] ?? '';
    },
    formatDayTitle(date) {
      return DateTime.fromISO(date).setLocale('ko-KR').toFormat('M월 d일 (ccc)');
    },
    formatBlockRange(blockIndex) {
      const pad = hour => String(hour).padStart(2, '0');
      return `${pad(blockIndex * BLOCK_HOURS)}시 ~ ${pad((blockIndex + 1) * BLOCK_HOURS)}시`;
    },
    scrollToElement(element, behavior) {
      element?.scrollIntoView({ block: 'start', behavior });
    },
    // Scrolls to the element while showing the date in the toolbar until the scroll ends
    navigateTo(date, element, behavior) {
      this.lockNavigation(date);
      this.navTargetElement = element ?? null;
      this.scrollToElement(element, behavior);
      // Released by scrollend, or when no scroll event follows (also when there was nothing to scroll)
      this.deferNavigationRelease();
    },
    scrollToDate(date, behavior = 'smooth') {
      this.navigateTo(date, this.findAnchorElement(date), behavior);
    },
    autoScroll(behavior = 'smooth') {
      const target = this.nowTarget;
      if (target) {
        this.navigateTo(
          target.date,
          this.findAnchorElement(this.getBlockKey(target.date, target.index)),
          behavior,
        );
      } else {
        this.scrollToDate(toISODate(this.today), behavior);
      }
    },
    runScrollAction(action) {
      if (action.type === 'auto') this.autoScroll();
      else if (action.type === 'date') this.scrollToDate(action.date);
    },
    // Runs the scroll action now if the date is in the range; otherwise extends the range
    // and runs it after the data of the new range is loaded
    scrollWithinRange(date, action) {
      if (date >= this.startDate && date <= this.endDate) {
        this.runScrollAction(action);
        return;
      }
      this.requestRangeForScroll({
        start: date < this.rangeStart ? date : this.rangeStart,
        end: date > this.rangeEnd ? date : this.rangeEnd,
      }, action);
    },
    // The parent applies the new range together with its data, then the action runs (see dataVersion)
    requestRangeForScroll(range, action) {
      this.pendingScroll = { ...action, version: this.dataVersion };
      this.$emit('update:range', range);
    },
    goToday() {
      this.updateNow();
      const today = toISODate(this.today);
      this.lockNavigation(today);
      // Include the block right before the current one (yesterday's 21-24 block at 00-03)
      const start = toISODate(this.today.minus({ days: 1 }));
      if (start < this.rangeStart) {
        this.requestRangeForScroll({ start, end: today > this.rangeEnd ? today : this.rangeEnd }, { type: 'auto' });
        return;
      }
      this.scrollWithinRange(today, { type: 'auto' });
    },
    jumpByDays(days) {
      // Count from the date being navigated to, so that quick repeated clicks are not lost
      const baseDate = this.navTargetDate ?? this.visibleDate;
      const date = toISODate(DateTime.fromISO(baseDate).plus({ days }));
      this.lockNavigation(date);
      this.scrollWithinRange(date, { type: 'date', date });
    },
    prependDay() {
      // The scroll position is kept by the scroll anchor
      this.$emit('update:range', { start: this.previousDate, end: this.rangeEnd });
    },
    appendDay() {
      this.$emit('update:range', { start: this.rangeStart, end: this.nextDate });
    },
  },
};
</script>

<style scoped>
.daily-schedule-view {
  --app-bar-height: 64px;
  --toolbar-height: 52px;
  --day-header-height: 44px;
}

.daily-toolbar {
  position: sticky;
  top: var(--app-bar-height);
  z-index: 3;
  display: flex;
  align-items: center;
  height: var(--toolbar-height);
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.toolbar-date {
  font-weight: 500;
}

.toolbar-progress {
  position: absolute;
  left: 0;
  bottom: -1px;
}

.day-section {
  scroll-margin-top: calc(var(--app-bar-height) + var(--toolbar-height));
  margin-bottom: 24px;
}

.day-header {
  position: sticky;
  top: calc(var(--app-bar-height) + var(--toolbar-height));
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--day-header-height);
  padding: 0 4px;
  font-size: 1.25rem;
  font-weight: 700;
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

.relative-day-label {
  padding: 0 8px;
  border-radius: 999px;
  font-size: 0.8125rem;
  color: #fff;
  background-color: rgb(var(--v-theme-primary));
}

.day-off-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 12px 4px 4px;
}

.day-off-label {
  margin-right: 4px;
  font-size: 0.875rem;
  font-weight: 700;
}

.day-off-chip-button {
  max-width: 100%;
  border-radius: 999px;
  cursor: pointer;
}

.schedule-block {
  scroll-margin-top: calc(var(--app-bar-height) + var(--toolbar-height) + var(--day-header-height));
  padding: 20px 4px 4px;
}

/* Between the day header (20px) and the card titles (16px) */
.block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 1.0625rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* A line to the right marks where the next time block starts */
.block-header::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.12);
}

.block-icon {
  margin-right: -2px;
  color: rgba(0, 0, 0, 0.6);
}

.now-badge {
  padding: 0 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: #fff;
  background-color: rgb(var(--v-theme-error));
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: 8px;
}

.dimmed {
  opacity: 0.5;
}

.empty-day {
  padding: 16px 4px;
}
</style>
