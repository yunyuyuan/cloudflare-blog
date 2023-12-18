<template>
  <div class="animate" flex>
    <span class="text" :data-shadow="text"><span>{{ text }}</span></span>
  </div>
</template>

<script>
export default {
  name: "AnimateFlow",
  props: {
    text: {
      default: ''
    }
  },
}
</script>

<style scoped lang="scss">
.animate{
  >.text {
    display: inline-block;
    color: black;
    //text-shadow: .1rem .1rem 0 hsla(230, 40%, 50%, 1);
    position: relative;
    padding: 0 0.2rem 0.2rem 0;

    span{
      z-index: 1;
      position: relative;
      letter-spacing: 0.2rem;
    }

    &:after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      content: attr(data-shadow);
      position: absolute;
      top: 3.2px;
      left: 3.2px;
      z-index: 0;
      text-shadow: none;
      white-space: normal;
      letter-spacing: 3.2px;
      background-image: linear-gradient(
              45deg,
              transparent 45%,
              #a600ff 45%,
              #a600ff 55%,
              transparent 0
      );
      background-size: 3.2px 3.2px;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      animation: shad-anim 15s linear infinite;
    }

    @keyframes shad-anim {
      0% {
        background-position: 0 0
      }
      0% {
        background-position: 100% -100%
      }
    }
  }
}
</style>