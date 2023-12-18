<template>
  <div class="animate">
    <span class="text" :data-text="text">{{ text }}</span>
  </div>
</template>

<script>
export default {
  name: "AnimateGlitch",
  props: {
    text: {
      default: ''
    }
  }
}
</script>

<style scoped lang="scss">
.animate {
  > .text {
    color: black;
    position: relative;
    letter-spacing: 0.2rem;
    padding: 0 1px;
    @keyframes noise-anim {
      $steps: 20;
      @for $i from 0 through $steps {
        #{percentage($i*(1/$steps))} {
          clip: rect(random(100)+px, 9999px, random(100)+px, 0);
        }
      }
    }
    @keyframes noise-anim-2 {
      $steps: 20;
      @for $i from 0 through $steps {
        #{percentage($i*(1/$steps))} {
          clip: rect(random(100)+px, 9999px, random(100)+px, 0);
        }
      }
    }
    &:after, &:before{
      content: attr(data-text);
      position: absolute;
      top: 0;
      color: #000000;
      overflow: hidden;
      clip: rect(0, 900px, 0, 0);
      display: block;
      white-space: normal;
    }
    &:after {
      left: 1px;
      text-shadow: -1px 0 red;
      animation: noise-anim 2s infinite linear alternate-reverse;
    }


    &:before {
      left: -1px;
      text-shadow: 1px 0 #00eaff;
      animation: noise-anim-2 3s infinite linear alternate-reverse;
    }
  }
}
</style>