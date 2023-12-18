<template>
  <div class="comments" flex>
    <div class="head" flex>
      <div class="search" flex>
        <input @keydown.enter="doSearch()" v-model="search"/>
        <single-button :size="0.95" @click.native="doSearch()">{{ $i18n('search') }}</single-button>
      </div>
      <span>{{processing.state}}</span>
      <select v-model="filter" @change="doSearch()">
        <option selected value="">{{ $i18n('all') }}</option>
        <option value="open">{{ $i18n('normal') }}</option>
        <option value="closed">{{ $i18n('closed') }}</option>
      </select>
    </div>
    <div class="loading" v-if="searching" flex>
      <svg-icon name="loading"/>
    </div>
    <div class="body" v-else>
      <table>
        <thead>
          <tr>
            <th>{{ $i18n('title') }}</th>
            <th>{{ $i18n('user') }}</th>
            <th>{{ $i18n('content') }}</th>
            <th>{{ $i18n('operate') }}</th>
          </tr>
        </thead>
        <tbody v-viewer>
          <tr v-for="item in list" :key="item.id">
            <td>
              <svg-icon :name="item.state.toLowerCase()==='open'?'checked':'unchecked'"/>
              <a :href="calcHref(item.title)">{{calcTitle(item.title)}}</a>
            </td>
            <td>
              <div flex>
                <img :src="item.avatar" alt="avatar"/>
                <a target="_blank" :href="`https://github.com/${item.nick}`">{{item.nick}}</a>
              </div>
            </td>
            <td>
              <span class="--markdown" v-html="calcMdToHtml(item.content)"></span>
            </td>
            <td>
              <single-button class="off" :disabled="processing.b" v-if="item.state.toLowerCase()==='open'" :size="0.9" @click.native="closeIssue(item.id)">
                {{ $i18n('close') }}</single-button>
              <single-button class="on" :disabled="processing.b" v-else :size="0.9" @click.native="reopenIssue(item.id)">
                {{ $i18n('reopen') }}</single-button>
              <single-button class="del-btn" :disabled="processing.b" @click.native="deleteIssue(item.id)">{{ $i18n('del') }}</single-button>
            </td>
          </tr>
        </tbody>
      </table>
      <pagination :page-now="pageNow" :item-count="count" :per-count="onePageItemsCount" @turn="turnPage"/>
    </div>
  </div>
</template>

<script>
import {closeOrDeleteComment, getPageCommentForBackend} from "~/utils/github_graphql";
import {parseMarkdown, processMdHtml} from "~/utils/parseMd";
import {hljsAndInsertCopyBtn} from "~/utils/highlight";
import md from '~/rebuild/json/md.json'
import {mapState} from "vuex";
import SingleButton from "@/components/single-button";
import SvgIcon from "@/components/svg-icon";
import Pagination from "@/components/pagination";
import '~/rebuild/markdown.scss'
import config from "@/rebuild/json/config.json";

export default {
  name: "Comment",
  components: {Pagination, SvgIcon, SingleButton},
  layout: 'backend',
  data (){
    return {
      searching: false,
      processing: {
        b: false,
        state: ''
      },
      search: '',
      filter: '',
      count: 0,
      list: [],
      onePageItemsCount: 20,
      pageNow: 1
    }
  },
  head (){
    return {
      title: '评论管理' + config.SEOTitle,
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,后台管理` },
      ],
    }
  },
  created() {
    if (process.server) return;
    this.doSearch()
  },
  computed: {
    ...mapState('backend', ['token'])
  },
  methods: {
    async doSearch(cursor) {
      this.searching = true;
      const res = await getPageCommentForBackend({
        state: this.filter,
        title: this.search,
        count: this.onePageItemsCount,
        cursor
      });
      if (res[0]) {
        const data = res[1].data.data.search;
        this.count = data.issueCount;
        this.list = [];
        for (const e of data.nodes) {
          this.list.push({
            id: e.id,
            number: e.number,
            avatar: e.author.avatarUrl,
            nick: e.author.login,
            site: e.author.url,
            state: e.state,
            title: e.title,
            content: e.body,
            identity: e.authorAssociation,
          });
        }
      }else{
        this.$message.error(this.$i18n('getCmtErr')+':'+res[1])
      }
      this.searching = false;
      this.$nextTick(()=>{
        this.$el.querySelectorAll('span.--markdown:not([parsed])').forEach(el=>{
          el.setAttribute('parsed', '');
          el.querySelectorAll('pre>code:not(.hljs)').forEach(el => {
            el.innerText = el.innerText.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            hljsAndInsertCopyBtn(el);
          })
          processMdHtml(el, true, md)
        })
      })
    },
    calcHref (title){
      const tail = title.replace(/^COMMENT-/, '');
      if (tail === 'msg-board'){
        return '/msg-board'
      }else{
        return '/article/'+tail
      }
    },
    calcTitle (title){
      const tail = title.replace(/^COMMENT-/, '');
      if (tail === 'msg-board'){
        return '留言板'
      }else{
        return md.find(v => v.file === tail)?.name
      }
    },
    async turnPage(p) {
      await this.doSearch(`,after: "${btoa(`cursor:${(p-1)*this.onePageItemsCount}`)}"`);
      this.pageNow = p;
    },
    calcMdToHtml (text){
      return parseMarkdown(text
          .replace(/</g, '&lt;')
          .replace(/(^|\s*)>/g, '$1&gt;'), true)
    },
    async reopenIssue(id) {
      this.processing.state = this.$i18n('reopening')
      await this.doIt('reopen', id)
    },
    async closeIssue(id) {
      this.processing.state = this.$i18n('closing')
      await this.doIt('close', id)
    },
    async deleteIssue (id){
      if (confirm(this.$i18n('confirmDelete'))) {
        this.processing.state = this.$i18n('deleting')
        await this.doIt('delete', id)
      }
    },
    async doIt (s, id){
      if (this.processing.b) return;
      this.processing.b = true;
      const res = await closeOrDeleteComment(s, id, this.token)
      if (res[0]){
        this.doSearch().then()
      }else{
        this.$message.error(this.$i18n('operateErr')+':'+res[1])
      }
      this.processing = {
        b: false,
        state: ''
      }
    }
  }
}
</script>

<style scoped lang="scss">
.comments{
  flex-direction: column;
  min-height: 90%;
  >.head{
    width: calc(100% - 1rem);
    padding: 1rem;
    border-bottom: 1px solid gray;
    flex-wrap: wrap;
    >.search{
      border: 1px solid gray;
      >input{
        border: none;
        font-size: 0.9rem;
        padding: .2rem 0 .2rem .2rem;
        width: 12rem;
      }
      >.single-button{
        background: #007bff;
        border-radius: 0;
        word-break: keep-all;
      }
    }
    >span{
      color: red;
      margin: 0 0.5rem 0 auto;
      font-size: .8rem;
    }
    >select{
      font-size: .95rem;
      padding: .2rem .5rem;
    }
  }
  >.loading{
    width: 100%;
    margin: 3rem 0;
    justify-content: center;
    >svg{
      width: 5rem;
      height: 5rem;
    }
  }
  >.body{
    width: calc(100% - 3rem);
    margin: 0 0.5rem 0 2.5rem;
    padding: 1rem 0;
    >table{
      width: 100%;
      td{
        &:nth-child(1){
          width: 20%;
          position: relative;
          >svg{
            position: absolute;
            left: -2rem;
            width: 1.6rem;
            height: 1.6rem;
          }
          >a{
            font-size: 0.85rem;
          }
        }
        &:nth-child(2){
          width: 10%;
          >div{
            flex-direction: column;
            >img{
              width: 2.5rem;
              height: 2.5rem;
            }
            >a{
              font-size: .85rem;
              text-decoration: none;
              color: black;
              &:hover{
                color: #001aff;
              }
            }
          }
        }
        &:nth-child(3){
          width: 60%;
        }
        &:nth-child(4){
          width: 10%;
          >.single-button{
            width: 2.4rem;
            margin: 0 auto;
            &:last-of-type{
              margin-top: 0.5rem;
            }
          }
          >.off{
            background: #bb5700;
          }
          >.on{
            background: #00bb00;
          }
        }
      }
    }
  }
}
</style>
