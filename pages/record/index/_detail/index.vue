<template>
  <top-dialog class="record-detail" v-if="info.hasOwnProperty('images')" @click.native.self="close" :innerStyle="style">
    <a @click="close">{{ $i18n('close') }}</a>
    <div class="image" flex v-viewer>
      <loading-img v-for="(i,idx) in info.images" :src="i" :key="idx" :data-viewer="true"/>
    </div>
    <span write-font>
      <svg-icon name="text"/>
      <time>{{info.time|time(false)}}</time>{{ text }}
    </span>
  </top-dialog>
</template>

<script>
import record from "~/rebuild/json/record.json";
import LoadingImg from "@/components/loading-img";
import TopDialog from "@/components/top-dialog";
import SvgIcon from "@/components/svg-icon";
import config from "@/rebuild/json/config.json";

export default {
  name: "Detail",
  components: {SvgIcon, TopDialog, LoadingImg},
  data() {
    return {
      loading: false,
      text: '',
      style: {}
    }
  },
  head () {
    return {
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,个人记录,records` },
      ],
    }
  },
  async asyncData({params, redirect}) {
    const id = params.detail;
    const info = record.find(v=>v.file === id)||{};
    if (!info.file){
      return redirect('/record')
    }
    return {
      id,
      text: (await import(`!!raw-loader!~/rebuild/record/${id}.txt`)).default,
      info,
    }
  },
  created() {
    if (process.server) return;
    const parent = document.querySelector(`section.body > .record > .list > a[data-file="${this.info.file}"]`);
    if (parent) {
      const { x, y, width, height} = parent.getBoundingClientRect();
      this.style = {
        width: width+'px',
        height: height+'px',
        top: y+'px',
        left: x+'px',
        opacity: 0
      }
    }
  },
  mounted() {
    setTimeout(()=>{
      this.style = {
        width: '80%',
        height: '90%',
        top: '5vh',
        left: '10vw',
        opacity: 1
      }
    })
  },
  methods: {
    close (){
      this.$router.push('/record')
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.record-detail{
  ::v-deep > .inner{
    @include pc{
      transition: all .2s ease-out;
      max-height: unset;
      max-width: unset;
      position: absolute;
    }
    flex-direction: column;
    border-radius: 0;
    > .image{
      width: 100%;
      flex-wrap: wrap;
      flex-shrink: 0;
      .loading-img{
        width: calc(50% - 0.2rem) !important;
        height: unset !important;
        margin: 0.1rem;
        &:not(:last-of-type){
          border-bottom: 1px solid white;
        }
        img{
          object-fit: contain;
        }
      }
    }
    >.loading{
      width: 100%;
      justify-content: center;
      margin: 3rem 0;
      >svg{
        height: 5rem;
        width: 5rem;
      }
    }
    > span{
      width: 95%;
      border-top: 1px solid gray;
      font-size: 1.1rem;
      margin: 1rem 0 5rem 0;
      white-space: pre-wrap;
      padding-top: 1.5rem;
      font-weight: bold;
      position: relative;
      >svg{
        position: absolute;
        width: 2rem;
        height: 1.6rem;
        top: -0.8rem;
        left: 0.5rem;
        padding: 0 0.2rem;
        background: white;
      }
      >time{
        position: absolute;
        right: 0;
        top: -0.5rem;
        background: white;
        font-size: 0.85rem;
        font-family: "Source Code Pro",serif;
        line-height: 1rem;
        color: #ff3b00;
      }
    }
    >a{
      display: none;
    }
  }
  @include media{
    ::v-deep >.inner{
      width: 100% !important;
      min-height: 100% !important;
      position: absolute;
      top: 0 !important;
      left: 0 !important;
      border-radius: 0;
      opacity: 1 !important;
      >a{
        cursor: pointer;
        display: flex;
        position: fixed;
        right: 0;
        top: 0;
        background: rgba(255, 0, 0, 0.6);
        color: white;
        padding: 0.3rem 1rem;
        font-size: 0.95rem;
        z-index: 2;
      }
    }
  }
}
</style>
