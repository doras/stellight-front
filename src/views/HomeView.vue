<template>
  <div class="main-div">
    <section class="text-center">
      <h1>
        <a 
          class="text-decoration-none" 
          target="_blank" 
          href="https://twitter.com/StelLive_kr"
        >
          StelLive
        </a>
        의 팬 사이트입니다.
      </h1>
      <h2 class="mt-12 stellight-content">
        StelLight는 Stellar와 Light의 합성어로
        <br>
        StelLive에 소속된 별들의 빛을 놓치지 않고
        <br>
        온전히 볼 수 있도록 해주는 팬 사이트입니다.
      </h2>
    </section>
    <section class="text-center">
      <v-container>
        <v-row justify="center" align="center">
          <v-col
            cols="12"
            xl="6"
            class="order-xl-last"
          >
            <v-img
              src="../assets/schedule.png"
            ></v-img>
          </v-col>
          <v-col
            cols="12"
            xl="6"
          >
            <h2>스케줄 기능</h2>
            <p class="py-4">
              스텔라이브 소속 멤버, "스텔라"들의 스케줄을 한눈에 확인하세요!
            </p>
            <p class="py-4">
              내가 알고있는 스케줄과 다르다면?
              <br>
              로그인 후 스케줄을 등록/수정/삭제할 수 있습니다!
            </p>
          </v-col>
        </v-row>
      </v-container>
    </section>
    <section class="text-center">
      <h2>문제 신고 및 건의</h2>
      <p class="py-4">
        이용 중 문제가 생기거나 건의사항이 있으신가요?
        <br>
        페이지 하단의 이메일로 연락주세요!
      </p>
    </section>
    <section class="text-center">
      <p class="pb-12 font-weight-bold stellight-content">
        스텔라이브와 소속 멤버들을 항상 응원합니다.
      </p>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

export default {
  setup() {
    const { name, xs, sm, md, width } = useDisplay();

    const h1SizeClass = computed(() => {
      switch (name.value) {
          case 'xs': return 'text-h5'
          case 'sm': return 'text-h4'
          case 'md': return 'text-h3'
      }
      return 'text-h2'
    })

    const h2SizeClass = computed(() => {
      switch (name.value) {
          case 'xs': return 'text-h5'
          case 'sm': return 'text-h4'
          case 'md': return 'text-h3'
      }
      return 'text-h2'
    })

    return { xs, sm, md, width, h1SizeClass, h2SizeClass };
  },
}
</script>

<style scoped>
section {
  padding-top: 128px;
}
.main-div {
  font-size: 1vw;
  background: rgb(213,221,251);
  background: linear-gradient(to bottom, rgba(234,235,255,1) 0%, rgba(213,221,251,1) 100%);
}

h1 {
  font-size: max(3em, 24px);
  font-weight: 600;
}

h2 {
  font-size: max(1.75em, 20px);
  font-weight: 600;
}

p {
  font-size: max(1em, 14px);
}

.stellight-content {
  font-size: max(1.75em, 15px);
}
</style>
