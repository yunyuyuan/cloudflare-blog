<template>
  <div class="article-detail">
    <div v-if="!info.name" class="not-found" flex>
      <div flex>
        <svg-icon name="grass"/>
        <strong write-font>{{ $i18n('noSuchArticle') }}</strong>
      </div>
      <a href="/article">{{ $i18n('backArticleList') }}</a>
    </div>
    <div v-else class="detail">
      <div class="head" flex>
        <h1>{{ info.name }}
          <time>{{ info.time|time(false) }}</time>
        </h1>
      </div>
      <div class="content" flex>
        <aside style="display: none" class="info" :style="{transform: `translateY(${asideTop}px)`}" ref="aside" flex>
          <div :class="asideActive===null?'':(asideActive?'active':'deactive')" flex>
            <div class="anchors" flex>
              <span class="anchor" :class="{active: item.active, small: item.small}" v-for="item in anchors"
                    @click="toAnchor(item.el)" flex><span></span>{{ item.text }}</span>
            </div>
            <div class="tail" flex>
              <div class="share" flex :title="$i18n('qrcide')">
                <div class="qr" tabindex="1" onfocus="this.classList.add('click')"
                     onblur="this.classList.remove('click')">
                  <span flex>
                    <svg-icon name="qr"/>
                  </span>
                  <div flex>
                    <div class="load" v-if="!qrcode">
                      <svg-icon name="loading"/>
                    </div>
                    <img v-else :src="qrcode" alt="qr"/>
                  </div>
                </div>
              </div>
              <a class="back" href="/article" :title="$i18n('backArticleList')">
                <svg-icon name="back"/>
              </a>
            </div>
            <div class="info">
              <div class="tags" flex>
                <svg-icon name="tag"/>
                <a v-for="tag in info.tags||[]" :style="{background: $options.filters.color(tag)}"
                   :href="`/article?search-tag=${tag}`" :title="`${$i18n('search')}-${tag}`">{{ tag }}</a>
              </div>
              <div class="time" flex>
                <span>{{ $i18n('lastModify') }}</span>
                <time>{{ info.modifyTime|time(false) }}</time>
              </div>
            </div>
          </div>
          <span class="toggle-aside" :class="{active: asideActive}" @click="asideActive = !asideActive" flex
                :title="$i18n(`${asideActive?'close':'open'}Sidebar`)">
            <svg-icon name="arrow"/>
          </span>
        </aside>
        <span :class="{'show-aside': asideActive}" ref="markdown" class="--markdown" v-html="html" v-viewer></span>
      </div>
      <the-comment v-if="this.info.file" :title="this.info.file"/>
    </div>
  </div>
</template>

<script>
import {throttle} from "@/utils/utils";
import TheComment from "~/block/comment/index";

import qrcode from "qrcode";
import {parseMarkdown, processMdHtml} from "@/utils/parseMd";

import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
import mdConfig from '~/rebuild/json/md.json'
import SvgIcon from "@/components/svg-icon";
import config from "~/rebuild/json/config.json";
import '~/rebuild/markdown.scss'

export default {
  name: "article-detail",
  components: {SvgIcon, TheComment},
  head () {
    return {
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,文章详情` }
      ],
      title: this.info.name + config.SEOTitle,
    }
  },
  data() {
    return {
      md: mdConfig,
      anchors: [],
      asideActive: null,
      asideTop: 0,
      animationHandle: undefined,
      qrcode: '',
    }
  },
  router: new VueRouter({
    mode: 'hash'
  }),
  async asyncData({params}) {
    const id = params.detail;
    const info = mdConfig.find(v=>v.file === id)||{tags:[]};
    return {
      id,
      html: info.name?parseMarkdown((await import(`!!raw-loader!~/rebuild/md/${id}.md`)).default):'',
      info,
    }
  },
  computed: {
    body() {
      if (process.server) return {};
      return document.querySelector('section.body')
    },
    url() {
      if (process.server) return '/';
      return encodeURI(location.hash.replace(/^#/, ''))
    },
  },
  watch: {
    $route (){
      this.goAnchor()
    }
  },
  async mounted() {
    if (!this.info.name) return;
    qrcode.toDataURL(location.href, (err, url) => {
      this.qrcode = url
    });
    this.body.addEventListener('scroll', this.moveAside);
    this.$nextTick(() => {
      const el = this.$refs.markdown;
      processMdHtml(el, false, this.md)
      // 取出anchor为侧栏
      this.anchors = [];
      const headList = el.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      headList.forEach(el => {
        this.anchors.push({
          el: el,
          text: el.innerText,
          id: el.id,
          active: false,
          small: ['h4', 'h5', 'h6'].indexOf(el.tagName.toLowerCase())!==-1
        });
        el.onclick = () => {
          this.toAnchor(el)
        };
      })
      // 监听滚动到anchor
      this.body.onscroll = throttle(() => {
        let last = {};
        for (const el of headList) {
          if (last && el.getBoundingClientRect().top > document.querySelector('header.the-head').scrollHeight) {
            break
          }
          last = el;
        }
        this.anchors.forEach(a => {
          a.active = a.id === last.id;
        })
      })
      // 锚点
      if (this.$route.path) {
        this.goAnchor()
      }
      // 自定义锚点
      el.querySelectorAll('a[data-anchor-id].anchor-id-ref').forEach(a=>{
        const trueId = a.getAttribute('data-anchor-id');
        if (el.querySelector('#'+trueId)){
          a.addEventListener('click', e=>{
            if (this.$route.path.substr(1) !== trueId) {
              this.$router.replace(trueId);
            }else{
              this.goAnchor()
            }
          })
        }
      })
    })
  },
  beforeDestroy() {
    this.body.removeEventListener('scroll', this.moveAside)
  },
  methods: {
    moveAside() {
      const markdown = this.$refs.markdown;
      const top = this.body.scrollTop-markdown.parentElement.offsetTop;
      if (markdown.scrollHeight - top > this.$refs.aside.clientHeight&&top>0) {
        this.asideTop = top
      }
    },
    toAnchor(el) {
      if (this.$route.path.substr(1) !== el.id) {
        this.$router.replace(el.id);
      }else{
        this.goAnchor()
      }
    },
    goAnchor (){
      if (process.server) return;
      const el = document.getElementById(this.$route.path.substr(1));
      const markdown = this.$refs.markdown;
      if (el) {
        const fps = 60,
          duration = 1000,
          body = this.body;
        let count = fps * duration / 1000,
          interval = el.getBoundingClientRect().top - markdown.getBoundingClientRect().top + markdown.parentElement.offsetTop,
          scrollNow = body.scrollTop,
          step = (interval - scrollNow) / count;
        if (this.animationHandle) clearInterval(this.animationHandle);
        this.animationHandle = setInterval(() => {
          scrollNow += step;
          count--;
          this.body.scrollTo(0, scrollNow);
          if (count === 0) {
            this.body.scrollTo(0, interval)
            clearInterval(this.animationHandle);
          }
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.article-detail{
  width: 100%;
  min-height: 100%;
  position: relative;
  flex-shrink: 0;
  >.not-found{
    width: 50%;
    height: 50%;
    margin: 1rem auto;
    background: whitesmoke;
    border-radius: .5rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, .3);
    justify-content: center;
    flex-direction: column;
    >div{
      margin-bottom: 1rem;
      >svg{
        width: 3rem;
        height: 3rem;
        margin-right: 1rem;
      }
      >strong{
        font-size: 1.3rem;
      }
    }
    >a{
      font-size: .9rem;
    }
  }
  >.detail{
    width: 100%;
    min-height: 100%;
    >.head{
      width: 100%;
      max-width: 70rem;
      margin: 2rem auto 3rem auto;
      justify-content: center;
      >h1{
        background: white;
        border-radius: 1rem/2.5rem;
        padding: .7rem 2.5rem;
        box-shadow: 0.3rem 0.3rem 0.5rem #6d6d6d;
        position: relative;
        min-width: 60%;
        text-align: center;
        font-size: 1.25rem;
        >time{
          content: attr(data-time);
          position: absolute;
          right: 0;
          bottom: -0.5rem;
          transform: translateY(100%);
          font-size: 0.75rem;
          border-radius: .15rem;
          background: rgba(0, 0, 0, 0.3);
          padding: .2rem .8rem;
          color: white;
          font-weight: normal;
        }
      }
    }
    > .content{
      max-width: 75rem;
      margin: 1rem auto;
      position: relative;
      justify-content: flex-end;
      > .info{
        display: flex !important;
        position: absolute;
        left: 0;
        top: 0;
        align-items: self-start;
        z-index: 1;
        max-height: calc(100vh - #{$head-height});
        > div{
          max-height: calc(100vh - #{$head-height});
          $animation-duration: .2s;
          flex-direction: column;
          width: 0;
          transition: all $animation-duration ease-out;
          opacity: 0;
          height: 0;
          @keyframes to-hide{
            0%{
              opacity: 1;
            }
            100%{
              opacity: 0;
              height: 0;
              display: none;
              margin: 0;
              padding: 0;
            }
          }
          &.active{
            width: 11.5rem;
            margin-left: .5rem;
            opacity: 1;
            height: 100%;
            > .anchors{
              width: 100%;
            }
            > .tail{
              overflow: unset;
              width: 6rem;
            }
            > .info{
              overflow: unset;
              width: 100%;
            }
          }
          &.deactive{
            >*{
              animation: to-hide $animation-duration ease-out forwards;
            }
          }
          > *{
            width: 0;
            flex-direction: column;
            background: white;
            border-radius: 0.4rem;
            box-shadow: 0 0 0.6rem rgba(0, 0, 0, 0.4);
            transition: all $animation-duration ease-out;
            overflow: hidden;
            flex-shrink: 0;
          }
          > .anchors{
            padding: 0.5rem 0;
            overflow-y: auto;
            flex-shrink: 1;
            > span{
              margin: 0.3rem 0;
              padding: 0.2rem 0 0.2rem 0.8rem;
              font-size: 0.9rem;
              cursor: pointer;
              position: relative;
              width: calc(100% - 0.2rem);
              flex-shrink: 0;
              color: #6b6b6b;
              &, &>span{
                transition: all .15s linear;
              }
              &.small{
                color: #525252;
                font-size: .75rem;
                margin: 0.2rem 0;
                >span {
                  margin-left: .8rem;
                  background: white;
                }
              }
              >span{
                width: .45rem;
                height: .45rem;
                border: 2px solid #afafaf;
                background: #afafaf;
                border-radius: 50%;
                flex-shrink: 0;
                margin-right: .3rem;
              }
              &:after, &:before{
                position: absolute;
                content: '';
                display: block;
                height: 1px;
                width: 0;
                background: red;
                transition: all .35s ease-out;
              }
              &:after{
                bottom: 0;
                left: 0;
              }
              &:before{
                top: 0;
                right: 0;
              }
              &:hover:not(.active):after, &:hover:not(.active):before{
                background: blue;
                width: 100%;
              }
              &.active{
                font-size: 1rem;
                font-weight: bold;
                color: black;
                >span{
                  border-color: #6b6b6b;
                  background: #6b6b6b;
                }
                &.small{
                  font-size: .85rem;
                }
              }
            }
          }
          >.tail{
            flex-direction: column;
            margin-top: 1rem;
            padding: 1rem 0;
            > .share{
              margin-bottom: 1rem;
              > .qr{
                position: relative;
                outline: none;
                &.click{
                  > div{
                    height: 10rem;
                    width: 10rem;
                  }
                }
                > span{
                  cursor: pointer;
                  > svg{
                    width: 2rem;
                    height: 2rem;
                  }
                }
                > div{
                  position: absolute;
                  right: 0;
                  top: 0;
                  height: 0;
                  width: 0;
                  transform: translateX(calc(100% + 1rem));
                  border-radius: 0.3rem;
                  box-shadow: 0 0 1.2rem rgba(0, 0, 0, 0.6);
                  align-items: center;
                  overflow: hidden;
                  transition: all .3s ease-out;
                  > .load{
                    background: white;
                    border-radius: inherit;
                    > svg{
                      width: 3rem;
                      height: 3rem;
                    }
                  }
                  > img{
                    width: 100%;
                    height: 100%;
                    border-radius: inherit;
                  }
                }
              }
            }
            >.back{
              text-decoration: none;
              &:hover{
                >svg{
                  fill: #ff2a2a;
                }
              }
              >svg{
                width: 2rem;
                height: 2rem;
                fill: #f08080;
                transition: fill .15s linear;
              }
            }
          }
          >.info{
            margin-top: 1rem;
            >.tags{
              flex-wrap: wrap;
              margin: 0.6rem;
              >svg{
                width: 1.6rem;
                height: 1.6rem;
                margin-right: 1rem;
              }
              >a{
                color: white;
                padding: .15rem .5rem;
                text-decoration: none;
                font-size: .8rem;
                margin: .4rem;
                border-radius: .15rem;
                box-shadow: 0 0 .1rem rgba(0, 0, 0, 0.5);
                transition: all .15s linear;
                word-break: keep-all;
                &:hover{
                  box-shadow: 0 .2rem .4rem rgba(0, 0, 0, 0.5);
                }
              }
            }
            >.time{
              font-size: 0.75rem;
              margin: 1rem 0.5rem;
              flex-direction: column;
              >span{
                word-break: keep-all;
              }
              >time{
                font-size: 0.8rem;
                font-weight: normal;
                word-break: keep-all;
                white-space: nowrap;
                color: #0e5d00;
              }
            }
          }
        }
        > .toggle-aside{
          background: white;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          position: relative;
          cursor: pointer;
          box-shadow: 0 0 1rem rgba(0, 0, 0, 0.4);
          justify-content: center;
          > svg{
            transition: all .2s ease-out;
            transform: rotate(0);
            width: 1rem;
            height: 1rem;
          }
          &.active{
            > svg{
              transform: rotate(180deg);
            }
          }
        }
      }
      >.loading, > .--markdown{
        background: white;
        border-radius: 0.6rem;
        box-shadow: 0 0 0.6rem rgba(0, 0, 0, 0.4);
        width: calc(100% - 6.4rem);
        transition: all .15s ease-out;
        padding: 1.5rem 1rem 1.5rem 3.4rem;
        &.show-aside{
          width: calc(100% - 18.4rem);
        }
      }
      >.loading{
        justify-content: center;
        padding: 1.5rem 0.5rem 1.5rem 0.5rem;
        width: calc(100% - 1rem);
        >svg{
          margin: 3rem 0;
          width: 5rem;
          height: 5rem;
        }
      }
    }
    > ::v-deep .comment{
      width: 90%;
      max-width: 60rem;
      margin: 2rem auto;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
      padding: 1rem 0;
    }
  }
  @include media{
    >.not-found{
      width: 90%;
    }
    > .detail{
      > .content{
        min-width: 100%;
        max-width: 100%;
        > .info{
        }
        > .--markdown{
          padding: 1.5rem 0.5rem 1.5rem 0.5rem !important;
          width: calc(100% - 1rem) !important;
        }
      }
      > ::v-deep .comment{
        width: 98%;
        max-width: unset;
        > .write{
          width: 95%;
        }
      }
    }
  }
}
</style>
