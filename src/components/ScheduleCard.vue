<template>
  <v-card
    class="schedule-card"
    variant="outlined"
    @click="$emit('select', schedule)"
  >
    <div class="card-header">
      <StellarNameChip
        :stellar="stellar"
        :fallbackName="schedule.stellarNameKor"
      />
      <span v-if="showTime" class="time-span">{{ schedule.isFixedTime ? time : '시간 미정' }}</span>
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
    // Hidden where the block header already tells it ("시간 미정")
    showTime: {
      type: Boolean,
      default: true,
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
</style>
