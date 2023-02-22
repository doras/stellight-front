<template>
  <v-app-bar flat>
    <v-container class="fill-height d-flex align-center">
      <v-img
        max-width="40"
        max-height="40"
        cover
        src="../assets/stellive_logo.svg"
        class="mr-6"
      ></v-img>

      <router-link 
        v-for="link in links"
        :to="link.to"
        :key="link.text"
      >
        <v-btn variant="text">
            {{ link.text }}
        </v-btn>
      </router-link>
      <v-calendar></v-calendar>
    </v-container>
  </v-app-bar>
</template>

<script>
  export default {
    data: () => ({
      links: [
        {
          text: 'Home',
          to: '/',
        },
        {
          text: 'Schedules',
          to: '/schedules'
        },
      ],
    }),
  }
</script>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}
</style>