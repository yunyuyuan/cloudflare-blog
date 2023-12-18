<template>
  <div class="animate" flex>
    <span class="text" :class="{blank: i===' '}" v-for="(i,idx) in textList" :style="{animationDelay: 0.1*idx+'s', animationDuration: textList.length*0.1+1+'s'}">{{ i }}</span>
  </div>
</template>

<script>
export default {
  name: "AnimateRainbow",
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
  @keyframes rainbow-colors {
    0% { color: #ff0000; }
    20% { color: #ffca00; }
    40% { color: #00ff2f; }
    60% { color: #00baff; }
    80% { color: #4400ff; }
    100% { color: #ff00d5; }
  }
  > .text{
    margin: 0 0.1rem;
    animation-name: rainbow-colors;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    &.blank{
      margin: 0 0.5rem;
    }
  }
}
</style>
