<template>
  <v-card>
    <v-card-title class="py-4">
      <span class="text-h5">스케줄 {{ mode === "modify" ? "수정" : "추가" }}</span>
    </v-card-title>
    <v-card-text class="py-12">
      <v-alert
        style="margin-bottom: 32px;"
        color="error"
        icon="$error"
        :text="errorMsg"
        v-if="isError"
      ></v-alert>
      <v-form ref="form">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-select
                label="스텔라 선택*"
                v-model="stellar"
                :items="stellars"
                item-title="nameKor"
                item-value="id"
                :rules="[requiredRule]"
                :disabled="mode === 'modify'"
              ></v-select>
            </v-col>
            <v-col
              cols="12"
              md="6"
              lg="6"
              xl="6"
            >
              <v-checkbox 
                label="시간 미정" 
                v-model="isTimeNotFixed"
                density="compact"
              ></v-checkbox>
            </v-col>
            <v-col
              cols="12"
              md="6"
              lg="6"
              xl="6"
            >
              <DatePicker
                v-model.string="date"
                :mode="isTimeNotFixed ? 'date' : 'dateTime'"
                is24hr
                :rules="datepickerRules"
                is-required
                :masks="masks"
                hide-time-header
              >
                <template v-slot="{ inputValue, inputEvents }">
                  <v-text-field
                    label="방송 시작 일시*"
                    persistent-placeholder
                    placeholder="ex) 2023.02.14 19:00"
                    :value="inputValue"
                    v-on="inputEvents"
                  ></v-text-field>
                </template>
            </DatePicker>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="title"
                label="제목*"
                placeholder="ex) 노래방송, OO게임 합방(XX님, YY님), etc."
                :counter="titleMaxBytes"
                :counter-value="getUTF8Length"
                :rules="titleRules"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field 
                v-model="remark"
                label="비고"
                placeholder="ex) 컨텐츠 미정, 7~9시 사이 예정, etc."
                :counter="remarkMaxBytes"
                :counter-value="getUTF8Length"
                :rules="remarkRules"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <small>*는 필수 값입니다.</small>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        @click="closeDialog"
      >
        취소
      </v-btn>
      <span v-if="mode === 'create'">
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="save"
        >
          저장
        </v-btn>
      </span>
      <span v-else>
        <v-btn
          color="red-darken-1"
          variant="text"
          @click="remove"
        >
          삭제
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="modify"
        >
          수정
        </v-btn>
      </span>
    </v-card-actions>
  </v-card>
</template>

<script>
import { getUTF8Length, requiredRule, maxBytesRuleFactory, formatDateTime } from "@/utils/common";
import { SCHEDULES_API_URL } from "@/utils/consts";
import { DateTime } from "luxon";
import { DatePicker } from "v-calendar";

const titleMaxBytes = 255,
    remarkMaxBytes = 500;

export default {
  props: ["stellars", "schedule"],
  emits: ["close", "saved", "modified", "removed"],
  data() {
    return {
      mode: this.schedule ? "modify" : "create",
      stellar: this.schedule ? this.stellars.find(e => e.id === this.schedule.stellarId) : null,
      isTimeNotFixed: this.schedule ? !this.schedule.isFixedTime : false,
      date: this.schedule ? this.schedule.startDateTime : formatDateTime(DateTime.now()),
      title: this.schedule ? this.schedule.title : "",
      remark: this.schedule ? this.schedule.remark : "",
      masks: {
          title: "YYYY년 MMM",
          weekdays: "WWW",
          modelValue: "YYYY-MM-DDTHH:mm:00",
      },
      datepickerRules:  {
        minutes: { interval : 5 },
      },
      dateRules: [
        requiredRule,
      ],
      titleMaxBytes,
      titleRules: [
        requiredRule,
        maxBytesRuleFactory(titleMaxBytes, "제목"),
      ],
      remarkMaxBytes,
      remarkRules: [
        maxBytesRuleFactory(remarkMaxBytes, "비고"),
      ],
      isError: false,
      errorMsg: null,
    }
  },
  methods: {
    closeDialog() {
      this.$emit("close");
    },
    getUTF8Length,
    requiredRule,
    save() {
      this.$refs.form.validate()
        .then(data => {
          if (!data.valid || !confirm("저장하시겠습니까?")) return;
          this.$axios.post(SCHEDULES_API_URL, {
            stellarId: this.stellar,
            isFixedTime: !this.isTimeNotFixed,
            startDateTime: formatDateTime(DateTime.fromISO(this.date)),
            title: this.title,
            remark: this.remark,
          })
            .then(() => {
              this.$emit("saved");
            })
            .catch(error => {
              this.noticeError(error.response.data.message);
            });
        })
        .catch(error => console.error(error));
    },
    modify() {
      this.$refs.form.validate()
        .then(data => {
          if (!data.valid || !confirm("수정하시겠습니까?")) return;
          this.$axios.put(`${SCHEDULES_API_URL}/${this.schedule.id}`, {
            isFixedTime: !this.isTimeNotFixed,
            startDateTime: formatDateTime(DateTime.fromISO(this.date)),
            title: this.title,
            remark: this.remark,
          })
            .then(() => {
              this.$emit("modified");
            })
            .catch(error => {
              this.noticeError(error.response.data.message);
            });
        })
        .catch(error => console.error(error));
    },
    remove() {
      if (!confirm("삭제하시겠습니까?")) return;
      this.$axios.delete(`${SCHEDULES_API_URL}/${this.schedule.id}`)
        .then(() => {
          this.$emit("removed");
        })
        .catch(error => {
          this.noticeError(error.response.data.message);
        });
    },
    noticeError(errorMsg) {
      this.isError = true;
      this.errorMsg = errorMsg;
    },
  },
  components: { DatePicker },
}
</script>
