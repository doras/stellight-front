<template>
  <v-container style="padding-top: 128px; padding-bottom: 64px;">
    <v-row>
      <v-col>
        <Calendar
          :masks="masks"
          :attributes="attributes"
          is-expanded
          class="mx-auto w-100"
        >
          <template v-slot:day-content="{ day, attributes }">
            <div class="day-div">
              <span class="">{{ day.day }}</span>
              <div class="">
                <p
                  v-for="attr in attributes"
                  :key="attr.key"
                  class="d-inline-block text-truncate w-100"
                  :class="attr.customData.class"
                >
                  {{ attr.customData.title }}
                </p>
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

export default {
    data() {
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        return {
            masks: {
                title: "YYYY년 MMM",
                weekdays: "WWW",
            },
            attributes: [
                {
                    key: 1,
                    customData: {
                        title: "Lunch with mom.",
                        class: "bg-red text-white",
                    },
                    dates: new Date(year, month, 1),
                },
                {
                    key: 2,
                    customData: {
                        title: "Take Noah to basketball practice",
                        class: "bg-blue text-white",
                    },
                    dates: new Date(year, month, 2),
                },
                {
                    key: 3,
                    customData: {
                        title: "Noah's basketball game.",
                        class: "bg-blue text-white",
                    },
                    dates: new Date(year, month, 5),
                },
                {
                    key: 4,
                    customData: {
                        title: "Take car to the shop",
                        class: "bg-indigo text-white",
                    },
                    dates: new Date(year, month, 5),
                },
                {
                    key: 4,
                    customData: {
                        title: "Meeting with new client.",
                        class: "bg-teal text-white",
                    },
                    dates: new Date(year, month, 7),
                },
                {
                    key: 5,
                    customData: {
                        title: "Mia's gymnastics practice.",
                        class: "bg-pink text-white",
                    },
                    dates: new Date(year, month, 11),
                },
                {
                    key: 6,
                    customData: {
                        title: "Cookout with friends.",
                        class: "bg-orange text-white",
                    },
                    dates: { months: 5, ordinalWeekdays: { 2: 1 } },
                },
                {
                    key: 7,
                    customData: {
                        title: "Mia's gymnastics recital.",
                        class: "bg-pink text-white",
                    },
                    dates: new Date(year, month, 22),
                },
                {
                    key: 8,
                    customData: {
                        title: "Visit great grandma.",
                        class: "bg-red text-white",
                    },
                    dates: new Date(year, month, 25),
                },
            ],
        };
    },
    components: { Calendar }
};
</script>

<style scoped>

.day-div {
  height: 100px;
}
</style>