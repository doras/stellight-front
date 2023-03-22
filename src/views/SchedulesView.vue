<template>
  <v-container style="padding-top: 128px; padding-bottom: 64px;">
    <v-alert
      style="margin-bottom: 32px;"
      color="error"
      icon="$error"
      :text="errorMsg"
      v-if="isError"
    ></v-alert>
    <v-alert
      v-for="item in alertList"
      style="margin-bottom: 32px;"
      :color="item.color"
      :icon="`\$${item.color}`"
      :text="item.text"
      closable
    ></v-alert>
    <v-row>
      <v-col
        cols="12"
        xl="2"
        lg="2"
      >
        <v-container>
          <v-row>
            <v-col>
              <v-card
                class="mx-auto"
                max-width="344"
                variant="outlined"
              >
                <v-card-item>
                  <v-card-title>필터</v-card-title>
                </v-card-item>
                <v-card-text>
                  <v-form>
                    <v-checkbox 
                      label="전체" 
                      v-model="allStellarChecked"
                      density="compact"
                    ></v-checkbox>
                    <v-checkbox
                      v-for="(stellar, idx) in stellars"
                      :key="stellar.id"
                      :label="stellar.nameKor"
                      v-model="stellarIds"
                      :value="stellar.id"
                      hide-details="auto"
                      density="compact"
                      :color="colorArray[idx]"
                    ></v-checkbox>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col>
        <Calendar
          :masks="masks"
          :attributes="attributes"
          is-expanded
          class="mx-auto w-100"
          ref="calendar"
          @transition-end="loadSchedules"
        >
          <template v-slot:day-content="{ day, attributes }">
            <div class="day-div">
              <span :class='{ "today" : day.isToday }'>{{ day.day }}</span>
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
  <v-dialog
    v-model="dialog"
    width="600px"
    persistent
  >
    <ScheduleDialog
      @close="dialog = false"
      @saved="onSavedSchedule"
      :stellars="stellars"
    ></ScheduleDialog>
  </v-dialog>
  <div class="fab-div" v-if="loginInfo.isLoggedIn">
    <v-btn
        icon="mdi-plus"
        color="primary"
        size="large"
        @click="openDialogCreation"
      ></v-btn>
  </div>
</template>

<script>
import { Calendar } from 'v-calendar';
import { DateTime } from 'luxon';
import ScheduleItem from '@/components/ScheduleItem.vue';
import { COLOR_ARRAY, STELLARS_API_URL, SCHEDULES_API_URL, LOGIN_INFO_KEY } from '@/utils/consts';
import ScheduleDialog from '@/components/ScheduleDialog.vue';
import { formatDateTime } from '@/utils/common';

export default {
    inject: {
      loginInfo: {
        from: LOGIN_INFO_KEY,
      }
    },
    data() {
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        return {
            masks: {
                title: "YYYY년 MMM",
                weekdays: "WWW",
            },
            colorArray: COLOR_ARRAY,
            stellars: [],
            stellarIds: [],
            isError: false,
            errorMsg: "",
            schedules: [],
            dialog: false,
            alertList: [],
        };
    },
    created() {
      const vm = this;
      this.$axios.get(STELLARS_API_URL)
        .then(response => {
          vm.stellars = response.data;
          vm.stellarIds = response.data.map(s => s.id);
        })
        .catch(error => {
          vm.noticeError(`스텔라 목록 조회 중 오류가 발생했습니다. ${error.response.data.message}`);
          console.log(error);
        });
    },
    mounted() {
      this.loadSchedules();
    },
    components: { Calendar, ScheduleItem, ScheduleDialog },
    methods: {
      loadSchedules() {
        const { year, month } = this.$refs.calendar.firstPage;

        const firstDateTime = DateTime.local(year, month);
        const lastDateTime = firstDateTime.endOf("month");

        const params = {
          startDateTimeAfter: formatDateTime(firstDateTime),
          startDateTimeBefore: formatDateTime(lastDateTime),
        };

        const vm = this;
        this.$axios.get(SCHEDULES_API_URL, { params })
          .then(response => {
            vm.schedules = response.data;
          })
          .catch(error => {
            vm.noticeError(`스케줄 목록 조회 중 오류가 발생했습니다. ${error.response.data.message}`);
            console.log(error);
          });
      },
      noticeError(errorMsg) {
        this.isError = true;
        this.errorMsg = errorMsg;
      },
      openDialogCreation() {
        this.dialog = true;
      },
      onSavedSchedule() {
        this.dialog = false;
        this.pushAlert("스케줄이 등록되었습니다.");
        this.loadSchedules();
      },
      onModifiedSchedule() {
        this.dialog = false;
        this.pushAlert("스케줄이 수정되었습니다.");
        this.loadSchedules();
      },
      onRemovedSchedule() {
        this.dialog = false;
        this.pushAlert("스케줄이 삭제되었습니다.");
        this.loadSchedules();
      },
      pushAlert(text, color = "success") {
        this.alertList.push({
          text,
          color,
        });
      }
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
      attributes() {
        return this.schedules.filter(elem => this.stellarIds.includes(elem.stellarId)).map(elem => ({
          key: elem.id,
          customData: {
            // class: `stellar-${elem.stellarId} ${elem.isFixedTime ? "fixed" : ""}`,
            schedule: elem,
          },
          dates: DateTime.fromISO(elem.startDateTime).toJSDate(),
        }))
      }
    },
};
</script>

<style scoped>
.day-div {
  height: 100px;
}

.fab-div {
  position: fixed;
  bottom: 50px;
  right: 50px;
  z-index: 1;
}

.today {
  background-color: #87a9ed;
  border-radius: 25px;
  color: #fff;
  padding: 3px;
}
</style>
