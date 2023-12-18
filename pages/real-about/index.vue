<template>
  <div class="about" flex>
    <div class="text" @click="toggleComp">
      <component :is="randomComp" :text="text"/>
    </div>
    <div class="content">
        <p v-html="config.aboutme"></p>
        <div class="friends">
          <p flex>
            <svg-icon name="friends"/>
            {{ $i18n('friends') }}
          </p>
          <div v-for="i in config.friends" flex>
            <span>{{i.summary}}</span>
            <a target="_blank" :href="`https://github.com/${i.github}`">
              <svg-icon name="github"/>
            </a>
            <a target="_blank" :href="i.site">
              <svg-icon name="link"/>
            </a>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import SvgIcon from "@/components/svg-icon";
import AnimateRotate from "./AnimateRotate";
import AnimateGlitch from "./AnimateGlitch";
import AnimateRainbow from "./AnimateRainbow";
import AnimateFlow from "./AnimateFlow";
import AnimateRun from "./AnimateRun";
const comps = [AnimateRun, AnimateFlow, AnimateRainbow, AnimateGlitch, AnimateRotate];

import config from '~/rebuild/json/config.json'

export default {
  name: "index",
  components: {SvgIcon},
  data (){
    return {
      comps,
      config,
      text: config.corner,
      idx: Math.floor(Math.random()*comps.length)
    }
  },
  head () {
    return {
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,关于,about` }
      ],
      title: config.corner + config.SEOTitle
    }
  },
  computed: {
    randomComp (){
      return this.comps[this.idx]
    },
  },
  mounted() {
  },
  methods: {
    toggleComp (){
      this.idx = (this.idx+1)%this.comps.length;
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.about{
  width: 100%;
  flex-direction: column;
  >.text{
    background: white;
    padding: 0.5rem 1.5rem;
    border-radius: 0.2rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.4);
    margin: 2rem 0 1rem 0;
    > .animate{
      padding: 1rem 0;
      flex-wrap: wrap;
    }
    ::v-deep span.text{
      font-size: 1.8rem;
      font-weight: bold;
      white-space: pre-line;
    }
  }
  >.content{
    width: calc(80% - 4rem);
    background: white;
    border-radius: 0.4rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    margin: 1rem 0;
    padding: 2rem;
    >p{
      margin-bottom: .8rem;
      font-size: 1.05rem;
    }
    >.friends{
      flex-direction: column;
      border-top: 1px dashed #9c9c9c;
      padding-top: .8rem;
      >p{
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
        color: #ff3c3c;
        >svg{
          width: 2.4rem;
          height: 2.4rem;
          margin-right: 1rem;
        }
      }
      >div{
        margin: 1.2rem 0;
        &:before{
          content: "";
          width: 1rem;
          height: 1rem;
          border-radius: 0.3rem;
          margin: 0 2rem;
          background: #9100ff;
          border: 1px solid gray;
          box-shadow: 0 0 0.3rem rgb(81, 0, 255, 0.3);
        }
        >span{
          font-size: 1rem;
        }
        >a{
          margin-left: 0.8rem;
          text-decoration: none;
          width: 1.4rem;
          height: 1.4rem;
          &:hover{
            >svg{
              transform: scale(1.1);
            }
          }
          >svg{
            transition: all .15s ease-out;
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
  @include media{
    width: 98%;
    >.content{
      width: calc(100% - 4rem);
    }
  }
}
</style>
