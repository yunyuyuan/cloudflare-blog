<template>
  <div class="fragment">
    <p>
      <svg-icon :name="icon"/>
      <strong>{{name}}</strong>
    </p>
    <div flex>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import SvgIcon from "@/components/svg-icon";
export default {
  name: "fragment",
  components: {SvgIcon},
  props: ['name', 'icon'],
}
</script>

<style scoped lang="scss">
.fragment{
  width: 95%;
  margin: 1rem 0 1.5rem 0;
  position: relative;
  &:before{
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: black;
    z-index: 1;
  }
  >p{
    display: inline-flex;
    align-items: center;
    position: relative;
    transform: translateY(-50%) translateX(.5rem);
    padding: 0 .5rem;
    background: white;
    margin-right: auto;
    z-index: 2;
    margin-bottom: .6rem;
    >svg{
      width: 1.8rem;
      height: 1.8rem;
    }
    >strong{
      font-size: 1.05rem;
      margin-left: .6rem;
    }
  }
  >div{
    flex-direction: column;
  }
}
</style>
