<template>
  <!-- A native button, like the day-off chips: focusable and opened with Enter / Space by the browser.
       Not a v-card, which renders a div (its loader) that a button may not contain. -->
  <button
    type="button"
    class="schedule-card"
    :class="{ 'schedule-card--dimmed': dimmed }"
    @click="$emit('select', schedule)"
  >
    <span class="card-header">
      <StellarNameChip
        :stellar="stellar"
        :fallbackName="schedule.stellarNameKor"
        :dimmed="dimmed"
      />
      <span v-if="schedule.isFixedTime" class="time-span">{{ time }}</span>
      <!-- Shown by the "시간 미정" block header; read for screen readers, which read the card on its own -->
      <span v-else class="d-sr-only">시간 미정</span>
    </span>
    <span class="title-div">{{ schedule.title }}</span>
    <span v-if="schedule.remark" class="remark-div">{{ schedule.remark }}</span>
  </button>
</template>

<script>
import StellarNameChip from '@/components/StellarNameChip.vue';
import { formatScheduleTime } from '@/utils/common';

export default {
  name: 'ScheduleCard',
  components: { StellarNameChip },
  props: {
    // The stellar of the schedule (null if not found)
    stellar: {
      type: Object,
      default: null,
    },
    schedule: {
      type: Object,
      required: true,
    },
    // Past schedule: faded
    dimmed: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select'],
  computed: {
    time() {
      return formatScheduleTime(this.schedule.startDateTime);
    },
  },
};
</script>

<style scoped>
/* Flex column: a button centers its content vertically, which shows when the card is stretched to its grid row */
.schedule-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background-color: rgb(var(--v-theme-surface));
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: background-color 0.2s;
}

.schedule-card:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.schedule-card:focus-visible {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
}

.schedule-card:active {
  background-color: rgba(var(--v-theme-on-surface), 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.time-span {
  flex-shrink: 0;
  font-size: 0.875rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.title-div {
  word-break: keep-all;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.remark-div {
  margin-top: 4px;
  font-size: 0.875rem;
  opacity: 0.7;
  word-break: keep-all;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.schedule-card--dimmed {
  border-color: rgba(0, 0, 0, 0.06);
}

.schedule-card--dimmed .time-span,
.schedule-card--dimmed .title-div {
  opacity: 0.5;
}

.schedule-card--dimmed .remark-div {
  opacity: 0.4;
}
</style>
