<template>
  <div class="theme" flex>
    <div class="head" flex>
      <loading-button icon="reset" @click.native="reset">{{ $i18n('reset') }}</loading-button>
      <span class="state">{{ saving.state }}</span>
      <loading-button :loading="saving.b" icon="save" @click.native="save">{{ $i18n('save') }}</loading-button>
    </div>
    <div class="body" flex>
      <div class="edit" flex ref="text">
        <div class="left" :style="{width: mdWidth}" flex>
          <span class="icon" flex>
            <svg-icon name="edit"/>
            <span>{{ $i18n('edit') }}sass</span>
            <a target="_blank" href="https://sass-lang.com/" flex>
              <svg-icon name="info"/>
            </a>
          </span>
          <div class="textarea" ref="textarea"></div>
        </div>
        <resizer :orient="'h'" @start="startResize" @resize="doResize"/>
        <div class="right" flex>
          <span class="icon" flex>
            <svg-icon name="brash"/>
            <span>{{ $i18n('result') }}</span>
          </span>
          <div ref="markdown">
            <span class="--markdown" ref="html" v-html="html" v-viewer></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {parseAjaxError} from "~/utils/utils";
import testText from '!!raw-loader!~/assets/test.md';

import Sass from 'sass.js';

import 'codemirror/lib/codemirror.css';
import '~/assets/style/code-mirror/codeMirror.scss';
import '~/assets/style/code-mirror/light-code.scss';
import '~/assets/style/code-mirror/dracula-code.scss';

import style from '!!raw-loader!~/rebuild/markdown.scss';
import defaultMarkdownStyle from '!!raw-loader!~/assets/style/markdown-default.scss';
import {parseMarkdown, processMdHtml} from "~/utils/parseMd";
import config from '~/rebuild/json/config.json';
import md from '~/rebuild/json/md.json';
import {mapState} from "vuex";
import LoadingButton from "@/components/loading-button";
import SvgIcon from "@/components/svg-icon";
import Resizer from "@/components/resizer";

export default {
  name: "Theme",
  components: {Resizer, SvgIcon, LoadingButton},
  layout: 'backend',
  data() {
    return {
      config,
      saving: {
        b: false,
        state: ''
      },
      scss: '',
      html: parseMarkdown(testText),
      codeMirror: null,
      mdWidth: '40%',
      resizeStart: {
        pos: false,
        size: false
      },
    }
  },
  head (){
    return {
      style: [{
        id: 'fake-markdown-style',
      }],
      title: '网站主题' + config.SEOTitle,
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,后台管理` },
      ],
    }
  },
  computed: {
    ...mapState('backend', ['gitUtil']),
  },
  async mounted() {
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
      mode: 'sass',
      matchTags: {bothTags: true},
      matchBrackets: true,
    });
    this.codeMirror.on('change', () => {
      this.scss = this.codeMirror.getValue();
      this.uploadStyle()
    });
    this.codeMirror.setValue(style);
    this.$nextTick(()=>{
      processMdHtml(this.$refs.html, true, md)
    })
  },
  methods: {
    uploadStyle() {
      const style = document.head.querySelector('#fake-markdown-style');
      Sass.compile(this.scss, (res) => {
        if (res)
          style.innerHTML = res.text
      });
    },
    startResize(startPos) {
      this.resizeStart = {
        pos: startPos,
        size: this.$refs.text.querySelector('.left').scrollWidth
      };
    },
    doResize(delta) {
      const parentWidth = this.$refs.text.scrollWidth;
      const newSize = this.resizeStart.size + (delta - this.resizeStart.pos);
      if (newSize > parentWidth / 5 && newSize < parentWidth * 4 / 5) {
        this.mdWidth = `${newSize}px`;
      }
    },
    reset() {
      if (!this.codeMirror) return;
      this.codeMirror.setValue(defaultMarkdownStyle);
    },
    async save() {
      if (this.gitUtil) {
        this.saving = {
          b: true,
          state: '更新中...'
        };
        const res = await this.gitUtil.updateTheme(this.scss, this.saving);
        if (res[0]) {
          this.$message.success('保存成功!');
        } else {
          this.$message.error(parseAjaxError(res[1]));
        }
        this.saving = {
          b: false,
          state: ''
        };
      } else {
        this.$message.warning('请先登录!');
        this.$emit('login')
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.theme {
  height: calc(100% - 2rem);
  flex-direction: column;
  > .head{
    width: 100%;
    height: 3rem;
    justify-content: space-between;
    > .loading-button{
      margin: 0.2rem;
      &:first-of-type{
        background: #ff4343;
        &:hover{
          background: #ff2e2e;
        }
      }
    }
    > .state{
      color: red;
      height: 1rem;
      font-size: 0.8rem;
    }
  }

  > .body {
    width: 100%;
    height: calc(100% - 3rem);
    flex-grow: 0;

    > .edit {
      width: calc(100% - 0.5rem);
      align-items: stretch;
      margin: 0.5rem 0.25rem 0.5rem 0.25rem;
      height: calc(100% - 1rem - 2px);
      border: 1px solid;

      > .left, > .right {
        height: 100%;
        flex-direction: column;

        > .icon {
          width: 100%;
          justify-content: center;
          padding: 0.4rem 0;
          background: #3e3e3e;

          > svg {
            width: 1.5rem;
            height: 1.5rem;
          }

          > span {
            font-size: 0.9rem;
            margin-left: 1rem;
            color: white;
          }
        }
      }

      > .left {
        flex-shrink: 0;

        > .icon > a {
          margin-left: 1rem;

          > svg {
            width: 1.2rem;
            height: 1.2rem;
            fill: #91ffbd;
          }

          &:hover {
            > svg {
              fill: #ff925f;
            }
          }
        }

        > .textarea {
          font-size: 0.8rem;
          width: 100%;
          height: 100%;
          overflow-y: auto;

          > ::v-deep .CodeMirror {
            height: 100%;
            line-height: 1.2rem;
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
      > .right {
        flex-grow: 1;
        width: 0;

        > div {
          border-left: none;
          overflow-y: auto;
          width: 100%;
          overflow-x: auto;

          > span {
            display: block;
            padding: 0.4rem 0.4rem 0.4rem 2.2rem;
            width: calc(100% - 2.6rem) !important;
          }
        }
      }
    }
  }
  @include media{
    >.body{
      >.edit{
        >.right{
          >div{
            >span{
              padding: 0.4rem;
              width: calc(100% - 0.8rem) !important;
            }
          }
        }
      }
    }
  }
}
</style>
