<template>
  <div class="menu" :class="{hide: !showMenu}" flex>
    <div class="pendant" flex="">
      <span class="toggle-menu" :class="{opened: showMenu}" @click="toggleMenu">
        <svg viewBox="0 0 100 100">
          <path class="line line1"
                d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"/>
          <path class="line line2" d="M 20,50 H 80"/>
          <path class="line line3"
                d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"/>
        </svg>
      </span>
    </div>
    <div class="link-list" flex>
      <NuxtLink v-for="item in menu" :key="item.pathName" :to="'/backend/'+item.pathName"
                   :class="{active: $route.path.replace(/^\/?backend\/?/, '').split('/')[0]===item.pathName}" class="list-item" flex>
        <span class="icon">
          <svg-icon :name="item.icon"/>
        </span>
        <span class="name">{{$i18n(item.pathName)}}</span>
      </NuxtLink>
    </div>
    <a class="home" href="/" flex="" :title="$i18n('backHome')">
      <img src="/image/i.png" alt="favicon"/>
    </a>
    <loading-button icon="account" :loading="loginState==='doing'" :class="loginState" @click.native="showLogin">
      {{ loginStateText }}
    </loading-button>
  </div>
</template>

<script>
import {mapMutations} from "vuex";
import SvgIcon from "@/components/svg-icon";
import LoadingButton from "@/components/loading-button";

const menu = [
  {
    pathName: 'config',
    icon: 'config'
  },
  {
    pathName: 'article',
    icon: 'article'
  },
  {
    pathName: 'record',
    icon: 'record'
  },
  {
    pathName: 'theme',
    icon: 'brash'
  },
  {
    pathName: 'dashboard',
    icon: 'dashboard'
  },
  {
    pathName: 'comment',
    icon: 'comments'
  },
]

export default {
  name: "backend-menu",
  components: {LoadingButton, SvgIcon},
  props: ['loginState'],
  data (){
    return {
      menu,
      showMenu: true,
    }
  },
  computed: {
    loginStateText (){
      switch (this.loginState){
        case "none":
          return this.$i18n('noLogin')
        case "doing":
          return this.$i18n('logining')
        case "ok":
          return this.$i18n('logined')
      }
    }
  },
  mounted() {
    this.showMenu = process.server?true:((localStorage.getItem('show-menu')||'true')==='true')
  },
  methods: {
    ...mapMutations('backend', ['toggleLogin']),
    toggleMenu() {
      this.showMenu = !this.showMenu;
      localStorage.setItem('show-menu', this.showMenu.toString());
    },
    showLogin (){
      this.toggleLogin(true)
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.menu {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 9rem;
  background: rgba(43, 43, 48, 0.92);
  flex-direction: column;
  box-shadow: 0 0 0.8rem rgba(75, 75, 75, 0.5);
  z-index: $z-index-body+1;
  transition: all .2s ease-out;

  &.hide {
    transform: translateX(-100%);

    ::v-deep ~ .body {
      width: 100%;
    }
  }

  > .pendant {
    position: absolute;
    top: 0;
    left: 100%;
    flex-direction: column;
    background: black;

    > .toggle-menu, > .home {
      width: 2.2rem;
      height: 2.2rem;
    }

    > .toggle-menu {
      > svg {
        box-shadow: 0 0 0.4rem #00000063;
        cursor: pointer;
        transition: background .1s linear;

        &:hover {
          background: #1e1e1e;
        }

        > .line {
          fill: none;
          stroke: #00ffff;
          stroke-width: 6;
          transition: stroke-dasharray .4s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset .4s cubic-bezier(0.4, 0, 0.2, 1);
          @each $i, $n in (1, 207), (2, 60), (3, 207) {
            &.line#{$i} {
              stroke-dasharray: 60 $n;
            }
          }
        }
      }

      @each $i, $n, $s in (1, -134, 90 207), (2, -30, 1 60), (3, -134, 90 207) {
        &.opened > svg > .line#{$i} {
          stroke-dasharray: $s;
          stroke-dashoffset: $n;
        }
      }
    }
  }

  >.link-list {
    overflow-y: auto;
    flex-direction: column;
    width: 100%;
    > .list-item {
      font-size: 1rem;
      color: black;
      text-decoration: none;
      justify-content: center;
      padding: 1rem 0;
      width: calc(100% - 0.2rem);
      border-left: 0.2rem solid transparent;

      &.active {
        background: rgba(76, 76, 76, 0.87);
        border-color: #5fff88;
      }

      &:not(.active):hover {
        background: rgba(255, 255, 255, 0.15);
      }

      > .icon {
        width: 2.2rem;
        height: 2.2rem;
        display: flex;

        > svg {
          width: 100%;
          height: 100%;
        }
      }

      > .name {
        margin-left: 1rem;
        width: 4rem;
        text-align: center;
        color: white;
      }
    }
  }

  > .home {
    margin-top: auto;
    width: 3rem;
    height: 3rem;
    > img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      transition: all .15s ease-out;
    }
    &:hover{
      >img{
        transform: scale(1.15);
        border-radius: 20%;
      }
    }
  }
  ::v-deep .loading-button {
    margin: 1rem 0;

    &.none{
      background: gray;
    }
    &.doing{

    }
    &.ok{
      background: #ac60ff;
    }

    &:hover {
      background: #8c8e8d;
    }

    &.loading {
      background: #8c8e8d;
    }
  }
}
</style>
