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
      v-if="!mobile"
    >
      {{ schedule.stellarNameKor }}: {{ `${schedule.isFixedTime ? time : ""} ${schedule.title}` }}
    </v-tooltip>
    <v-dialog
      v-model="dialog"
      activator="parent"
      width="600px"
    >
      <ScheduleDialog
        v-if="loginInfo.isLoggedIn"
        @close="dialog = false"
        @modified="onModified"
        @removed="onRemoved"
        :stellars="stellars"
        :schedule="schedule"
      ></ScheduleDialog>
      <ScheduleDetailDialog
        v-else
        @close="dialog = false"
        :schedule="schedule"
      ></ScheduleDetailDialog>
    </v-dialog>
  </p>
</template>

<script>
import { DateTime } from "luxon";
import { COLOR_ARRAY, STELLIVE_COLOR_DARK, LOGIN_INFO_KEY } from "@/utils/consts";
import ScheduleDialog from "./ScheduleDialog.vue";
import ScheduleDetailDialog from "./ScheduleDetailDialog.vue";
import { useDisplay } from "vuetify";

export default {
  props: ["stellars", "schedule"],
  emits: ["modified", "removed"],
  inject: {
    loginInfo: {
      from: LOGIN_INFO_KEY,
    }
  },
  setup() {
    const { mobile } = useDisplay();
    return { mobile };
  },
  data() {
    return {
      color: COLOR_ARRAY[this.schedule.stellarId-1] ?? STELLIVE_COLOR_DARK,
      dialog: false
    }
  },
  methods: {
    onModified() {
      this.dialog = false;
      this.$emit('modified');
    },
    onRemoved() {
      this.dialog = false;
      this.$emit('removed');
    }
  },
  computed: {
    time() {
      return DateTime.fromISO(this.schedule.startDateTime).toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23'});
    }
  },
  components: { ScheduleDialog, ScheduleDetailDialog }
}
</script>

<style scoped>
p {
  cursor: pointer;
}
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
