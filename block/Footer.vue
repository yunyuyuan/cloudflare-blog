<template>
  <footer flex>
    <NuxtLink to="/backend" class="favicon" flex v-tips="$i18n('backend')">
      <img :src="`/favicon.svg?stamp=${timeStamp}`" alt="icon"/>
    </NuxtLink>
    <div class="link" flex>
      <a v-for="k in ['aboutthis', 'github', 'email']" :key="k" target="_blank" :href="config[k]" v-tips="$i18n(k)" flex>
        <svg-icon :name="k"/>
      </a>
    </div>
    <div class="adjust">
      <div class="font-size" flex>
        <single-button v-tips="$i18n('fontSizeReduce')" :disabled="fontSize<=5" :size="0.9" @click.native="changeFont(fontSize<=5, -1)">A-</single-button>
        <span>{{fontSize}}</span>
        <single-button v-tips="$i18n('fontSizeEnlarge')" :disabled="fontSize>=25" :size="0.9" @click.native="changeFont(fontSize>=25, 1)">A+</single-button>
      </div>
    </div>
    <div class="lang" tabindex="1"
         onfocus="this.classList.add('show')"
         onblur="this.classList.remove('show')">
      <span flex>
        <svg-icon name="arrow"/>
        language
      </span>
      <div class="choose" flex>
        <a v-for="i in langs" :class="{active: $store.state.lang===i}" :key="i" @click="changeLang(i)">{{i}}</a>
      </div>
    </div>
    <div class="copyright" flex>
      <span>Copyright (c) {{ config.copyright }} <b write-font>{{ config.name }}</b><b> | {{ domain }}</b></span>
      <span flex>All right reserved
        <a href="/rss.xml" target="_blank" v-tips="$i18n('rssFeed')">
          <svg-icon name="rss"/>
        </a>
      </span>
    </div>
  </footer>
</template>

<script>
import SvgIcon from "@/components/svg-icon";
import SingleButton from "@/components/single-button";
import {timeStamp} from '~/utils/utils'
import config from '~/rebuild/json/config.json'
import {i18n} from "@/plugins/i18n";
import {mapMutations} from "vuex";

export default {
  name: "TheFooter",
  components: {SingleButton, SvgIcon},
  data() {
    return {
      config,
      langs: i18n.map(v=>v.name),
      timeStamp,
      fontSize: 0
    }
  },
  computed: {
    domain() {
      if (process.server) return '';
      return location.hostname
    },
  },
  created() {
    if (process.server) return;
    const fontSize = +localStorage.getItem('font-size');
    this.fontSize = fontSize || +getComputedStyle(document.documentElement).fontSize.replace('px', '');
  },
  methods: {
    ...mapMutations(['changeLang']),
    changeFont (cant, delta){
      if (!cant){
        this.fontSize += delta;
        localStorage.setItem('font-size', this.fontSize.toString());
        document.documentElement.style.fontSize = this.fontSize + 'px';
      }
    },
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

@keyframes shine{
  0%{
    box-shadow: 0 0 0 #00FFD9;
  }100%{
    box-shadow: 0 0 1.5rem #d900ff;
   }
}

footer{
  width: 100%;
  background: #2b2b2b;
  margin-top: auto;
  height: $footer-height;
  box-shadow: 0 0 1rem #020202;
  z-index: $z-index-footer;
  flex-shrink: 0;
  >.favicon {
    margin: 0 1.6rem;
    height: 3.5rem;
    width: 3.5rem;
    background: #cdcdcd;
    border-radius: 0.5rem;
    justify-content: center;
    transition: all .15s linear;
    flex-shrink: 0;
    &:hover{
      background: white;
      animation: shine 1s ease-out infinite alternate;
    }
    > img{
      height: 90%;
      width: 90%;
    }
  }
  > .link{
    margin-right: auto;
    > a{
      margin: 0 0.8rem;
      background: white;
      border-radius: 0.25rem;
      padding: 0.2rem 0.4rem;
      justify-content: center;
      transition: all .15s linear;
      &:hover{
        background: #e3e3e3;
        animation: shine 1s linear infinite alternate;
      }
      > svg{
        width: 1.4rem;
        height: 1.4rem;
      }
    }
  }
  >.adjust{
    margin: auto;
    >.font-size{
      >.single-button{
        background: black;
      }
      >span{
        margin: 0 0.5rem;
        color: white;
      }
    }
  }
  >.lang{
    position: relative;
    margin: 0 1rem;
    outline: none;
    user-select: none;
    &.show{
      >span{
        >svg{
          transform: rotate(90deg);
        }
      }
      >div {
        display: flex;
      }
    }
    >span{
      background: white;
      border-radius: .15rem;
      font-size: .9rem;
      padding: .25rem .5rem;
      cursor: pointer;
      >svg{
        width: .8rem;
        height: .8rem;
        margin-right: .6rem;
        transition: all .15s ease-out;
        transform: rotate(-90deg);
      }
    }
    >div{
      flex-direction: column;
      position: absolute;
      top: 0;
      transform: translateY(calc(-100% - 1rem));
      display: none;
      transition: all .15s ease-out;
      box-shadow: 0 0 .6rem rgba(0, 0, 0, .5);
      >a{
        cursor: pointer;
        background: white;
        padding: .3rem .6rem;
        font-size: .88rem;
        transition: all .15s linear;
        width: 3rem;
        line-height: 1rem;
        &:not(:last-of-type){
          border-bottom: 1px solid gray;
        }
        &:not(.active):hover{
          background: #88f9ff;
        }
        &.active{
          background: #0046ff;
          color: white;
        }
      }
    }
  }
  >.copyright{
      height: 100%;
      justify-content: center;
      flex-direction: column;
      margin: 0 1rem 0 auto;
      > span {
        color: #bbbbbb;
        font-size: 0.8rem;
        margin: 0.5rem 0;

        > b {
          color: #ddd;
        }
        >a{
          text-decoration: none;
          margin-left: 1rem;
          width: 1.5rem;
          height: 1.5rem;
          @keyframes spinning-rotate{
            0%{
              transform: rotate(0);
            }
            70%{
              transform: rotate(360deg);
            }
            80%,90%{
              transform: rotate(390deg);
            }
            100%{
              transform: rotate(360deg);
            }
          }
          &:hover{
            animation: spinning-rotate .5s linear;
          }
          >svg{
            width: 100%;
            height: 100%;
          }
        }
      }
  }
  @include media{
    flex-wrap: wrap;
    padding: 1rem 0 0 0;
    height: unset;
    >.copyright{
      width: 100%;
      height: 3.6rem;
      margin: 0;
      justify-content: space-around;
      >span{
        margin: 0;
      }
    }
  }
}
</style>
