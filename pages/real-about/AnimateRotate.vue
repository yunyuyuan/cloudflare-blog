<template>
  <div class="animate" flex>
    <span class="text" :class="{blank: i===' '}" v-for="(i,idx) in textList"
            :style="{animationDelay: 0.05*idx+'s',animationDuration: textList.length*0.1+1+'s'}">{{ i }}</span>
  </div>
</template>

<script>
export default {
  name: "AnimateRotate",
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
.animate {
  @keyframes text-rotate {
    0% {
      transform: rotateX(-90deg);
    }
    8% {
      transform: rotateX(8deg);
    }
    15%, 72% {
      transform: rotateX(0);
    }
    80%, 100% {
      transform: rotateX(90deg);
    }
  }

  > .text {
    margin: 0 0.1rem;
    animation-name: text-rotate;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    transform-origin: 50% 50% 1.8rem;
    transform: rotateX(-90deg);
    &.blank{
      margin: 0 0.5rem;
    }
  }
}
</style>
