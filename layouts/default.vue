<template>
  <div id="index">
    <del v-if="noBg"></del>
    <img class="bg" v-else-if="isBgImg" :src="routeInfo.bg" alt="bg"/>
    <div class="bg" v-else>
      <div id="particles-bg"></div>
      <div id="comet-bg"></div>
    </div>
    <the-head :class="{'show-bg': showBg}" @toggle="toggleShowBg"/>
    <section class="body show-head" :class="{'show-bg': showBg}" flex>
      <Nuxt />
      <the-footer/>
    </section>
    <message ref="message"/>
  </div>
</template>

<script>
import Message from "~/block/Message";
import Head from "~/block/Head";
import Footer from "~/block/Footer";
import Vue from 'vue';
import '~/utils/filter';
import config from "~/rebuild/json/config.json";
import mixins from "@/utils/mixins";
const routes = {
  '^/?$': {name: 'home', bg: '/image/home.png'},
  '^/about/?$': {name: 'about', bg: '/image/about.png'},
  '^/article/?$': {name: 'article', bg: '/image/article.png'},
  '^/article/\\d+/?$': {name: 'article-detail', bg: '/image/articleDetail.png'},
  '^/record/?\\d*/?$': {name: 'record', bg: '/image/record.png'},
  '^/msg-board/?$': {name: 'msg-board', bg: '/image/msgBoard.png'},
}

routes[`^${config.aboutUrl}/?$`] = {name: 'realAbout', bg: '/image/about.png'}

export default {
  components: {Message, TheHead: Head, TheFooter: Footer},
  mixins: [mixins],
  data() {
    return {
      showBg: false,
    }
  },
  mounted() {
    const fontSize = localStorage.getItem('font-size');
    if (fontSize) {
      document.documentElement.style.fontSize = fontSize + 'px';
    }
    Vue.prototype.$message = this.$refs.message;

    const container = document.getElementById('comet-bg');
    if (!this.isBgImg && !this.noBg && container) {
      //particle
      const tsparticles = () => import('tsparticles');
      tsparticles().then(({particlesJS}) => {
        particlesJS('particles-bg', {
          particles: {
            number: {value: 36, density: {enable: true, value_area: 800}},
            color: {value: "#ffffff"},
            shape: {
              type: "circle",
              stroke: {width: 0, color: "#000000"},
              polygon: {nb_sides: 5},
            },
            opacity: {
              value: 1,
              random: true,
              anim: {enable: true, speed: 1, opacity_min: 0, sync: false}
            },
            size: {
              value: 3,
              random: true,
              anim: {enable: false, speed: 4, size_min: 0.3, sync: false}
            },
            move: {
              enable: true,
              speed: 1,
              direction: 'none',
              random: true,
              straight: false,
              out_mode: 'out',
              bounce: false,
              attract: {enable: false, rotateX: 600, rotateY: 600}
            }
          },
          retina_detect: true
        });
      })
      // comet
      for (let i=0;i<3 + Math.floor(Math.random() * 4);i++){
        const div = document.createElement('div');
        div.className = 'comet';
        div.setAttribute('style', `
          left: ${50 - Math.random() * 100}px;
          top: ${10 + Math.random() * 80}%;
          animation-delay: ${Math.random() * 5}s;
          animation-duration: ${3 + Math.random() * 4}s
        `)
        container.appendChild(div);
      }
    }
  },
  computed: {
    routeNow (){
      return this.$route.path
    },
    noBg (){
      return this.routeNow === '/oauth'
    },
    isBgImg() {
      return config.backgroundImg === 'img' || (config.backgroundImg === 'random' && this.rand)
    },
    rand() {
      return Math.floor(Math.random() * 10) % 2 === 0
    },
    routeInfo (){
      for (const key of Object.keys(routes)){
        if (this.routeNow.match(new RegExp(key))){
          return routes[key]
        }
      }
      return {bg: '/image/home.png'}
    }
  },
  methods: {
    toggleShowBg(b) {
      this.showBg = b
    },
  },
}
</script>
