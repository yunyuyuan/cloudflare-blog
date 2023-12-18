<template>
  <div :disabled="disabled" :style="{fontSize: `${size}rem`}" class="single-button" flex>
    <span><slot></slot></span>
  </div>
</template>

<script>
export default {
  name: "SingleButton",
  props: {
    size: {
      type: Number,
      default: 1
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped lang="scss">
.single-button {
  padding: 0.3em 1em;
  border-radius: 0.3em;
  cursor: pointer;
  transition: all .1s linear;
  justify-content: center;
  box-shadow: 0 0 0.3em rgba(0, 0, 0, 0.3);

  &:not([disabled]):hover{
    box-shadow: 0 0.15rem 0.3em rgba(0, 0, 0, 0.6);
  }
  &[disabled] {
    cursor: not-allowed;
    background: gray !important;
  }

  > span {
    flex-shrink: 0;
    font-size: 0.92em;
    color: white;
  }
}
</style>