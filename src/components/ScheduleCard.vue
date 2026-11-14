<template>
  <v-card
    class="schedule-card"
    :class="{ 'schedule-card--dimmed': dimmed }"
    variant="outlined"
    tabindex="0"
    role="button"
    @click="select"
    @keydown.enter.prevent="select"
    @keydown.space.prevent="select"
  >
    <div class="card-header">
      <StellarNameChip
        :stellar="stellar"
        :fallbackName="schedule.stellarNameKor"
        :dimmed="dimmed"
      />
      <!-- Time-not-fixed schedules are in the "시간 미정" block, which tells it already -->
      <span v-if="schedule.isFixedTime" class="time-span">{{ time }}</span>
    </div>
    <div class="title-div">{{ schedule.title }}</div>
    <div v-if="schedule.remark" class="remark-div">{{ schedule.remark }}</div>
  </v-card>
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
  methods: {
    select(event) {
      // Holding Enter / Space repeats keydown: open only once
      if (event?.repeat) return;
      this.$emit('select', this.schedule);
    },
  },
};
</script>

<style scoped>
.schedule-card {
  padding: 10px 12px;
  border-color: rgba(0, 0, 0, 0.12);
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
