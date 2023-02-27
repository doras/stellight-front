<template>
  <v-app-bar 
    flat 
    style="border-bottom: 1px solid rgb(0, 0, 0, 0.12); background-color: rgba(255,255,255,.7);"
  >
    <v-container class="fill-height d-flex align-center">

      <router-link 
        v-for="link in links"
        :to="link.to"
        :key="link.text"
      >
        <v-btn variant="text">
            {{ link.text }}
        </v-btn>
      </router-link>
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