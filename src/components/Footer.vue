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
    class="text-center d-flex flex-column"
    style="background-color: #9ab6f0; color: #EAEBFF;"
  >
    <div>
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
    </div>
    <v-spacer></v-spacer>
    <div class="info">
      2023 — <strong>doras</strong>
      ( shoon0113@gmail.com )
    </div>
  </v-footer>
</template>

<style scoped>
a {
  color: inherit;
  text-decoration: inherit;
}

div.info {
  font-size: 15px;
}
</style>