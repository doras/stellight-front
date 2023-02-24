<script setup>
import { ref } from 'vue'

const icons = ref([
  {
    icon: "mdi-github",
    link: "https://github.com/doras",
  },
  {
    icon: "mdi-email-outline",
    link: "mailto:shoon0113@gmail.com",
  },
]);
</script>
  
<template>
  <v-footer
    class="d-flex flex-column"
    style="background-color: #9ab6f0; color: #EAEBFF;"
  >
    <div class="d-flex w-50 align-center px-4">
      <span>
        <a
        v-for="iconItem in icons"
        :key="iconItem.icon"
        target="_blank"
        :href="iconItem.link"
        >
        <v-btn
        class="mx-4"
        :icon="iconItem.icon"
        variant="text"
          ></v-btn>
        </a>
      </span>
      <v-spacer></v-spacer>
      <span>
        2023 — <strong>doras</strong>
        ( shoon0113@gmail.com )
      </span>
    </div>
  </v-footer>
</template>

<style scoped>
a {
  color: inherit;
  text-decoration: inherit;
}
</style>