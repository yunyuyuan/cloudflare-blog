<template>
  <div class="pagination" flex>
      <span v-for="p in pages" :class="{active: p === pageNow,disabled: p===''}" @click="toPage(p)">
        {{ p }}
        <svg-icon v-if="p===''" name="ellipsis"/>
      </span>
  </div>
</template>

<script>
import SvgIcon from "@/components/svg-icon";
export default {
  name: "Pagination",
  components: {SvgIcon},
  props: {
    itemCount: {
      type: Number,
    },
    pageNow: {
      type: Number
    },
    perCount: {
      type: Number
    },
    pagerCount: {
      type: Number,
      default: 5
    }
  },
  computed: {
    pages() {
      if (this.itemCount===0){
        return []
      }
      let i = 1,
          list = [this.pageNow],
          pageCount = Math.ceil(this.itemCount / this.perCount);
      while (true) {
        if (list.length < this.pagerCount && list.length < pageCount) {
          const next = this.pageNow + i;
          if (next > 0 && next <= pageCount) {
            list.push(next)
          }
        } else {
          break
        }
        let newI = i * -1;
        if (i < 0) {
          newI++;
        }
        i = newI;
      }
      list = list.sort((a, b) => {
        return a > b ? 1 : -1
      })
      if (list.length === this.pagerCount) {
        if (list[1] !== 2) {
          list.splice(0, 1, 1, '')
        }
        if (list[list.length - 2] !== pageCount - 1) {
          list.splice(list.length - 1, 1, '', pageCount)
        }
      }
      return list
    }
  },
  methods: {
    toPage(p) {
      if (p !== '') {
        this.$emit('turn', p)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.pagination{
  margin-top: 1rem;
  width: 100%;
  justify-content: center;

  > span:not(.disabled){
    cursor: pointer;
    color: black;
    background: white;
    border-radius: 0.2rem;
    padding: 0.3rem 0.8rem;
    font-size: 0.95rem;
    margin: 0 0.5rem;
    transition: all .1s linear;

    &:not(.active):hover{
      color: black;
      transform: scale(1.1);
    }

    &.active{
      border-radius: 15%;
      background: #69ffd0;
      color: black;
      font-weight: bold;
    }
  }

  > span.disabled{
    > svg{
      width: 2.4rem;
      height: 2.4rem;
      margin: 0 0.8rem;
    }
  }
}
</style>
