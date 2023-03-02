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
                v-model="date"
                :mode="isTimeNotFixed ? 'date' : 'dateTime'"
                is24hr
                :minute-increment="5"
                :model-config="modelConfig"
                is-required
                :masks="masks"
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
      modelConfig: {
        type: "string",
        mask: "YYYY-MM-DDTHH:mm:00"
      },
      masks: {
          title: "YYYY년 MMM",
          weekdays: "WWW",
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
            .then(response => {
              if (response.status === 200 || response.status === 201) {
                this.$emit("saved");
              } else {
                this.handleFail("등록", response);
              }
            })
            .catch(error => {
              this.handleError("등록", error);
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
            .then(response => {
              if (response.status === 200 || response.status === 201) {
                this.$emit("modified");
              } else {
                this.handleFail("수정", response);
              }
            })
            .catch(error => {
              this.handleError("수정", error)
            });
        })
        .catch(error => console.error(error));
    },
    remove() {
      if (!confirm("삭제하시겠습니까?")) return;
      this.$axios.delete(`${SCHEDULES_API_URL}/${this.schedule.id}`)
        .then(response => {
          if (response.status === 200 || response.status === 201) {
            this.$emit("removed");
          } else {
            this.handleFail("삭제", response);
          }
        })
        .catch(error => {
          this.handleError("삭제", error)
        });
    },
    handleFail(opText, response) {
      this.noticeError(`스케줄 ${opText}에 실패했습니다. 잠시 후 다시 시도해 주세요.`);
      console.error(response);
    },
    handleError(opText, error) {
      this.noticeError(`스케줄 ${opText} 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`);
      console.error(error);
    },
    noticeError(errorMsg) {
      this.isError = true;
      this.errorMsg = errorMsg;
    },
  },
  components: { DatePicker },
}
</script>
