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
  import { $axios } from '../axios'
  import { ME_API_URL, LOGIN_INFO_KEY } from './utils/consts';
  import { provide, ref, readonly } from 'vue';

  const loginInfo = ref({
    isLoaded: false,
    isLoggedIn: false,
    email: null,
  });
  provide(LOGIN_INFO_KEY, readonly(loginInfo));

  $axios.get(ME_API_URL)
    .then(response => {
      loginInfo.value.isLoggedIn = true;
      loginInfo.value.email = response.data.email;
    })
    .catch(error => {
      if (error.response.status === 401) {
        loginInfo.value.isLoggedIn = false;
      } else {
        console.log(error);
      }
    }).finally(() => {
      loginInfo.value.isLoaded = true;
    });
</script>
