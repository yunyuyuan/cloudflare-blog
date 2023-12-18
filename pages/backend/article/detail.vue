<template>
  <div class="md-detail" flex>
    <div class="operate" flex>
      <NuxtLink class="back" to="/backend/article" flex>
        <svg-icon name="back"/>
        <span>{{ $i18n('back') }}</span>
      </NuxtLink>
      <single-button class="del-cache" :disabled="!hasCache" :size="0.9" @click.native="delCache">{{ $i18n('del') +' '+ $i18n('draft') }}</single-button>
      <single-button class="use-cache" :disabled="!hasCache" :size="0.9" @click.native="useCache">{{ $i18n('use') +' '+ $i18n('draft') }}</single-button>
      <single-button class="save-cache" :size="0.9" @click.native="saveCache">{{ $i18n('save') +' '+ $i18n('draft') }}</single-button>
      <loading-button :loading="saving.b" icon="save" @click.native="save">{{ $i18n('upload') }}</loading-button>
      <span class="state">{{ saving.state }}</span>
    </div>
    <div class="head" flex>
      <float-input @input="inputTitle" :name="$i18n('title')" :size="1.3" :value="info.name"/>
      <float-input class="summary" @input="inputSummary" :name="$i18n('describe')" :size="1"
                   :value="info.summary"/>
    </div>
    <div class="info" flex>
      <div class="cover">
        <loading-img :src="info.cover" :size="[20, 15]" :data-viewer="true" v-viewer/>
        <label flex>
          <span>{{ $i18n('coverLink') }}:</span>
          <input :value="info.cover" @focusout="changeCover"/>
        </label>
      </div>
      <div class="tags-time" flex>
        <div class="tags" flex>
          <span class="tag-icon" flex>
            <svg-icon name="tag"/>
          </span>
          <div v-for="(tag, idx) in info.tags" :class="{editing: tagEditIndex===idx}" :key="tag">
            <input :disabled="tagEditIndex!==idx" @focusout="editTag" :data-old="tag" :data-idx="idx" :value="tag"/>
            <div flex="">
              <span @click="clickTrash(idx)" :title="$i18n('del')">
                <svg-icon name="trash"/>
              </span>
              <span @click="clickEdit" :data-idx="idx" :title="$i18n('edit')">
                <svg-icon name="edit"/>
              </span>
            </div>
          </div>
          <span class="add" @click="addTag" :title="$i18n('add')+' '+$i18n('tag')" flex>
            <svg-icon name="add"/>
          </span>
        </div>
        <div class="time" flex>
          <span><span>{{ $i18n('create') }}:</span>{{ (info ? info.time : 0) | time(false) }}</span>
          <span><span>{{ $i18n('update') }}:</span>{{ (info ? info.modifyTime : 0) | time(false) }}</span>
        </div>
      </div>
    </div>
    <div class="text" flex ref="text">
      <div class="head" flex>
        <span @click="enableSticker" :title="$i18n('sticker')" :class="{active: showSticker}" flex>
          <svg-icon name="cmt-sticker"/>
        </span>
        <div @click="changeFrame" class="toggle-show-frame" :title="$i18n('toggleView')" flex>
          <span :class="{active: showFrame===0||showFrame===-1}"></span>
          <span :class="{active: showFrame===0||showFrame===1}"></span>
        </div>
        <span class="markdown-guide" @click="showGuide=true" :title="$i18n('markdownGuide')" flex>
          <svg-icon name="markdown"/>
        </span>
        <div class="sticker" ref="sticker" :class="{active: showSticker}" flex v-if="config.sticker">
          <div class="content">
            <div class="inner" :style="{width: `${config.sticker.length}00%`, left: `${stickerSlideNow*-100}%`}" flex>
              <div v-for="item in config.sticker" :style="{width: `${100/config.sticker.length}%`}" flex>
                <span v-for="idx in item.count" @click="addSticker(item.folder, idx)" flex>
                  <img :src="`/sticker/${item.folder}/${idx}.png?ran=${stamp}`"/>
                </span>
              </div>
            </div>
          </div>
          <div class="switch" flex>
            <span v-for="(item, idx) in config.sticker" @click="stickerSlideNow = idx"
                  :class="{active: stickerSlideNow===idx}" flex>{{ item.name }}</span>
          </div>
        </div>
      </div>
      <div class="body" flex>
        <div v-show="showFrame!==1" class="markdown" :style="{width: showFrame===-1?'100%':mdWidth}" flex>
          <div ref="textarea" class="textarea"></div>
        </div>
        <resizer v-show="showFrame===0" :orient="'h'" @start="startResize" @resize="doResize"/>
        <div v-show="showFrame!==-1" class="html" flex>
          <span ref="html" class="--markdown" v-html="htmlText" v-viewer></span>
        </div>
      </div>
    </div>
    <markdown-help v-show="showGuide" @click.native.self="showGuide=false"/>
  </div>
</template>

<script>
import {parseAjaxError, sortByTime, timeStamp} from "@/utils/utils";

import 'codemirror/lib/codemirror.css';
import '~/assets/style/code-mirror/codeMirror.scss';

import '~/assets/style/code-mirror/light-markdown.scss';
import '~/assets/style/code-mirror/dracula-markdown.scss';

import MarkdownHelp from "~/block/MarkdownHelp";
import {parseMarkdown, processMdHtml} from "~/utils/parseMd";
import {delCache, getCache, setCache} from "~/pages/backend/utils";
import config from '~/rebuild/json/config.json'
import md from '~/rebuild/json/md.json'
import {mapState} from "vuex";
import SingleButton from "@/components/single-button";
import SvgIcon from "@/components/svg-icon";
import LoadingButton from "@/components/loading-button";
import FloatInput from "@/components/float-input";
import LoadingImg from "@/components/loading-img";
import Resizer from "@/components/resizer";
import '~/rebuild/markdown.scss'

const newInfo = {
  name: "编辑标题",
  file: "",
  cover: '/image/i.png',
  time: "",
  modifyTime: "",
  summary: "编辑简介",
  tags: []
}

export default {
  name: "ArticleDetail",
  components: {Resizer, LoadingImg, FloatInput, LoadingButton, SvgIcon, SingleButton, MarkdownHelp},
  layout: 'backend',
  data() {
    return {
      config,
      md,
      id: '',
      info: {},
      stamp: timeStamp,
      showGuide: false,
      showFrame: 0,
      showSticker: false,
      stickerSlideNow: 0,
      focusAt: 0,
      tagEditIndex: -1,
      mdText: '',
      mdWidth: '40%',
      resizeStart: {
        pos: false,
        size: false
      },
      saving: {
        b: false,
        state: ''
      },
      hasCache: false,
      codeMirror: null,
      codeMirrorCache: null,
    }
  },
  head (){
    return {
      title: (this.id === 'new'?'新建':this.info.name) + config.SEOTitle,
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,后台管理` },
      ],
    }
  },
  computed: {
    htmlText() {
      return parseMarkdown(this.mdText)
    },
    ...mapState('backend', ['gitUtil']),
  },
  beforeRouteEnter (to, from, next){
    next(async vm=>{
      const id = to.query.id;
      const info = JSON.parse(JSON.stringify(id === 'new' ?
        newInfo : md.find(v => v.file === id) || null));
      if (info === null){
        vm.$message.error(`未找到id为{${id}}的文章!`);
        vm.$router.replace('/backend/article').then();
      }else{
        vm.id = id;
        vm.hasCache = getCache(`article-${id}`) != null;
        vm.info = info;
        let mdText = '写点什么吧!'
        if (id !== 'new') {
          try {
            const res = await import(`!!raw-loader!~/rebuild/md/${id}.md`);
            mdText = res.default;
          } catch (err) {
            vm.$message.error(parseAjaxError(err))
          }
        }
        if (vm.codeMirror){
          vm.codeMirror.setValue(mdText);
        }else{
          vm.mdText = mdText;
        }
      }
    })
  },
  watch: {
    htmlText (){
      this.$nextTick(async () => {
        processMdHtml(this.$refs.html, false, md)
      })
    },
  },
  async mounted() {
    // 初始化信息
    if (this.codeMirror === null) {
      const CodeMirror = (await import('codemirror')).default;
      await import('codemirror/addon/edit/matchtags')
      await import('codemirror/addon/edit/matchbrackets')
      await import('codemirror/mode/sass/sass.js')
      this.codeMirror = new CodeMirror(this.$refs.textarea, {
        indentUnit: 2,
        tabSize: 2,
        theme: 'light',
        lineNumbers: true,
        line: true,
        mode: 'markdown',
        matchTags: {bothTags: true},
        matchBrackets: true,
      });
      this.codeMirror.on('change', () => {
        this.mdText = this.codeMirror.getValue()
      });
      this.codeMirror.on('blur', () => {
        this.focusAt = this.codeMirror.getCursor();
      });
    }
    this.codeMirror.setValue(this.codeMirrorCache || this.mdText);
  },
  methods: {
    mirrorChange (){
      this.mdText = this.codeMirror.getValue()
    },
    mirrorBlur (){
        this.focusAt = this.codeMirror.getCursor();
    },
    enableSticker(e) {
      if (this.showSticker) {
        document.removeEventListener('click', this.handleStickerDiv)
        this.showSticker = false;
        return
      }
      this.showSticker = true;
      e.stopPropagation();
      document.addEventListener('click', this.handleStickerDiv)
    },
    handleStickerDiv(e) {
      const stickerDiv = this.$refs.sticker;
      let target = e.target;
      while (true) {
        if (target !== stickerDiv) {
          target = target.parentElement;
          if (!target) {
            document.removeEventListener('click', this.handleStickerDiv);
            this.showSticker = false;
            break;
          }
        } else {
          break
        }
      }
    },
    addSticker (folder, idx){
      if (!this.focusAt) {
        this.$message.warning('请先选择输入框!');
        return
      }
      this.codeMirror.replaceRange(`![sticker](${folder}/${idx})`, this.focusAt);
      document.removeEventListener('click', this.handleStickerDiv);
      this.showSticker = false;
    },
    delCache (){
      if (!this.hasCache) return ;
      delCache(`article-${this.id}`);
      delCache(`article-${this.id}-text`);
      this.$message.success('草稿已删除');
      this.hasCache = false;
    },
    useCache (){
      if (!this.hasCache) return ;
      this.info = JSON.parse(getCache(`article-${this.id}`));
      const textCache = getCache(`article-${this.id}-text`)
      if (this.codeMirror) {
        this.codeMirror.setValue(textCache);
      }else{
        this.codeMirrorCache = textCache
      }
      this.$message.success('草稿已加载');
    },
    saveCache (){
      setCache(`article-${this.id}`, JSON.stringify(this.info));
      setCache(`article-${this.id}-text`, this.mdText);
      this.$message.success('草稿已保存');
      this.hasCache = true;
    },
    // ----- change -------
    inputTitle(payload) {
      this.info.name = payload[1]
    },
    inputSummary(payload) {
      this.info.summary = payload[1]
    },
    changeCover(e) {
      this.info.cover = e.target.value;
    },
    clickTrash(idx) {
      this.info.tags.splice(idx, 1)
    },
    clickEdit(e) {
      const span = e.currentTarget;
      this.tagEditIndex = parseInt(span.getAttribute('data-idx'));
      this.$nextTick(() => {
        span.parentElement.previousElementSibling.focus()
      })
    },
    editTag(e) {
      const info = this.info,
          input = e.target;
      this.tagEditIndex = -1;
      for (const i of info.tags) {
        if (i !== input.getAttribute('data-old') && i === input.value) {
          return this.$message.warning('标签不能重复!');
        }
      }
      info.tags.splice(parseInt(input.getAttribute('data-idx')), 1, input.value);
    },
    addTag() {
      this.info.tags.push('输入标签' + this.info.tags.length)
    },
    changeFrame (){
      switch (this.showFrame){
        case 0:
          return this.showFrame = 1
        case 1:
          return this.showFrame = -1
        case -1:
          return this.showFrame = 0
      }
    },
    startResize (startPos){
      this.resizeStart = {
        pos: startPos,
        size: this.$refs.text.querySelector('.markdown').scrollWidth
      };
    },
    doResize (delta){
      const parentWidth = this.$refs.text.scrollWidth;
      const newSize = this.resizeStart.size + (delta-this.resizeStart.pos);
      if (newSize > parentWidth/5 && newSize < parentWidth*4/5){
        this.mdWidth = `${newSize}px`;
      }
    },
    async save() {
      if (this.saving.b) return;
      if (this.gitUtil) {
        let err = null;
        const info = this.info;
        if (!info.name || !info.summary || !info.tags.length || !info.cover) {
          return this.$message.warning('标题,简介,标签和封面均不能为空!')
        }
        this.saving = {
          b: true,
          state: '保存中...'
        };
        let fileId = new Date().getTime();
        info.modifyTime = fileId;
        if (this.id !== 'new') {
          // 不改file
          fileId = this.id;
        } else {
          // 添加
          // md +1
          info.file = fileId.toString();
          info.time = fileId;
          this.md.push(JSON.parse(JSON.stringify(info)));
        }
        // 执行更新
        // 更新本地md
        for (const i in this.md) {
          if (this.md[i].file === this.id) {
            this.md[i] = info;
            break
          }
        }
        this.saving.state = '更新:md.json';
        sortByTime(this.md);
        const res = await this.gitUtil.updateMd({
          file: fileId,
          content: this.mdText,
          mdList: this.md
        }, this.saving);
        if (res[0]){
          this.$message.success('上传成功!');
          window.location.reload();
        }else{
          this.$message.error(parseAjaxError(err))
        }
        this.saving = {
          b: false,
          state: ''
        }
      } else {
        this.$message.warning(this.$i18n('needLogin'));
        this.$emit('login')
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.md-detail {
  flex-direction: column;
  position: relative;

  > .operate{
    margin-bottom: 0.5rem;
    justify-content: space-between;
    width: calc(100% - 0.5rem);
    padding: 0.2rem 0.2rem 0 0.2rem;
    flex-wrap: wrap;
    > .back{
      cursor: pointer;
      padding: 0.4rem 0.8rem;
      border-radius: 0.2rem;
      box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.3);
      justify-content: center;
      background: #ff8595;
      transition: all .15s linear;
      text-decoration: none;
      color: black;

      &:hover {
        box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.5);
      }

      > svg {
        width: 1.4rem;
        height: 1.4rem;
      }

      > span {
        font-size: 0.9rem;
        margin-left: 0.5rem;
      }
    }

    ::v-deep .single-button{
      &.del-cache{
        background: #ff1d1d;
      }
      &.use-cache{
        background: #7d45ff;
      }
      &.save-cache{
        background: #ff8000;
      }
    }

    > ::v-deep .loading-button {
      padding: 0.4rem 0.8rem;
      background: #66dded;
      box-shadow: 0 0 0.3rem #00000078;
      color: black;
      &:not(.loading):hover{
        background: #62c7db;
      }
      &.loading{
        background: gray;
        color: white;
      }
    }
    > .state{
      width: 100%;
      text-align: right;
      color: red;
      height: 1rem;
      font-size: 0.8rem;
      padding: 0.2rem 0;
    }
  }

  > .head {
    flex-direction: column;
    margin: 3rem 0;
    width: 100%;

    > .float-input {
      width: 60%;

      ::v-deep input {
        text-align: center !important;
      }

      &.summary {
        margin-top: 3rem;
        width: 70%;
      }
    }
  }

  > .info {
    width: 100%;
    justify-content: space-around;
    align-items: stretch;

    > .cover {
      margin: 0 2rem;
      border-radius: 0.8rem;
      padding: 0.5rem;
      justify-content: space-around;
      flex-direction: column;
      border: 1px solid gray;
      box-shadow: 0 0 0.8rem rgba(0, 0, 0, 0.15);
      ::v-deep .loading-img{
        img{
          object-fit: contain;
        }
      }
      > label {
        margin: 1rem 0 0.5rem 0;

        > span {
          font-size: 0.88rem;
          margin-right: 0.5rem;
        }

        > input {
          border: 1px solid gray;
          padding: 0.15rem;
          font-size: 0.95rem;
        }
      }
    }

    > .tags-time {
      flex-direction: column;
      flex-grow: 1;

      > .tags {
        align-content: start;
        flex-wrap: wrap;

        > .tag-icon {
          margin-right: 2rem;

          > svg {
            width: 2.6rem;
            height: 2.6rem;
          }
        }

        > div {
          margin: 1rem 0.8rem;
          border-radius: 0.2rem;
          justify-content: center;
          position: relative;
          height: 2.5rem;
          box-shadow: 0 0 0.6rem rgba(0, 0, 0, 0.26);

          > input {
            font-size: 0.96rem;
            width: 12rem;
            height: 100%;
            border-radius: inherit;
            text-align: center;
            background: white;
            color: black;
            border: 1px solid gray;
            transition: all .2s linear;

            &:disabled {
              color: white;
              width: 6rem;
              background: #3e41ff;
              border-color: transparent;
            }
          }

          > div {
            display: none;
            position: absolute;
            border-radius: inherit;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            justify-content: space-around;
            background: rgba(0, 0, 0, 0.4);

            > span {
              cursor: pointer;
              padding: 0.15rem 0.4rem;
              border-radius: 0.2rem;

              &:hover {
                background: rgba(255, 255, 255, 0.31);
              }

              > svg {
                width: 1.4rem;
                height: 1.4rem;
              }
            }
          }

          &:not(.editing):hover {
            > div {
              display: flex;
            }
          }
        }

        > .add {
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          background: #ff8822;
          justify-content: center;
          margin-left: 1rem;
          box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);
          transition: all .1s linear;

          &:hover{
            box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.6);
          }

          > svg {
            width: 1.2rem;
            height: 1.2rem;
            fill: white;
          }
        }
      }

      > .time {
        width: 100%;
        height: 3rem;
        justify-content: space-around;
        margin-top: auto;

        > span {
          color: #0003ff;
          font-size: 0.9rem;

          > span {
            font-size: 0.9em;
            color: black;
            margin-right: 0.5rem;
          }
        }
      }
    }
  }

  > .text{
    width: 100%;
    flex-direction: column;
    margin: 0.5rem 0 0.4rem 0;
    border-top: 1px dashed gray;
    > .head{
      width: 95%;
      padding: 0.15rem 2.5%;
      position: relative;
      margin: 0.5rem 0;
      >span{
        cursor: pointer;
        padding: 0.4rem;
        border-radius: 0.2rem;
        >svg{
          width: 2rem;
          height: 2rem;
        }
        &:hover{
          background: #d8d8d8;
        }
      }
      >.toggle-show-frame{
        cursor: pointer;
        margin: 0 1rem 0 auto;
        border: 1px solid #101010;
        >span{
          width: 1rem;
          height: 1rem;
          &:first-of-type{
            border-right: 1px solid white;
          }
          &.active{
            background: #0073ff;
          }
        }
      }
      >.markdown-guide{
      }
      > .sticker {
        width: 90%;
        position: absolute;
        left: 5%;
        top: -5%;
        transform: translateY(-100%);
        border-radius: 0.2rem;
        height: 0;
        background: white;
        flex-direction: column;
        z-index: 10;
        overflow: hidden;
        transition: height .1s linear;
        &.active{
          height: 36vh;
          border: 1px solid #ababab;
          box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.4);
        }
        >.content{
          width: 100%;
          overflow: hidden;
          flex-grow: 1;
          >.inner{
            border-radius: inherit;
            height: 100%;
            transition: all .1s linear;
            position: relative;
            >div {
              height: 100%;
              overflow-y: auto;
              flex-wrap: wrap;
              align-items: flex-start;
              align-content: flex-start;

              > span {
                width: 3.6rem;
                height: 3.6rem;
                border: 1px solid #d8d8d8;
                cursor: pointer;
                background: white;
                justify-content: center;

                &:hover {
                  background: #e6e6e6;

                  > img {
                    transform: scale(1.1);
                  }
                }

                > img {
                  transition: transform .1s ease-out;
                  width: 70%;
                  height: 70%;
                  object-fit: contain;
                }
              }
            }
          }
        }

        > .switch {
          width: 100%;
          height: 1.5rem;
          flex-shrink: 0;
          border-top: 1px solid #676767;
          background: #ececec;

          > span {
            height: 100%;
            font-size: 0.8rem;
            justify-content: center;
            width: 4rem;
            border-right: 1px solid #b5b5b5;
            cursor: pointer;
            color: black;

            &:not(.active):hover {
              background: #bababa;
            }

            &.active {
              background: #333333;
              color: white;
            }
          }
        }
      }
    }
    > .body{
      width: calc(100% - 2px);
      max-height: 100vh;
      min-height: 30rem;
      align-items: stretch;
      border: 1px solid #656565;
      > .markdown{
        align-items: stretch;
        flex-shrink: 0;

        > .textarea{
          width: 100%;

          > ::v-deep .CodeMirror{
            height: 100%;
            font-size: 0.85rem;
          }
        }
      }
      > ::v-deep .resizer{
        background: #828282;
        width: 0.3rem;
        flex-shrink: 0;
        &[resizing]{
          background: #505050;
        }
      }
      > .html{
        overflow-y: auto;
        display: block;
        flex-grow: 1;

        > span{
          display: block;
          padding: 0.5rem 0.5rem 0.5rem 2.7rem;
          width: calc(100% - 3.2rem);
        }
      }
    }
  }
  @include media{
    > .info {
      flex-direction: column;
      >.cover{
        ::v-deep .loading-img{
          width: 100% !important;
        }
      }
    }
    >.text{
      >.body{
        >.html{
          >span{
            padding: 0.5rem;
            width: calc(100% - 1rem);
          }
        }
      }
    }
  }
}
</style>
