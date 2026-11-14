<template>
  <v-container
    class="schedules-view-container"
    :class="{ 'schedules-view-container--daily': isDailyView }"
  >
    <v-alert
      style="margin-bottom: 32px;"
      color="error"
      icon="$error"
      :text="errorMsg"
      v-if="isError"
    ></v-alert>
    <!-- Floating, so that the alerts are visible wherever the page is scrolled -->
    <div class="floating-alerts">
      <TransitionGroup name="fade">
        <v-alert
          v-for="item in alertList"
          :key="item.key"
          class="mb-2"
          elevation="4"
          :color="item.color"
          :icon="`\$${item.color}`"
          :text="item.text"
        ></v-alert>
      </TransitionGroup>
    </div>
    <v-row>
      <v-col>
        <!-- Mounted once the data of the range is loaded, so that it does not show the days empty -->
        <template v-if="isDailyView">
          <DailyScheduleView
            v-if="isDailyDataReady"
            :stellars="stellars"
            :schedules="filteredSchedules"
            :startDate="dayRange.start"
            :endDate="dayRange.end"
            :dataVersion="dataVersion"
            :loading="isLoadingSchedules"
            :requestedRange="pendingDayRange"
            @select="openScheduleDialog"
            @update:range="onDayRangeUpdated"
          />
          <!-- Only while loading (the stellars, then the schedules): on an error, the error alert is shown -->
          <v-progress-linear
            v-else-if="isLoadingStellars || isLoadingSchedules"
            indeterminate
            color="primary"
          />
        </template>
        <Calendar
          v-else
          :masks="masks"
          :attributes="attributes"
          expanded
          class="mx-auto w-100 calendar"
          :class="calendarView"
          ref="calendar"
          @transition-end="loadSchedules"
          :view="calendarView"
        >
          <template v-slot:day-content="{ day, attributes }">
            <div class="day-div">
              <span :class='{ "today" : day.isToday }'>
                {{ day.day }}
                <!-- In weekly view and sm or xs device, show day name -->
                <span v-if="calendarView === 'weekly' && mdAndDown">
                  ({{ day.locale.dayNamesShort[day.weekday-1] }})
                </span>
              </span>
              <div class="text-body-2">
                <ScheduleItem
                  v-for="attr in attributes"
                  :key="attr.key"
                  :stellars="stellars"
                  :schedule="attr.customData.schedule"
                  @modified="onModifiedSchedule"
                  @removed="onRemovedSchedule"
                ></ScheduleItem>
              </div>
            </div>
          </template>
        </Calendar>
      </v-col>
    </v-row>
  </v-container>
  <!--
    scroll-strategy="none": Vuetify 3.1's scroll blocking makes the stellar select menu open far below
    on its first opening when the page is scrolled (fixed in Vuetify 3.3, remove this with #131). The page is locked by
    isPageScrollLocked instead.
  -->
  <v-dialog
    v-model="dialog"
    width="600px"
    persistent
    scroll-strategy="none"
  >
    <ScheduleDialog
      @close="dialog = false"
      @saved="onSavedSchedule"
      :stellars="stellars"
    ></ScheduleDialog>
  </v-dialog>
  <!--
    Settings as an overlay, so that it shows up wherever the page is scrolled and keeps the scroll position.
    A bottom sheet on small screens (near the FAB, full width), a right drawer otherwise.
  -->
  <v-navigation-drawer
    v-model="showSettings"
    temporary
    touchless
    :location="smAndDown ? 'bottom' : 'right'"
    :width="smAndDown ? settingsSheetHeight : 340"
    class="settings-drawer"
    :class="{ 'settings-drawer--sheet': smAndDown }"
  >
    <div class="settings-drawer-header">
      <span class="text-h6">보기 설정</span>
      <v-btn
        icon="$close"
        variant="text"
        density="comfortable"
        aria-label="닫기"
        @click="showSettings = false"
      />
    </div>
    <ScheduleSettingsPanel
      v-model:calendarView="calendarView"
      :calendarViewOptions="calendarViewOptions"
      :stellars="stellars"
      v-model:stellarIds="stellarIds"
      v-model:allStellarChecked="allStellarChecked"
      :saveFilter="saveFilter"
      :columns="smAndDown ? 2 : 1"
    />
  </v-navigation-drawer>
  <!-- One-time notice for existing users switched to the default view by the settings migration -->
  <v-dialog
    :model-value="showDefaultViewNotice"
    @update:model-value="value => !value && dismissDefaultViewNotice()"
    max-width="440px"
    scroll-strategy="none"
  >
    <!-- scroll-strategy="none": the auto-scroll of the daily view behind it must not be blocked -->
    <v-card class="keep-all">
      <v-card-title class="pt-5 px-6">새로운 기본 보기</v-card-title>
      <v-card-text class="px-6">
        <p class="mb-3">스케줄을 날짜별 카드로 한눈에 볼 수 있는 기본 보기가 추가되었습니다.</p>
        <p>기존 주간/월간 캘린더는 오른쪽 아래 톱니바퀴 버튼(보기 설정)에서 선택할 수 있습니다.</p>
      </v-card-text>
      <v-card-actions class="px-6 pb-4">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="flat" @click="dismissDefaultViewNotice">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Single dialog for the daily view, shared by the cards and the day-off chips -->
  <v-dialog
    v-model="scheduleDialog"
    width="600px"
  >
    <!-- The dialogs read the schedule only when created, so re-create them each time the dialog opens -->
    <ScheduleDialog
      v-if="selectedSchedule && loginInfo.isLoggedIn"
      :key="`edit-${scheduleDialogSeq}`"
      @close="scheduleDialog = false"
      @modified="onModifiedSchedule"
      @removed="onRemovedSchedule"
      :stellars="stellars"
      :schedule="selectedSchedule"
    ></ScheduleDialog>
    <ScheduleDetailDialog
      v-else-if="selectedSchedule"
      :key="`detail-${scheduleDialogSeq}`"
      @close="scheduleDialog = false"
      :schedule="selectedSchedule"
    ></ScheduleDetailDialog>
  </v-dialog>
  <div
    class="schedules-view-fab"
    :class="loginInfo.isLoggedIn ? 'schedules-view-fab--stacked-above' : 'schedules-view-fab--lower'"
  >
    <v-tooltip text="보기 설정" location="start" :disabled="isTouchDevice">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :icon="showSettings ? '$close' : '$cogOutline'"
          color="surface-variant"
          size="large"
          @click="toggleSettingsPanel"
        />
      </template>
    </v-tooltip>
  </div>
  <div
    class="schedules-view-fab schedules-view-fab--lower"
    v-if="loginInfo.isLoggedIn"
  >
    <v-btn
      icon="$plus"
      color="primary"
      size="large"
      @click="openDialogCreation"
    />
  </div>
</template>

<script>
import { Calendar } from 'v-calendar';
import { DateTime } from 'luxon';
import ScheduleItem from '@/components/ScheduleItem.vue';
import { 
  STELLARS_API_URL, 
  SCHEDULES_API_URL, 
  LOGIN_INFO_KEY, 
  LS_KEY_SCHEDULE_FILTER_STELLAR_IDS, 
  LS_KEY_SCHEDULE_FILTER_LAST_ADDED_STELLAR_ID,
  LS_KEY_CALENDAR_VIEW_MODE,
  LS_KEY_DEFAULT_VIEW_NOTICE,
  VIEW_MODE_DEFAULT,
  VIEW_MODE_WEEKLY,
  VIEW_MODE_MONTHLY,
} from '@/utils/consts';
import ScheduleDialog from '@/components/ScheduleDialog.vue';
import ScheduleDetailDialog from '@/components/ScheduleDetailDialog.vue';
import DailyScheduleView from '@/components/DailyScheduleView.vue';
import { formatDateTime, isTouchDevice, getStellarGroupRank, nowInScheduleZone, parseScheduleDate } from '@/utils/common';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storage';
import { useDisplay } from 'vuetify';
import ScheduleSettingsPanel from '@/components/ScheduleSettingsPanel.vue';

let alertKey = 0;

// Error message with the server's message when there is one (none on network errors)
function formatErrorMessage(text, error) {
  const detail = error.response?.data?.message;
  return detail ? `${text} ${detail}` : text;
}

// Yesterday, today, and tomorrow (in the time zone of the schedules)
function getInitialDayRange() {
  const today = nowInScheduleZone().startOf('day');
  return {
    start: today.minus({ days: 1 }).toISODate(),
    end: today.plus({ days: 1 }).toISODate(),
  };
}

export default {
    inject: {
      loginInfo: {
        from: LOGIN_INFO_KEY,
      }
    },
    data() {
      const { mdAndDown, smAndDown, height } = useDisplay();
      const calendarViewOptions = [
        { title: "기본", value: VIEW_MODE_DEFAULT },
        { title: "주간", value: VIEW_MODE_WEEKLY },
        { title: "월간", value: VIEW_MODE_MONTHLY },
      ];
      const storedCalendarView = getStorageItem(LS_KEY_CALENDAR_VIEW_MODE);
      return {
        masks: {
          title: "YYYY년 MMM",
          weekdays: "WWW",
        },
        stellars: [],
        stellarIds: [],
        isError: false,
        errorMsg: "",
        schedules: [],
        dialog: false,
        scheduleDialog: false,
        selectedSchedule: null,
        scheduleDialogSeq: 0,
        dayRange: getInitialDayRange(),
        // Range requested for the daily view and not applied yet (see loadSchedules)
        pendingDayRange: null,
        isDailyDataReady: false,
        dataVersion: 0,
        isLoadingSchedules: false,
        isLoadingStellars: false,
        showDefaultViewNotice: !!getStorageItem(LS_KEY_DEFAULT_VIEW_NOTICE),
        alertList: [],
        calendarView: calendarViewOptions.some(item => item.value === storedCalendarView) ? storedCalendarView : VIEW_MODE_DEFAULT,
        calendarViewOptions,
        mdAndDown,
        smAndDown,
        displayHeight: height,
        showSettings: false,
        isTouchDevice,
      };
    },
    created() {
      // Sequence of the schedule requests, to ignore responses of older ones (not reactive: not used in rendering)
      this.scheduleRequestSeq = 0;
      this.fetchStellarsAndInitFilter();
    },
    components: { Calendar, ScheduleItem, ScheduleDialog, ScheduleDetailDialog, ScheduleSettingsPanel, DailyScheduleView },
    methods: {
      async fetchStellarsAndInitFilter() {
        this.isLoadingStellars = true;
        try {
          const response = await this.$axios.get(STELLARS_API_URL);
          const sortedData = this.sortStellars(response.data);
          this.stellars = sortedData;

          this.initFilter();
          this.loadSchedules();
        }
        catch (error) {
          this.noticeError(formatErrorMessage("스텔라 목록 조회 중 오류가 발생했습니다.", error));
          console.log(error);
        }
        finally {
          this.isLoadingStellars = false;
        }
      },
      sortStellars(data) {
        return [...data].sort((a, b) => {
          const groupDiff = getStellarGroupRank(a) - getStellarGroupRank(b);
          if (groupDiff !== 0) return groupDiff;
          if (a.generation !== b.generation) return a.generation - b.generation;
          return a.debutOrder - b.debutOrder;
        });
      },
      initFilter() {
        // load filter info from local storage and set the filter to it
        // if it is not stored yet, all stellar filter should be selected by default (except the case of empty array in local storage)
        const storedIds = getStorageItem(LS_KEY_SCHEDULE_FILTER_STELLAR_IDS);
        if (storedIds) {
          this.stellarIds = this.getFilteredStellarIds(storedIds);

          // if there are any new stellars added after the last filter save, add them to the filter and save the updated filter
          const lastAddedStellarId = this.getLastAddedStellarId();
          const maxStellarId = this.stellars.length > 0 ? Math.max(...this.stellars.map(s => s.id)) : 0;
          if (maxStellarId > lastAddedStellarId) {
            this.addNewStellarsToFilter(lastAddedStellarId, maxStellarId);
            this.saveFilter(); // save the updated filter to local storage
          }
        } else {
          this.stellarIds = this.stellars.map(s => s.id);
        }
      },
      getFilteredStellarIds(storedIdJson) {
        try {
          const parsedStellarIds = JSON.parse(storedIdJson);
          const parsedSet = new Set(parsedStellarIds);
          return this.stellars.map(s => s.id).filter(id => parsedSet.has(id));
        }
        catch (e) {
          console.error("Error parsing stellarIds from localStorage:", e);
          return this.stellars.map(s => s.id);
        }
      },
      getLastAddedStellarId() {
        // load the last added stellar id from local storage
        const lastAddedIdStr = getStorageItem(LS_KEY_SCHEDULE_FILTER_LAST_ADDED_STELLAR_ID);
        const lastAddedId = parseInt(lastAddedIdStr, 10);

        // if NaN, regard it as 12 which is the last added stellar id when this code is written
        return isNaN(lastAddedId) ? 12 : lastAddedId;
      },
      addNewStellarsToFilter(lastAddedId, maxId) {
        const validStellarIds = new Set(this.stellars.map(s => s.id));
        const newStellarIds = [];
        for (let i = lastAddedId + 1; i <= maxId; i++) {
          if (validStellarIds.has(i)) {
            newStellarIds.push(i);
          }
        }
        this.stellarIds = [...new Set([...this.stellarIds, ...newStellarIds])];
      },

      // Range of the schedules to load for the current view, or null if it is not ready yet
      getScheduleRange(dayRange) {
        if (this.calendarView === VIEW_MODE_DEFAULT) {
          return {
            firstDateTime: parseScheduleDate(dayRange.start),
            lastDateTime: parseScheduleDate(dayRange.end).endOf("day"),
          };
        }
        return this.getCalendarRange();
      },
      getCalendarRange() {
        const page = this.$refs.calendar?.firstPage;
        if (!page) return null;

        // if calendar is weekly
        if (this.calendarView === VIEW_MODE_WEEKLY) {
          const viewDays = page.viewDays;
          return {
            firstDateTime: DateTime.fromJSDate(viewDays[0].date),
            lastDateTime: DateTime.fromJSDate(viewDays[viewDays.length - 1].date).endOf("day"),
          };
        }
        // if calendar is monthly
        const firstDateTime = DateTime.local(page.year, page.month);
        return {
          firstDateTime,
          lastDateTime: firstDateTime.endOf("month"),
        };
      },
      // nextDayRange: a new range for the daily view. It is applied together with its data,
      // so that the view does not show the new days empty while loading.
      loadSchedules(nextDayRange = null) {
        // A reload (e.g. after saving a schedule) keeps a range extension that is still loading
        if (nextDayRange) this.pendingDayRange = nextDayRange;
        const dayRange = this.pendingDayRange ?? this.dayRange;
        const range = this.getScheduleRange(dayRange);
        if (!range) return;
        const { firstDateTime, lastDateTime } = range;

        const params = {
          startDateTimeAfter: formatDateTime(firstDateTime),
          startDateTimeBefore: formatDateTime(lastDateTime),
          size: 1000, // limit the number of schedules to 1000
        };

        const vm = this;
        // Ignore responses of older requests (e.g. the range or the view changed in the meantime)
        const requestSeq = ++this.scheduleRequestSeq;
        this.isLoadingSchedules = true;
        this.$axios.get(SCHEDULES_API_URL, { params })
          .then(response => {
            if (requestSeq !== vm.scheduleRequestSeq) return;
            // A successful load makes earlier load errors stale
            vm.isError = false;
            vm.alertList = vm.alertList.filter(alert => alert.color !== "error");
            if (vm.calendarView === VIEW_MODE_DEFAULT) {
              vm.dayRange = dayRange;
              vm.isDailyDataReady = true;
            }
            const stellarRankMap = new Map(vm.stellars.map((s, idx) => [s.id, idx]));
            vm.schedules = response.data.content.map(elem => {
              elem.jsDate = DateTime.fromISO(elem.startDateTime).toJSDate();
              return elem;
            }).sort((a, b) => {
              // fixed time first
              if (a.isFixedTime !== b.isFixedTime) return b.isFixedTime - a.isFixedTime;

              // sort by date time
              if (a.jsDate.getTime() !== b.jsDate.getTime()) return a.jsDate.getTime() - b.jsDate.getTime();

              // sort by stellar group rank
              const rankA = stellarRankMap.has(a.stellarId) ? stellarRankMap.get(a.stellarId) : Infinity;
              const rankB = stellarRankMap.has(b.stellarId) ? stellarRankMap.get(b.stellarId) : Infinity;
              return rankA - rankB || 0;
            });
            vm.dataVersion++;
          })
          .catch(error => {
            if (requestSeq !== vm.scheduleRequestSeq) return;
            const message = formatErrorMessage("스케줄 목록 조회 중 오류가 발생했습니다.", error);
            if (vm.isDailyView && vm.isDailyDataReady) {
              // The daily view is shown, possibly scrolled far down: a floating alert stays visible
              // and does not push the view down like the alert at the page top
              vm.pushAlert(message, "error", 5000);
            } else {
              vm.noticeError(message);
            }
            console.log(error);
          })
          .finally(() => {
            if (requestSeq !== vm.scheduleRequestSeq) return;
            vm.isLoadingSchedules = false;
            vm.pendingDayRange = null;
          });
      },
      noticeError(errorMsg) {
        this.isError = true;
        this.errorMsg = errorMsg;
      },
      openDialogCreation() {
        this.dialog = true;
      },
      openScheduleDialog(schedule) {
        this.selectedSchedule = schedule;
        this.scheduleDialogSeq++;
        this.scheduleDialog = true;
      },
      onDayRangeUpdated(range) {
        // Re-fetch the whole range (the data is small)
        this.loadSchedules(range);
      },
      dismissDefaultViewNotice() {
        this.showDefaultViewNotice = false;
        removeStorageItem(LS_KEY_DEFAULT_VIEW_NOTICE);
      },
      toggleSettingsPanel() {
        this.showSettings = !this.showSettings;
      },
      setPageScrollLocked(locked) {
        document.documentElement.classList.toggle('page-scroll-locked', locked);
      },
      onSavedSchedule() {
        this.dialog = false;
        this.pushAlert("스케줄이 등록되었습니다.");
        this.loadSchedules();
      },
      onModifiedSchedule() {
        this.dialog = false;
        this.scheduleDialog = false;
        this.pushAlert("스케줄이 수정되었습니다.");
        this.loadSchedules();
      },
      onRemovedSchedule() {
        this.dialog = false;
        this.scheduleDialog = false;
        this.pushAlert("스케줄이 삭제되었습니다.");
        this.loadSchedules();
      },
      pushAlert(text, color = "success", duration = 3000) {
        const key = alertKey++;
        this.alertList.push({
          key,
          text,
          color,
        });
        // duration(기본 3초) 뒤 자동으로 alert 제거
        setTimeout(() => {
          this.alertList = this.alertList.filter(alert => alert.key !== key);
        }, duration);
      },
      saveFilter() {
        // Save the selected stellar ids and the last added stellar id to localStorage
        setStorageItem(LS_KEY_SCHEDULE_FILTER_STELLAR_IDS, JSON.stringify(this.stellarIds));

        const maxStellarId = this.stellars.length > 0 ? Math.max(...this.stellars.map(s => s.id)) : 0;
        setStorageItem(LS_KEY_SCHEDULE_FILTER_LAST_ADDED_STELLAR_ID, maxStellarId.toString());
      },
    },
    computed: {
      allStellarChecked: {
        get() {
          return this.stellarIds.length === this.stellars.length;
        },
        set(newValue) {
          if (newValue) {
            this.stellarIds = this.stellars.map(s => s.id);
          } else {
            this.stellarIds = [];
          }
        }
      },
      // Up to 70% of the screen, so that the filtered result stays visible above the sheet.
      // Capped so that a tall screen (e.g. a tablet) does not get a mostly empty sheet.
      settingsSheetHeight() {
        return Math.min(Math.round(this.displayHeight * 0.7), 600);
      },
      isSettingsSheetOpen() {
        return this.showSettings && this.smAndDown;
      },
      // Overlays that lock the page with the page-scroll-locked class instead of Vuetify's scroll blocking
      isPageScrollLocked() {
        return this.isSettingsSheetOpen || this.dialog;
      },
      isDailyView() {
        return this.calendarView === VIEW_MODE_DEFAULT;
      },
      filteredSchedules() {
        const stellarIdSet = new Set(this.stellarIds);
        return this.schedules.filter(elem => stellarIdSet.has(elem.stellarId));
      },
      attributes() {
        return this.filteredSchedules.map((elem, idx) => ({
          key: elem.id,
          customData: {
            schedule: elem,
          },
          dates: elem.jsDate,
          order: idx,
        }))
      }
    },
    beforeUnmount() {
      this.setPageScrollLocked(false);
    },
    watch: {
      // Lock the page behind the bottom sheet, so that swiping on the scrim or a sheet with nothing
      // to scroll does not move the page (not behind the drawer on larger screens: its content contains
      // the scrolling), and behind the creation dialog (see its scroll-strategy).
      isPageScrollLocked(locked) {
        this.setPageScrollLocked(locked);
      },
      calendarView(newValue) {
        // Save the most recently set calendar view mode to localStorage
        setStorageItem(LS_KEY_CALENDAR_VIEW_MODE, newValue);
        // Drop a request of the previous view still in flight: its data must not land in the new view,
        // also when the calendar is not ready yet and no new request is sent right away
        this.scheduleRequestSeq++;
        this.isLoadingSchedules = false;
        this.pendingDayRange = null;
        if (newValue === VIEW_MODE_DEFAULT) {
          // Start again from yesterday-tomorrow; the daily view mounts (and auto-scrolls) once it is loaded
          this.isDailyDataReady = false;
          this.loadSchedules(getInitialDayRange());
          return;
        }
        // Wait for the calendar to be mounted when switching from the daily view
        this.$nextTick(() => this.loadSchedules());
      }
    }
};
</script>

<style scoped>
.schedules-view-container {
  padding-top: 128px;
  padding-bottom: 64px;
}

/* Keep the last cards above the floating buttons */
.schedules-view-container--daily {
  padding-top: 96px;
  padding-bottom: 200px;
}

.day-div {
  min-height: 100px;
}

.keep-all {
  word-break: keep-all;
}

.settings-drawer-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 8px 16px;
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}



/* Below the app bar and the toolbar of the daily view */
.floating-alerts {
  position: fixed;
  top: 128px;
  left: 50%;
  transform: translateX(-50%);
  width: min(600px, calc(100% - 32px));
  z-index: 6;
  pointer-events: none;
}

.schedules-view-fab {
  position: fixed;
  right: 50px;
  /* Above the sticky toolbar and date headers of the daily view */
  z-index: 5;
}

.schedules-view-fab--stacked-above {
  bottom: 130px;
}

.schedules-view-fab--lower {
  bottom: 50px;
}

.today {
  background-color: #87a9ed;
  border-radius: 25px;
  color: #fff;
  padding: 3px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>

<!--
  Not scoped: v-navigation-drawer renders multiple root nodes, so it does not get the scope attribute
  and scoped rules on .settings-drawer would not apply.
-->
<style>
.settings-drawer--sheet {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

/* Scrolling past the end of the panel must not scroll the page behind it */
.settings-drawer .v-navigation-drawer__content {
  overscroll-behavior: contain;
}
</style>
