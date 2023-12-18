<template>
  <a class="avatar" target="_blank" :href="url" @mouseenter="$emit('mouseenter')" flex>
    <img v-show="!loadError" :src="avatar" alt="avatar" @load="sucLoad" @error="errLoad"/>
    <span v-if="loadError" flex>
      <svg-icon name="default-avatar"/>
    </span>
  </a>
</template>

<script>
import SvgIcon from "@/components/svg-icon";
export default {
  name: "errAvatar",
  components: {SvgIcon},
  props: ['url', 'avatar'],
  data (){
    return {
      loadError: true
    }
  },
  methods: {
    errLoad (){
      this.loadError = true
    },
    sucLoad (){
      this.loadError = false
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar{
  position: relative;
  transition: all .1s linear;
  >img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    z-index: 1;
    object-fit: cover;
    box-shadow: .1rem .1rem .4rem black;
  }
  >span{
    z-index: 2;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    >svg{
      width: 100%;
      height: 100%;
    }
  }
}
</style>
