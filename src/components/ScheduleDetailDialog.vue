<template>
  <v-card>
    <v-card-title class="py-4">
      <span class="text-h5">스케줄 상세</span>
    </v-card-title>
    <v-card-text class="py-12">
      <v-container>
        <v-row>
          <v-col 
            cols="12"
            md="6"
            lg="6"
            xl="6"
          >
            <v-text-field 
              label="스텔라"
              :value="schedule.stellarNameKor"
              readonly
              persistent-placeholder
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="6"
            lg="6"
            xl="6"
          >
            <v-text-field 
              label="방송 시작 일시"
              :value="dateText"
              readonly
              persistent-placeholder
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field 
              label="제목"
              :value="schedule.title"
              readonly
              persistent-placeholder
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field 
              label="비고"
              :value="schedule.remark"
              readonly
              persistent-placeholder
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        @click="closeDialog"
      >
        닫기
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { DateTime } from "luxon";

export default {
  props: ["schedule"],
  emits: ["close"],
  data() {
    let formatOpts = { 
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    if (this.schedule.isFixedTime) {
      formatOpts = {
        ...formatOpts,
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
      };
    }
    const date = DateTime.fromISO(this.schedule.startDateTime)
      .setLocale("ko-KR")
      .toLocaleString(formatOpts);
    return {
      date,
    }
  },
  computed: {
    dateText() {
      return this.date + (!this.schedule.isFixedTime ? " (시간 미정)" : "");
    }
  },
  methods: {
    closeDialog() {
      this.$emit("close");
    },
  },
}
</script>
