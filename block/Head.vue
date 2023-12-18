<template>
  <header class="the-head">
    <div class="body" flex>
      <NuxtLink class="favicon" to="/">
        <img src="/image/i.png" alt="favicon"/>
      </NuxtLink>
      <NuxtLink class="txt" :to="config.aboutUrl" flex :title="config.corner">{{config.corner}}</NuxtLink>
      <span @mouseenter="toggle(true)" @mouseleave="toggle(false)"></span>
    </div>
  </header>
</template>

<script>
import Headroom from "headroom.js";
import config from '~/rebuild/json/config.json'

export default {
  name: "TheHead",
  data() {
    return {
      config
    }
  },
  mounted() {
    new Headroom(this.$el, {
      offset: this.$el.scrollHeight,
      scroller: document.querySelector('section.body')
    }).init()
  },
  methods: {
    toggle(b) {
      this.$emit('toggle', b)
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.the-head {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $head-height;
  background: rgba(0, 0, 0, 0.1);
  transition: all .15s linear;
  z-index: $z-index-head;
  box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(1px);
  &.headroom--unpinned {
    background: rgba(0, 0, 0, 0.6);
  }
  &.show-bg{
    background: transparent !important;
  }
  &.in-home{
    background: transparent;
    width: unset;
    left: unset;
    right: 0;
    > .body {
      width: unset;
      right: 0;
      left: unset;
      .favicon {
        display: none;
      }
    }
    ::v-deep ~ .body.show-bg {
      opacity: 1;
    }
  }

  > .body{
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    justify-content: space-between;
    > .favicon{
      margin-left: 1rem;
      height: 88%;
      border-radius: 0.4rem;
      box-shadow: 0 0 0.4rem rgba(255, 255, 255, 0.3);
      >img{
        border-radius: inherit;
        height: 100%;
        object-fit: contain;
      }
    }
    > .txt{
      font-weight: bold;
      margin: 0 1rem 0 auto;
      height: 100%;
      color: white;
      text-decoration: none;
      cursor: pointer;
      font-size: 0.85rem;
      font-family: "Source Code Pro", serif;
      word-break: keep-all;
      white-space: nowrap;
    }
    >a{
      position: relative;
      z-index: 2;
    }
    > span{
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
    }
  }
  @include media{
    >.body{
      > .txt{
        font-size: 0.75rem;
        margin-right: 0.3rem;
      }
    }
  }
}
</style>
