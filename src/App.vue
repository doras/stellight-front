<template>
  <v-app>
    <app-bar />

    <v-main
      style="padding-top: 0;"
    >
      <router-view />
    </v-main>
    <Footer></Footer>
  </v-app>
</template>

<script setup>
  import AppBar from './layouts/AppBar.vue';
  import Footer from './components/Footer.vue';
</script>
