<template>
  <v-app-bar 
    flat 
    style="border-bottom: 1px solid rgb(0, 0, 0, 0.12); background-color: rgba(255,255,255,.7);"
  >
    <v-container class="d-flex">
          <router-link 
            v-for="(link, idx) in links"
            :to="link.to"
            :key="link.text"
            :class="{ 'me-auto': idx === links.length-1 }"
          >
            <v-btn variant="text" :class="[xs ? 'text-body-2' : '']">
                {{ link.text }}
            </v-btn>
          </router-link>
          <v-progress-circular 
            indeterminate
            v-if="!loginInfo.isLoaded"
          ></v-progress-circular>
          <span v-else>
            <a 
              href="/oauth2/authorization/naver"
              v-if="!loginInfo.isLoggedIn"
            >
              <v-btn
                prepend-icon="mdi-login"
                :class="[xs ? 'text-body-2' : '']"
              >
                  Login
              </v-btn>
            </a>
            <a
              href="/logout" 
              v-else
            >
              <v-btn
                prepend-icon="mdi-logout"
                :class="[xs ? 'text-body-2' : '']"
              >
                  Logout
              </v-btn>
            </a>
          </span>
    </v-container>
  </v-app-bar>
</template>

<script>
  import { LOGIN_INFO_KEY } from '@/utils/consts';
  import { useDisplay } from 'vuetify';
  export default {
    setup() {
      const { xs } = useDisplay();
      return { xs };
    },
    inject: {
      loginInfo: {
        from: LOGIN_INFO_KEY,
      }
    },
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
