<template>
  <div class="record-detail" flex>
    <div class="operate" flex>
      <NuxtLink class="back" to="/backend/record" flex>
        <svg-icon name="back"/>
        <span>{{ $i18n('back') }}</span>
      </NuxtLink>
      <single-button class="del-cache" :disabled="!hasCache" :size="0.9" @click.native="delCache">{{ $i18n('del') +' '+ $i18n('draft') }}</single-button>
      <single-button class="use-cache" :disabled="!hasCache" :size="0.9" @click.native="useCache">{{ $i18n('use') +' '+ $i18n('draft') }}</single-button>
      <single-button class="save-cache" :size="0.9" @click.native="saveCache">{{ $i18n('save') +' '+ $i18n('draft') }}</single-button>
      <loading-button :loading="saving.b" icon="save" @click.native="save">{{ $i18n('upload') }}</loading-button>
      <span class="state" v-if="saving.state">{{ saving.state }}</span>
    </div>
    <div class="time" flex>
      <span><span>{{ $i18n('create') }}:</span>{{ (info ? info.time : 0) | time(false) }}</span>
      <span><span>{{ $i18n('update') }}:</span>{{ (info ? info.modifyTime : 0) | time(false) }}</span>
    </div>
    <div class="edit">
      <div class="images" flex v-viewer>
        <span class="head" flex>
          <svg-icon name="picture"/>
          {{ $i18n('cover') }}
        </span>
        <div class="list-item" v-for="(i,idx) in info.images" :key="i" flex>
          <loading-img :src="i" :size="[12, 8]" :data-viewer="true"/>
          <label class="bottom" flex>
            <input :value="i" :data-idx="idx" @focusout="editImg"/>
            <single-button class="del-btn" @click.native="delImg(idx)">{{ $i18n('del') }}</single-button>
          </label>
        </div>
        <span class="add" @click="addImg" flex>
          <svg-icon name="add"/>
        </span>
      </div>
      <label class="text">
        <span flex><svg-icon name="text"/>{{ $i18n('content') }}:</span>
        <textarea v-model="text"></textarea>
      </label>
    </div>
  </div>
</template>

<script>
import {parseAjaxError, sortByTime} from "@/utils/utils";
import {delCache, getCache, setCache} from "~/pages/backend/utils";
import {mapState} from "vuex";
import record from '~/rebuild/json/record.json'
import SvgIcon from "@/components/svg-icon";
import SingleButton from "@/components/single-button";
import LoadingButton from "@/components/loading-button";
import LoadingImg from "@/components/loading-img";
import md from "@/rebuild/json/md.json";
import config from "@/rebuild/json/config.json";

const newInfo = {
  file: "",
  time: 0,
  modifyTime: 0,
  summary: "",
  images: []
}

export default {
  name: "RecordDetail",
  components: {LoadingImg, LoadingButton, SingleButton, SvgIcon},
  layout: 'backend',
  data() {
    return {
      record,
      id: '',
      info: {},
      saving: {
        b: false,
        state: ''
      },
      tempRecord: [],
      text: '',
      hasCache: false,
    }
  },
  head (){
    return {
      title: (this.id === 'new'?'新建':this.info.summary) + config.SEOTitle,
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,后台管理` },
      ],
    }
  },
  watch: {
    async id() {
      if (this.id !== 'new') {
        try {
          const res = await import(`!!raw-loader!~/rebuild/record/${this.id}.txt`);
          this.text = res.default
        } catch (err) {
          this.$message.error(parseAjaxError(err))
        }
      } else {
        this.text = '';
      }
    }
  },
  computed: {
    ...mapState('backend', ['gitUtil'])
  },
  beforeRouteEnter (to, from, next){
    next(vm=>{
      const id = to.query.id;
      const info = JSON.parse(JSON.stringify(id === 'new' ?
        newInfo : record.find(v => v.file === id) || null));
      if (info === null){
        vm.$message.error(`未找到id为{${id}}的文章!`);
        vm.$router.replace('/backend/record')
      }else{
        vm.id = id;
        vm.hasCache = getCache(`article-${id}`) != null;
        vm.info = info;
      }
    })
  },
  methods: {
    delCache (){
      if (!this.hasCache) return ;
      delCache(`record-${this.id}`);
      delCache(`record-${this.id}-text`);
      this.$message.success('草稿已删除');
      this.hasCache = false;
    },
    useCache (){
      if (!this.hasCache) return ;
      this.info = JSON.parse(getCache(`record-${this.id}`));
      this.text = getCache(`record-${this.id}-text`);
      this.$message.success('草稿已加载');
    },
    saveCache (){
      setCache(`record-${this.id}`, JSON.stringify(this.info));
      setCache(`record-${this.id}-text`, this.text);
      this.$message.success('草稿已保存');
      this.hasCache = true;
    },
    // ---- change ----
    delImg(idx) {
      this.info.images.splice(idx, 1)
    },
    editImg(e) {
      this.info.images.splice(parseInt(e.target.getAttribute('data-idx')), 1, e.target.value)
    },
    addImg() {
      this.info.images.push('')
    },
    async save() {
      if (this.saving.b) return;
      if (this.gitUtil) {
        const info = this.info;
        if (!info.images.length) {
          return this.$message.warning('封面不能为空!')
        }
        this.saving = {
          b: true,
          state: '保存中...'
        };
        // summary
        info.summary = this.text.substr(0, 30) + (this.text.length >= 30 ? '... ...' : '')
        let file = new Date().getTime();
        info.modifyTime = file;
        if (this.id !== 'new') {
          // 不改file
          file = this.id;
        } else {
          // 添加
          // record +1
          info.time = file;
          info.file = file.toString();
          this.record.push(JSON.parse(JSON.stringify(info)));
        }
        // 执行更新
        // 更新本地record
        for (let i=0;i<this.record.length;i++) {
          if (this.record[i].file === this.id) {
            this.record[i] = info;
            break
          }
        }
        this.saving.state = '更新:record.json'
        sortByTime(this.record)
        // 更新
        const res = await this.gitUtil.updateRecord({
          file: file,
          content: this.text,
          recordList: this.record
        }, this.saving);
        if (res[0]) {
          this.$message.success('上传成功!');
          window.location.reload()
        } else {
          this.$message.error(parseAjaxError(res[1]))
        }
        this.saving = {
          b: false,
          state: '',
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
.record-detail{
  flex-direction: column;
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
      box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);
      justify-content: center;
      background: #ff8595;
      transition: all .15s linear;
      text-decoration: none;
      color: black;

      &:hover {
        box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.5);
      }

      > svg{
        width: 1.4rem;
        height: 1.4rem;
      }

      > span{
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
    > ::v-deep .loading-button{
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
    }
  }
  > .time{
    width: 60%;
    height: 3rem;
    justify-content: space-around;
    margin-left: auto;

    > span{
      color: #0003ff;
      font-size: 0.9rem;

      > span{
        font-size: 0.9em;
        color: black;
        margin-right: 0.5rem;
      }
    }
  }
  > .edit{
    margin: 1rem;
    width: calc(100% - 2rem);
    > .images{
      flex-wrap: wrap;
      > .head{
        font-size: 0.95rem;
        margin-right: 1rem;
        width: 100%;
        padding-left: 1rem;
        > svg{
          width: 2.6rem;
          height: 2.6rem;
          margin-right: 0.5rem;
        }
      }
      > .list-item{
        flex-direction: column;
        margin: 0.6rem 1rem;
        border: 1px solid #bfbfbf;
        padding: 0.4rem;
        border-radius: 0.2rem;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, .5);
        > .bottom{
          margin-top: 0.5rem;
          > input{
            width: 8rem;
            font-size: 0.85rem;
            padding: 0.2rem;
          }
        }
      }
      > .add{
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

        > svg{
          width: 1.2rem;
          height: 1.2rem;
          fill: white;
        }
      }
    }
    > .text{
      width: 95%;
      padding: 1rem 2.5%;
      margin: 1rem 0;
      border-top: 2px dashed gray;
      display: block;
      > span{
        font-size: 1.1rem;
        margin-bottom: 1rem;
        >svg{
          width: 1.8rem;
          height: 1.8rem;
          margin-right: 0.5rem;
        }
      }
      > textarea{
        width: calc(100% - 0.6rem);
        min-height: 10rem;
        font-size: 0.95rem;
        padding: 0.3rem;
      }
    }
  }
}
</style>
