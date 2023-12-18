const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "rebuild/json/config.json")).toString('utf-8'));
const mdConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "rebuild/json/md.json")).toString('utf-8'));
const recordConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "rebuild/json/record.json")).toString('utf-8'));

const mdDir = path.resolve(__dirname, 'rebuild/md');
const recordDir = path.resolve(__dirname, 'rebuild/record');

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // generate: {
  //   routes: fs.readdirSync(mdDir).map(filename => {
  //     return {
  //       route: `/article/${path.basename(filename, '.md')}`,
  //       content: fs.readFileSync(path.resolve(mdDir, filename))
  //     }
  //   })
  // },

  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'real-about',
        path: config.aboutUrl,
        component: resolve(__dirname, 'pages/real-about/index.vue')
      })
    }
  },

  loading: '~/block/Loading',
  components: false,
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: config.captainTitle,
    htmlAttrs: {
      lang: 'zh-cn'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no' },
      { hid: 'description', name: 'description', content: config.headDescribe },
      { hid: 'keywords', name: 'keywords', content: config.rss.title }
    ],
    link: [
      { rel: 'shortcut icon', href: '/favicon.svg' },
    ],
    script: [
      { src: 'https://static.cloudflareinsights.com/beacon.min.js', async: false, defer: true ,'data-cf-beacon': '{"token": "92cdf13c9c964ad1ab71c638c6fde0fc"}'}
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/style/main.scss',
    '~/assets/style/index.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/viewer.js' },
    { src: '~/plugins/logme.js' },
    { src: '~/plugins/v-tips.js' },
    { src: '~/plugins/i18n.js' },
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/sitemap',
  ],
  sitemap: {
    hostname: config.domain,
    routes: fs.readdirSync(mdDir).map(filename => {
      const fileId = path.basename(filename, '.md');
      return {
          url: `/article/${fileId}`,
          lastmod: dayjs(mdConfig.find(v=>v.file.toString() === fileId).modifyTime).format('YYYY-MM-DD')
        }
    }).concat(fs.readdirSync(recordDir).map(filename => {
      const fileId = path.basename(filename, '.txt');
      return {
          url: `/record/${fileId}`,
          lastmod: dayjs(recordConfig.find(v=>v.file.toString() === fileId).modifyTime).format('YYYY-MM-DD')
      }
    }))
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config) {
      config.node = {
        fs: 'empty'
      }
      const svgFolder = path.resolve(__dirname, 'assets/svg');

      const svgRule = config.module.rules.find(rule => rule.test.test('.svg'))
      svgRule.exclude = [svgFolder]

      config.module
        .rules.push({
          test: /\.svg$/,
          loader: 'svg-sprite-loader',
          include: [svgFolder],
          options: {
            symbolId: 'icon-[name]'
          }
        })
    }
  },
}
