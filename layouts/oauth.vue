<template>
  <div id="index">
    <the-head :class="{'show-bg': showBg}"/>
    <section class="body show-head" :class="{'show-bg': showBg}" flex>
      <Nuxt />
      <the-footer/>
    </section>
  </div>
</template>

<script>
import Head from "~/block/Head";
import Footer from "~/block/Footer";
import '~/utils/filter';
import mixins from "@/utils/mixins";

export default {
  components: {TheHead: Head, TheFooter: Footer},
  data() {
    return {
      showBg: false,
    }
  },
  mixins: [mixins],
  mounted() {
    const fontSize = localStorage.getItem('font-size');
    if (fontSize) {
      document.documentElement.style.fontSize = fontSize + 'px';
    }
  },
}
</script>
