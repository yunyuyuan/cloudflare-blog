export default {
  mounted() {
    if (process.server) return;
    const fontSize = localStorage.getItem('font-size');
    if (fontSize) {
      document.documentElement.style.fontSize = fontSize + 'px';
    }
    const lang = localStorage.getItem('i18n-lang');
    if (lang) {
      this.$store.commit('changeLang', lang);
    }
  }
}
