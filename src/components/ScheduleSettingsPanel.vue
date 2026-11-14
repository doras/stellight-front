<template>
  <div class="settings-panel">
    <v-select
      class="mb-4"
      label="보기 모드"
      :items="calendarViewOptions"
      item-title="title"
      item-value="value"
      variant="outlined"
      hide-details
      v-model="calendarViewProxy"
    ></v-select>
    <v-form>
      <div class="all-row">
        <v-checkbox
          label="전체"
          v-model="allStellarCheckedProxy"
          density="compact"
          hide-details
        ></v-checkbox>
        <FilterSaveButton :clickFuncSuper="saveFilter" />
      </div>
      <div
        class="stellar-checkboxes"
        :class="{ 'stellar-checkboxes--two-columns': columns === 2 }"
      >
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
      </div>
    </v-form>
  </div>
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
    // Number of columns of the stellar checkboxes (2 on small screens to fit more without scrolling)
    columns: {
      type: Number,
      default: 1,
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
.settings-panel {
  padding: 16px;
}

/* "전체" and the save button share a row to save height in the bottom sheet */
.all-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/*
 * Two columns at most; one column when a column would be narrower than 155px
 * (e.g. 320px wide screens with display zoom), so that names are not broken into lines
 */
.stellar-checkboxes--two-columns {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(max(155px, calc((100% - 4px) / 2)), 1fr));
  column-gap: 4px;
}

.filter-label {
  word-break: keep-all;
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

