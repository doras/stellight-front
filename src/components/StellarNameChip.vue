<template>
  <span
    class="stellar-name-chip"
    :style="chipStyle"
  >
    <span v-emoji class="emoji-span">{{ stellar?.emoji ?? '' }}</span>
    <span class="name-span">{{ name }}</span>
    <span v-if="marked">*</span>
  </span>
</template>

<script>
import { getContrastTextColor, getStellarShortName } from '@/utils/common';

const FALLBACK_COLOR = '9E9E9E';

export default {
  name: 'StellarNameChip',
  props: {
    stellar: {
      type: Object,
      default: null,
    },
    // Name to show when the stellar is not found (e.g. schedule.stellarNameKor)
    fallbackName: {
      type: String,
      default: '',
    },
    // Appends "*" (e.g. a day off with a remark)
    marked: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    name() {
      return getStellarShortName(this.stellar) || this.fallbackName;
    },
    chipStyle() {
      const color = this.stellar?.personalColor ?? FALLBACK_COLOR;
      return {
        // The personal color is used only as the background.
        // The text is pure #000 / #fff so that the computed contrast is the rendered one.
        backgroundColor: `#${color}`,
        color: getContrastTextColor(color),
      };
    },
  },
};
</script>

<style scoped>
.stellar-name-chip {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 1px 10px 1px 6px;
  border-radius: 999px;
  /* Keeps a visible edge for very dark or very light colors */
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.5;
  white-space: nowrap;
}

.emoji-span {
  margin-right: 3px;
}

.name-span {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
