<template>
  <div class="write" flex>
    <div class="inner" flex>
      <div class="textarea" ref="textarea" :style="{height: textareaHeight}"></div>
      <div class="utils" ref="utils" flex>
        <div class="sticker" data-id="sticker" ref="sticker" :class="{active: showSticker}"
             :style="{top: stickerPos[0]||'unset', left: stickerPos[1], width: stickerPos[2], bottom: stickerPos[3]||'unset'}"
             flex v-if="config.sticker">
          <div class="content" flex>
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
        <a class="md" @click="showGuide = true" title="关于markdown" flex>
          <svg-icon name="markdown"/>
        </a>
        <span @click="enableSticker" title="表情" :class="{active: showSticker}" flex>
          <svg-icon name="cmt-sticker"/>
        </span>
        <span @click="enableUploadImg" title="图片" :class="{active: showUploadImg}" flex>
          <svg-icon name="cmt-image"/>
        </span>
        <span @click="enablePreview" title="预览" :class="{active: showPreview}" flex>
          <svg-icon name="cmt-preview"/>
        </span>
      </div>
      <resizer :orient="'v'" @start="startResize" @resize="doResize"/>
      <div class="submit" flex>
        <single-button v-if="cancel" :size="0.8" @click.native="$emit('cancel')">{{ $i18n('cancel') }}</single-button>
        <loading-button icon="save" :loading="loading" :size="0.8" @click.native="submitComment">{{ $i18n('submit') }}</loading-button>
      </div>
    </div>
    <div class="preview" v-if="showPreview">
      <span ref="markdown" class="--markdown" v-html="$el?html:'waiting'" v-viewer></span>
    </div>
    <top-dialog v-show="showUploadImg" class="upload-img" @click.native.self="showUploadImg = false">
      <div class="help">
        <p>关于上传图片</p>
        <b>本站不存储评论图片，如果你想发送图片，建议使用以下方式:</b>
        <div flex>
          <a href="https://imgchr.com/" target="_blank">路过图床</a>
          <loading-img :src="'https://s1.ax1x.com/2020/09/28/0VPxBQ.png'" :size="[]"/>
        </div>
        <div flex>
          <a href="https://sm.ms/" target="_blank">sm.ms</a>
          <loading-img :src="'https://s1.ax1x.com/2020/09/28/0VPvng.png'" :size="[]"/>
        </div>
      </div>
      <div class="submit" flex>
        <float-input :name="'url'" :size="0.9" :value="imageUrl" @input="inputImgUrl" @submit="insertImg"/>
        <single-button :disabled="!imageUrl" :size="0.9" @click.native="insertImg">确定</single-button>
      </div>
    </top-dialog>
    <markdown-help v-show="showGuide" @click.native.self="showGuide=false"/>
  </div>
</template>

<script>
import MarkdownHelp from "~/block/MarkdownHelp";

import 'codemirror/lib/codemirror.css';
import '~/assets/style/code-mirror/codeMirror.scss';
import 'codemirror/lib/codemirror.css';
import '~/assets/style/code-mirror/codeMirror.scss';
import '~/assets/style/code-mirror/light-markdown.scss';
import '~/assets/style/code-mirror/dracula-markdown.scss';
import '~/assets/style/code-mirror/light-markdown.scss';
import '~/assets/style/code-mirror/dracula-markdown.scss';
import {parseMarkdown, processMdHtml} from "@/utils/parseMd";
import config from "~/rebuild/json/config.json";
import md from "~/rebuild/json/md.json";
import SvgIcon from "@/components/svg-icon";
import SingleButton from "@/components/single-button";
import Resizer from "@/components/resizer";
import LoadingButton from "@/components/loading-button";
import TopDialog from "@/components/top-dialog";
import LoadingImg from "@/components/loading-img";
import FloatInput from "@/components/float-input";
import {timeStamp} from "@/utils/utils";

export default {
  name: "WriteComment",
  components: {FloatInput, LoadingImg, TopDialog, LoadingButton, Resizer, SingleButton, SvgIcon, MarkdownHelp},
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    cancel: {
      type: Boolean,
      default: false
    },
    initHeight: {
      type: String,
      default: '10rem'
    }
  },
  data() {
    return {
      md,
      config,
      stamp: timeStamp,
      comment: '',
      showGuide: false,
      showSticker: false,
      showUploadImg: false,
      imageUrl: '',
      showPreview: false,
      stickerSlideNow: 0,
      stickerPos: [0, 0],
      focusAt: 0,
      textareaHeight: '0',
      resizeStart: {
        pos: false,
        size: false
      },
      codeMirror: null,
    }
  },
  computed: {
    html() {
      this.$nextTick(() => {
        processMdHtml(this.$refs.markdown, true, this.md)
      })
      return parseMarkdown(this.comment, true);
    },
  },
  created() {
    this.textareaHeight = this.$props.initHeight;
  },
  async mounted() {
    if (process.server) return ;
    await import('codemirror/addon/edit/matchbrackets')
    await import('codemirror/addon/edit/matchtags')

    await import('codemirror/mode/markdown/markdown')
    this.codeMirror = new ((await import('codemirror')).default)(this.$refs.textarea, {
      indentUnit: 2,
      tabSize: 2,
      theme: 'light',
      line: true,
      mode: 'markdown',
      matchTags: {bothTags: true},
      matchBrackets: true,
    });
    this.codeMirror.on('change', () => {
      this.comment = this.codeMirror.getValue()
    });
    this.codeMirror.on('blur', () => {
      this.focusAt = this.codeMirror.getCursor();
    })
  },
  methods: {
    enableSticker(e) {
      if (this.showSticker) {
        document.removeEventListener('click', this.handleStickerDiv);
        document.querySelector('section.body').removeEventListener('scroll', this.listenScroll);
        this.showSticker = false;
        return
      }
      this.showSticker = true;
      e.stopPropagation();
      document.querySelector('section.body').addEventListener('scroll', this.listenScroll);
      this.listenScroll();
      document.addEventListener('click', this.handleStickerDiv)
    },
    listenScroll(){
      const rect = this.$refs.utils.getBoundingClientRect(),
          height = window.innerHeight;
      this.stickerPos = [rect.top + rect.height, rect.left + 'px', rect.width + 'px', false];
      if ((height - this.stickerPos[0]) < height * 0.36) {
        this.stickerPos[0] = false;
        this.stickerPos[3] = height - rect.top + 'px';
      } else {
        this.stickerPos[0] += 'px'
      }
    },
    handleStickerDiv(e) {
      const vm = this,
          stickerDiv = this.$refs.sticker;
      let target = e.target;
      while (true) {
        if (target !== stickerDiv) {
          target = target.parentElement;
          if (!target) {
            document.removeEventListener('click', this.handleStickerDiv);
            document.querySelector('section.body').removeEventListener('scroll', this.listenScroll);
            vm.showSticker = false;
            break;
          }
        } else {
          break
        }
      }
    },
    addSticker(folder, idx) {
      if (!this.focusAt) {
        this.$message.warning('请先选择输入框!');
        return
      }
      this.codeMirror.replaceRange(`![sticker](${folder}/${idx})`, this.focusAt);
      document.removeEventListener('click', this.handleStickerDiv);
      this.showSticker = false;
    },
    enableUploadImg() {
      this.imageUrl = '';
      this.showUploadImg = true
    },
    inputImgUrl(payload) {
      this.imageUrl = payload[1]
    },
    insertImg() {
      if (!this.imageUrl) return;
      if (!this.focusAt) {
        this.$message.warning('请选择输入框!');
        return
      }
      this.codeMirror.replaceRange(`![common](${this.imageUrl})`, this.focusAt);
      this.showUploadImg = false;
    },
    enablePreview() {
      this.showPreview = !this.showPreview;
    },
    startResize(startPos) {
      this.resizeStart = {
        pos: startPos,
        size: this.$refs.textarea.scrollHeight
      };
    },
    doResize(delta) {
      const newSize = this.resizeStart.size + (delta - this.resizeStart.pos);
      if (newSize > 100 && newSize < 1000) {
        this.textareaHeight = `${newSize}px`;
      }
    },
    async submitComment() {
      if (this.loading) return;
      if (this.comment) {
        this.$emit('submit', {
          text: this.comment
        })
      } else {
        this.$message.warning('请输入一些内容!')
      }
    }
  },
}
</script>

<style scoped lang="scss">
@import "assets/style/public";
.write{
  flex-direction: column;
  width: 80%;
  border-radius: 0.4rem;
  > .inner{
    width: calc(100% - 2px);
    flex-direction: column;
    border: 1px solid #a5a5a5;
    border-radius: inherit;
    align-items: stretch;
    &:hover{
      border-color: #ff3700;
    }
    > .textarea{
      border-radius: 0.4rem 0.4rem 0 0;
      > ::v-deep .CodeMirror{
        width: 100%;
        height: 100%;
        border-radius: inherit;
        font-size: 0.85rem;
      }
    }
    > .utils{
      justify-content: flex-end;
      padding: 0.1rem;
      border-top: 1px dashed gray;
      > .md{
        cursor: pointer;
        margin: 0 auto 0 0.5rem;
        &:hover{
          > svg{
            fill: #a100ff
          }
        }
        > svg{
          width: 1.5rem;
          height: 1.5rem;
        }
      }
      > span{
        cursor: pointer;
        margin: 0 0.3rem;
        border-radius: 0.2rem;
        justify-content: center;
        padding: 0.3rem 0.7rem;
        &.active{
          background: #999cff;
        }
        &:not(.active):hover{
          background: #cbcbcb;
        }
        > svg{
          width: 1.6rem;
          height: 1.6rem;
        }
      }
    }
    > ::v-deep .resizer{
      background: #828282;
      height: 0.3rem;
      flex-shrink: 0;
      &[resizing]{
        background: #505050;
      }
    }
    > .submit{
      padding: 0.2rem 0;
      justify-content: flex-end;
      > .loading-button, > .single-button{
        margin-right: 1rem;
        flex-shrink: 0;
      }
      > .single-button{
        background: #ff5858;
        &:hover{
          background: gray;
        }
      }
    }
  }
  > .preview{
    width: 100%;
    max-height: 50rem;
    overflow-y: auto;
    border-bottom: 1px solid #cc00ff;
    > span{
      padding: 0.5rem 0.2rem;
      width: calc(100% - 1rem);
    }
  }
  @at-root body > .upload-img{
    flex-direction: column;
    ::v-deep > .inner{
      flex-direction: column;
      > .help{
        width: 100%;
        overflow-y: auto;
        > p{
          width: 100%;
          text-align: center;
          font-size: 1.2rem;
          margin: 0.6rem 0;
          color: black;
        }
        > b{
          font-size: 0.9rem;
          color: red;
        }
        > div{
          width: 95%;
          border: 1px solid;
          margin: 0.5rem auto;
          flex-direction: column;
          > a{
            font-size: 1.1rem;
            color: #ff6600;
            font-weight: bold;
            padding: 0.2rem;
            margin-top: 0.5rem;
            border: 2px dashed red;
          }
          ::v-deep .loading-img{
            width: 90% !important;
            margin: 0.8rem auto;
            img{
              object-fit: contain;
            }
            box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
          }
        }
      }
      > .submit{
        padding: 1rem 0 0.5rem 0;
        width: 100%;
        justify-content: center;
        border-top: 1px solid gray;
        background: #232323;
        border-radius: inherit;
        margin-top: auto;
        ::v-deep > .float-input{
          width: 40%;
          margin-right: 1rem;
          input{
            color: white !important;
          }
        }
        > .single-button{
          background: #0073ff;
        }
      }
    }
  }
  @include media{
    > .inner{
      > .utils{
        > .sticker{
          left: 0;
          width: 100%;
        }
      }
    }
    > .upload-img{
      ::v-deep > .inner{
        width: 95%;
        height: 70%;
      }
    }
  }
}
</style>
<style lang="scss">
@import "assets/style/public";
div.sticker[data-id=sticker]{
  position: fixed;
  z-index: $z-index-dialog;
  border-radius: 0.2rem;
  height: 0;
  background: white;
  flex-direction: column;
  overflow: hidden;
  transition: height .1s linear;
  &.active{
    height: 36vh;
    border: 1px solid #ababab;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.4);
  }
  > .content{
    width: 100%;
    height: calc(100% - 1.5rem);
    overflow: hidden;
    align-items: flex-start;
    > .inner{
      border-radius: inherit;
      height: 100%;
      transition: all .1s linear;
      position: relative;
      flex-shrink: 0;
      > div{
        height: 100%;
        overflow-y: auto;
        flex-wrap: wrap;
        align-items: flex-start;
        align-content: flex-start;
        > span{
          width: 3.6rem;
          height: 3.6rem;
          border: 1px solid #d8d8d8;
          cursor: pointer;
          background: white;
          justify-content: center;
          &:hover{
            background: #e6e6e6;
            > img{
              transform: scale(1.1);
            }
          }
          > img{
            transition: transform .1s ease-out;
            width: 70%;
            height: 70%;
            object-fit: contain;
          }
        }
      }
    }
  }
  > .switch{
    width: 100%;
    height: 1.5rem;
    flex-shrink: 0;
    border-top: 1px solid #676767;
    background: #ececec;
    > span{
      height: 100%;
      font-size: 0.8rem;
      justify-content: center;
      width: 4rem;
      border-right: 1px solid #b5b5b5;
      cursor: pointer;
      color: black;
      &:not(.active):hover{
        background: #bababa;
      }
      &.active{
        background: #333333;
        color: white;
      }
    }
  }
}
</style>
