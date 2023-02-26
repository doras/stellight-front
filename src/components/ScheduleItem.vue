<template>
  <p class="d-inline-block text-truncate w-100"
      :style="{ '--item-color': color }"
      :class="{fixed: schedule.isFixedTime}"
    >
      <span 
        v-if="schedule.isFixedTime"
      >
        <v-icon 
          icon="mdi-circle-medium"
        ></v-icon>
        {{ time }}
      </span>
      {{ schedule.title }}
      <v-tooltip
        activator="parent"
        location="top"
      >
        {{ schedule.stellarNameKor }}: {{ schedule.title }}
      </v-tooltip>
    </p>
</template>

<script>
import { DateTime } from "luxon";
import { COLOR_ARRAY, STELLIVE_COLOR_DARK } from "../utils/consts";

export default {
  props: ["schedule"],
  data() {
    return {
      color: COLOR_ARRAY[this.schedule.stellarId-1] ?? STELLIVE_COLOR_DARK,
      time: DateTime.fromISO(this.schedule.startDateTime).toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23'})
    }
  },
}
</script>

<style scoped>
p.fixed {
  color: var(--item-color);
}

p:not(.fixed) {
  width: 100%;
  background-color: white;
  color: white;
  float: left;
  padding-left: 5px;
  padding-right: 10px;
  position: relative;
  z-index: 10;
}

p:not(.fixed):after {
  background-color: var(--item-color);
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 10px;
  bottom: 0;
  z-index: -1;
}
</style>
