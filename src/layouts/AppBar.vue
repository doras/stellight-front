<template>
  <v-app-bar 
    flat 
    style="border-bottom: 1px solid rgb(0, 0, 0, 0.12); background-color: rgba(255,255,255,.7);"
  >
    <v-container>
      <v-row>
        <v-col cols="6">
          <router-link 
            v-for="link in links"
            :to="link.to"
            :key="link.text"
          >
            <v-btn variant="text">
                {{ link.text }}
            </v-btn>
          </router-link>
        </v-col>
        <v-col cols="6" class="text-right">
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
              >
                  Logout
              </v-btn>
            </a>
          </span>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script>
  import { LOGIN_INFO_KEY } from '@/utils/consts';
  export default {
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
