<template>
  <v-card variant="outlined">
    <v-card-item>
      <v-card-title>설정</v-card-title>
    </v-card-item>
    <v-card-text>
      <v-select
        class="mb-2"
        label="캘린더 모드"
        :items="calendarViewOptions"
        item-title="title"
        item-value="value"
        variant="outlined"
        v-model="calendarViewProxy"
      ></v-select>
      <div class="mb-4" style="text-align: right;">
        <FilterSaveButton :clickFuncSuper="saveFilter" />
      </div>
      <v-form>
        <v-checkbox
          label="전체"
          v-model="allStellarCheckedProxy"
          density="compact"
        ></v-checkbox>
        <v-checkbox
          v-for="stellar in stellars"
          :key="stellar.id"
          v-model="stellarIdsProxy"
          :value="stellar.id"
          hide-details="auto"
          density="compact"
          :color="`#${stellar.personalColor}`"
        >
          <template v-slot:label>
            <span
              class="filter-label"
              :class="{ graduated: stellar.isGraduated }"
            >
              <span v-emoji class="emoji-span">{{ stellar?.emoji ?? '' }}</span>
              <span class="name-span">{{ stellar.nameKor }}</span>
              <span v-if="stellar.isGraduated">
                {{ stellar.generation > 0 ? "(졸업생)" : "(퇴사자)" }}
              </span>
            </span>
          </template>
        </v-checkbox>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import FilterSaveButton from '@/components/FilterSaveButton.vue';

export default {
  name: 'ScheduleSettingsPanel',
  components: {
    FilterSaveButton,
  },
  props: {
    calendarView: {
      type: String,
      required: true,
    },
    calendarViewOptions: {
      type: Array,
      required: true,
    },
    stellars: {
      type: Array,
      required: true,
    },
    stellarIds: {
      type: Array,
      required: true,
    },
    allStellarChecked: {
      type: Boolean,
      required: true,
    },
    saveFilter: {
      type: Function,
      required: true,
    },
  },
  emits: ['update:calendarView', 'update:stellarIds', 'update:allStellarChecked'],
  computed: {
    calendarViewProxy: {
      get() {
        return this.calendarView;
      },
      set(value) {
        this.$emit('update:calendarView', value);
      },
    },
    stellarIdsProxy: {
      get() {
        return this.stellarIds;
      },
      set(value) {
        this.$emit('update:stellarIds', value);
      },
    },
    allStellarCheckedProxy: {
      get() {
        return this.allStellarChecked;
      },
      set(value) {
        this.$emit('update:allStellarChecked', value);
      },
    },
  },
};
</script>

<style scoped>
.filter-label {
  color: #000;
}

.filter-label.graduated {
  color: #888;
}

.emoji-span {
  margin: 0 1px;
}

.name-span {
  vertical-align: middle;
  margin-left: 3px;
}
</style>

