<template>
  <div :class="{loading: loading}" :style="{fontSize: `${size}rem`}" class="loading-button" flex>
    <svg-icon :name="loading?'loading':icon"/>
    <span><slot></slot></span>
  </div>
</template>

<script>
import SvgIcon from "@/components/svg-icon";
export default {
  name: "LoadingButton",
  components: {SvgIcon},
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 1
    }
  }
}
</script>

<style scoped lang="scss">
.loading-button {
  color: white;
  padding: 0.2em 0.8em;
  border-radius: 0.3em;
  cursor: pointer;
  transition: box-shadow .1s linear;
  background: #4a91ff;
  box-shadow: 0 0 0.4em rgba(0, 0, 0, 0.3);

  &:not(.loading):not(.disabled):hover {
    box-shadow: 0 0.2rem 0.4em rgba(0, 0, 0, 0.6)
  }

  &.loading, &.disabled {
    cursor: not-allowed;
    background: #8c8e8d !important;
  }

  > svg {
    width: 1.6em;
    height: 1.6em;
  }

  > span {
    flex-shrink: 0;
    font-size: 0.9em;
    margin-left: 0.6em;
    word-break: keep-all;
  }
}
</style>
