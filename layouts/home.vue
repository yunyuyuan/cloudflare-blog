<template>
  <div id="index">
    <img class="bg" src="/image/home.png" alt="bg"/>
    <the-head class="in-home"/>
    <section class="body show-head" flex>
      <Nuxt />
      <the-footer/>
    </section>
  </div>
</template>

<script>
import Head from "~/block/Head";
import Footer from "~/block/Footer";
import Vue from 'vue';
import '~/utils/filter';
import mixins from "@/utils/mixins";

export default {
  components: {TheHead: Head, TheFooter: Footer},
  data() {
    return {
    }
  },
  mixins: [mixins],
  mounted() {
    const fontSize = localStorage.getItem('font-size');
    if (fontSize) {
      document.documentElement.style.fontSize = fontSize + 'px';
    }
    Vue.prototype.$message = this.$refs.message;
  },
}
</script>
<style scoped>
::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
