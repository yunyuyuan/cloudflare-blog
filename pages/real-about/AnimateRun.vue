<template>
  <div class="animate" flex>
    <span class="text" :class="{blank: i===' '}" v-for="(i,idx) in textList" :style="{animationDelay: idx*0.1+'s',animationDuration: textList.length*0.2+1+'s'}">{{ i }}</span>
  </div>
</template>

<script>
export default {
  name: "AnimateRun",
  props: {
    text: {
      default: ''
    }
  },
  computed: {
    textList() {
      return this.text.split('')
    }
  }
}
</script>

<style scoped lang="scss">
.animate{
  @keyframes text-rotate{
    0%{
      transform: translateX(100%);
      opacity: 0;
    }
    8%{
      transform: translateX(-8);
      opacity: 1;
    }
    15%, 72%{
      transform: translateX(0);
      opacity: 1;
    }
    80%, 100%{
      transform: translateX(-100%);
      opacity: 0;
    }
  }
  > .text{
    opacity: 0;
    margin: 0 0.1rem;
    animation-name: text-rotate;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    &.blank{
      margin: 0 0.5rem;
    }
  }
}
</style>
