<template>
  <v-tooltip
    text="현재 필터 정보를 이 기기의 기본값으로 저장합니다."
    location="top"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        prepend-icon="mdi-content-save"
        variant="text"
        border 
        @click="buttonClicked"
        :loading="loading"
        v-bind="props"
      >
        필터 저장
        <template v-slot:loader>
          <v-icon icon="mdi-check-circle"></v-icon>
        </template>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script>
export default {
  props: ["clickFuncSuper"],
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    buttonClicked() {
      const vm = this;
      this.clickFuncSuper();
      this.loading = true;
      setTimeout(() => (vm.loading = false), 1000);
    }
  }
}
</script>
