<template>
  <v-container style="padding-top: 128px; padding-bottom: 64px;">
    <v-alert
      style="margin-bottom: 32px;"
      color="error"
      icon="$error"
      :text="errorMsg"
      v-if="isError"
    ></v-alert>
    <v-row>
      <v-col
        cols="12"
        xl="2"
        lg="2"
      >
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
              <span class="">{{ day.day }}</span>
              <div class="text-body-2">
                <ScheduleItem
                  v-for="attr in attributes"
                  :key="attr.key"
                  :schedule="attr.customData.schedule"
                ></ScheduleItem>
              </div>
            </div>
          </template>
        </Calendar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Calendar } from 'v-calendar';
import { DateTime } from 'luxon';
import ScheduleItem from '@/components/ScheduleItem.vue';
import { COLOR_ARRAY, STELLARS_API_URL, SCHEDULES_API_URL } from '@/utils/consts';

const formatDateTime = dateTime => dateTime.toISO().substring(0, 19);

export default {
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
          vm.noticeError("스텔라 목록 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
          console.log(error);
        });
    },
    mounted() {
      this.loadSchedules();
    },
    components: { Calendar, ScheduleItem },
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
            vm.noticeError("스케줄 목록 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            console.log(error);
          });
      },
      noticeError(errorMsg) {
        this.isError = true;
        this.errorMsg = errorMsg;
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
</style>
