<template>
  <div class="message" flex>
    <div v-for="(item,idx) in list" v-if="item.display" :class="[item.type, 'item', item.downed?'downed':'']" flex
         :key="item.id">
      <svg-icon :name="item.type" class="type"/>
      <svg-icon name="trash" class="close" @click.native="removeItem(idx)" :title="$i18n('close')"/>
      <span class="text">{{ item.text }}</span>
      <span class="line"></span>
    </div>
  </div>
</template>

<script>
import SvgIcon from "@/components/svg-icon";
export default {
  name: "Message",
  components: {SvgIcon},
  data() {
    return {
      list: [],
      msgId: 0
    }
  },
  methods: {
    success(text) {
      this.putMessage('success', text)
    },
    error(text) {
      this.putMessage('error', text)
    },
    warning(text) {
      this.putMessage('warning', text)
    },
    putMessage(type, text) {
      // 清除之前的元素
      if (this.list.length > 4) {
        this.list = [];
      }
      const obj = {
        type: type,
        text: text,
        display: true,
        id: this.msgId,
        downed: false
      };
      this.msgId += 1;
      this.list.push(obj);
      this.$nextTick(() => {
        this.$el.querySelectorAll('.line').forEach(el => {
          if (el.hasAttribute('listened')) return;
          el.setAttribute('listened', '');
          el.addEventListener('animationstart', () => {
            obj.downed = true;
          })
          el.addEventListener('animationend', () => {
            obj.display = false;
          })
        })
      })
    },
    removeItem(idx) {
      this.list[idx].display = false;
      this.list.splice(idx, 1)
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";
@keyframes msg-fade-out{
  0%{
    opacity: 0;
    transform: translateY(calc(-100% + 2rem));
  }
  5%{
    opacity: 1;
    transform: translateY(0);
  }
  95%{
    opacity: 1;
    transform: translateY(0);
  }
  100%{
    opacity: 0;
    transform: translateY(calc(-100% + 2rem));
    display: none;
  }
}
@keyframes msg-line-out{
  0%{
    transform: translateX(0);
    background: #ff0000;
  }
  95%, 100%{
    transform: translateX(-100%);
    background: blue;
  }
}
.message{
  position: fixed;
  z-index: $z-index-message;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  margin: 0 auto;
  flex-direction: column;
  > .item{
    width: 40%;
    max-width: 50rem;
    border-radius: 0.6rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    padding: 0.6rem 1rem;
    margin: 1rem 0;
    position: relative;
    animation: msg-fade-out 5s linear forwards;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    @include media{
      width: 80%;
      max-width: unset;
      > .close{
        display: unset !important;
      }
    }
    &.downed:hover{
      animation-play-state: paused;
      > .close{
        display: unset;
      }
      > .line{
        animation-play-state: paused;
      }
    }
    &.success{
      background: #eefffd;
    }
    &.error{
      background: #fff0f4;
    }
    &.warning{
      background: #fffbed;
    }
    > .type{
      width: 2rem;
      height: 2rem;
      flex-shrink: 0;
    }
    > .close{
      width: 1.4rem;
      height: 1.4rem;
      cursor: pointer;
      display: none;
      position: absolute;
      top: 0.2rem;
      right: 0.1rem;
    }
    > .text{
      font-size: 0.9rem;
      margin-left: 1rem;
      word-break: break-all;
    }
    > .line{
      height: 0.2rem;
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      animation: msg-line-out 4.75s linear forwards;
      animation-delay: 0.25s;
    }
  }
}
</style>
