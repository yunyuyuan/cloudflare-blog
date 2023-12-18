<template>
  <svg aria-hidden="true">
    <use :fill="calcFill" :href="icon"></use>
  </svg>
</template>

<script>
export default {
  name: "svg-icon",
  props: {
    name: {
      type: String,
      default: ''
    },
    fill: {
      type: String,
      default: ''
    }
  },
  data (){
    return {
      icon: ''
    }
  },
  watch: {
    name:{
      handler() {
        import(`~/assets/svg/${this.name}.svg`).then(res => {
          this.icon = `#icon-${this.name}`;
        })
      },
      immediate: true
    }
  },
  computed: {
    calcFill() {
      if (this.$props.fill) {
        return this.$props.fill
      }
      return false
    }
  }
}
</script>

<style scoped lang="scss">

</style>
