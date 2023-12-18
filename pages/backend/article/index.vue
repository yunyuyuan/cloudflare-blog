<template>
  <div class="md" flex>
    <div class="head" flex>
      <label class="search" flex>
        <span>{{ $i18n('search') }}</span>
        <input v-model="search"/>
        <b v-if="searchTags.length">|</b>
        <a v-for="tag in searchTags"
           @click="toggleSearchTag(tag)"
           :style="{background: $options.filters.color(tag)}">{{ tag }}</a>
      </label>
      <div flex>
        <single-button class="select-" :active="selecting"
                       @click.native="selecting=!selecting">{{selecting?$i18n('cancel'):$i18n('choose')}}</single-button>
        <NuxtLink to="/backend/article/detail?id=new">
          <loading-button icon="add" class="new">{{ $i18n('new') }}</loading-button>
        </NuxtLink>
      </div>
    </div>
    <div class="delete" v-if="selecting" flex>
      <a>{{deleting.state}}</a>
      <single-button class="del-btn" :disabled="deleting.b||selectList.length===0" @click.native="deleteSome">{{ $i18n('del') }}</single-button>
      <span class="check-box" :class="{active: allSelected}" @click="changeSelectAll"></span>
      <span class="txt">{{ $i18n('chooseAll') }}</span>
    </div>
    <div class="delete" v-else-if="deleting.b" flex>
      <a>{{deleting.state}}</a>
    </div>
    <div class="list" flex>
      <table>
        <thead>
        <tr>
          <td class="cover">{{ $i18n('cover') }}</td>
          <td class="title">{{ $i18n('title') }}</td>
          <td class="summary">{{ $i18n('describe') }}</td>
          <td class="time">{{ $i18n('time') }}</td>
          <td class="tags">{{ $i18n('tag') }}</td>
          <td class="operate">{{ $i18n('operate') }}</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in searchResult" :key="item.file">
          <NuxtLink tag="td" class="cover" :to="'/backend/article/detail?id='+item.file">
            <loading-img :src="item.cover || '/image/i.png'" :size="[-1, 8]"/>
          </NuxtLink>
          <td class="title"><span>{{ item.name }}</span></td>
          <td class="summary"><span>{{ item.summary }}</span></td>
          <td class="time">
            <div flex>
              <span>{{ $i18n('create') }}:</span>
              <a>{{ item.time | time(true) }}</a>
            </div>
            <div flex>
              <span>{{ $i18n('update') }}:</span>
              <a>{{ item.modifyTime | time(true) }}</a>
            </div>
          </td>
          <td class="tags">
            <div flex>
              <span v-for="tag in item.tags"
                    :style="{background: $options.filters.color(tag)}"
                    :title="`${$i18n('search')}:${tag}`"
                    @click="toggleSearchTag(tag)"
              >{{ tag }}</span>
            </div>
          </td>
          <td class="operate">
            <span v-if="selecting" :class="{active: selectList.indexOf(item.file)!==-1}" class="check-box"
                  @click="toggleSelect(item)"></span>
            <single-button v-else class="del-btn" @click.native="removeMd([item.file])"
                           :disabled="deleting.b">{{ $i18n('del') }}</single-button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {parseAjaxError, sortByTime} from "@/utils/utils";
import md from '~/rebuild/json/md.json'
import SingleButton from "@/components/single-button";
import LoadingImg from "@/components/loading-img";
import LoadingButton from "@/components/loading-button";
import {mapState} from "vuex";
import config from "@/rebuild/json/config.json";

export default {
  name: "ArticleList",
  components: {LoadingButton, LoadingImg, SingleButton},
  layout: 'backend',
  data() {
    return {
      md,
      deleting: {
        b: false,
        state: ''
      },
      selecting: false,
      searchTags: [],
      selectList: [],
      search: '',
    }
  },
  head (){
    return {
      title: '文章列表' + config.SEOTitle,
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,后台管理` },
      ],
    }
  },
  computed: {
    ...mapState('backend', ['gitUtil']),
    searchResult() {
      if (this.search === ''&& this.searchTags.length===0) return this.md
      const lis = [];
      this.md.forEach(e => {
        if (e.name.search(this.search) !== -1 && this.searchTags.every(tag => e.tags.indexOf(tag) !== -1)) {
          lis.push(e)
        }
      })
      return lis
    },
    allSelected (){
      return this.selectList.length===this.searchResult.length;
    },
  },
  methods: {
    toggleSearchTag (tag){
      const idx = this.searchTags.indexOf(tag)
      if (idx!==-1){
        this.searchTags.splice(idx, 1)
      }else{
        this.searchTags.push(tag)
      }
    },
    changeSelectAll (){
      if (!this.allSelected) {
        this.selectList = [];
        this.searchResult.forEach(v => {
          this.selectList.push(v.file);
        })
      }else{
          this.selectList = [];
      }
    },
    toggleSelect(item) {
      const idx = this.selectList.indexOf(item.file);
      if (idx === -1) {
        this.selectList.push(item.file)
      } else {
        this.selectList.splice(idx, 1);
      }
    },
    async deleteSome() {
      if (this.selectList.length) {
        await this.removeMd(this.selectList);
      }
    },
    async removeMd(files) {
      if (this.deleting.b) return;
      if (this.gitUtil) {
        if (confirm(this.$i18n('configDelete'))) {
          let err = null;
          this.deleting = {
            b: true,
            state: this.$i18n('_update')+'md.json'
          };
          // 更新md
          const newMdList = [];
          for (let i = 0; i < this.md.length; i++) {
            if (files.indexOf(this.md[i].file) === -1) {
              newMdList.push(this.md[i]);
            }
          }
          sortByTime(newMdList);
          let res = await this.gitUtil.updateMdList({mdList: newMdList}, this.deleting);
          if (res[0]) {
            // 删除文件夹
            res = await this.gitUtil.removeSome(files, this.deleting, 'md');
            if (res[0]){
              this.$message.success(this.$i18n('deleteOk'));
              this.$emit('refresh')
            } else {
              err = res[1];
            }
          } else {
            err = res[1];
          }
          if (err) {
            this.$message.error(parseAjaxError(err));
          }
          this.deleting = {
            b: false,
            state: ''
          };
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
.md{
  min-height: 90%;
  flex-direction: column;
  > .head{
    width: 100%;
    margin: 1rem 0 0.5rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid gray;
    justify-content: space-between;
    flex-wrap: nowrap;
    > .search{
      flex-wrap: wrap;
      margin-left: 1rem;
      > span{
        margin-right: 1rem;
        font-size: 0.95rem;
      }
      >b{
        margin: 0 .3rem;
      }
      > input{
        padding: 0.2rem;
        border-radius: 0.25em;
        font-size: 0.88rem;
        border: 1px solid gray;
        width: 10rem;
      }
      >a{
        margin: .4rem 1rem .4rem 0;
        padding: 0.3rem 0.8rem;
        font-size: 0.8rem;
        border-radius: 0.2rem;
        color: white;
        cursor: pointer;
        transition: all .15s linear;
        &:hover{
          box-shadow: 0 .1rem .3rem rgba(0, 0, 0, .7);
        }
      }
    }
    >div{
      flex-wrap: nowrap;
      > a {
        text-decoration: none;
        ::v-deep .new {
          margin: 0 1rem 0 0;
          padding: 0.6rem 1.2rem;
          background: linear-gradient(to right, #e02bd2, #4444ff);

          > svg {
            width: 1.4rem;
            height: 1.4rem;
            fill: white;
          }

          > span {
            margin-left: 0.5rem;
            font-size: 0.95rem;
            color: white;
          }
        }
      }
      > .select-{
        margin: 0 1rem 0 auto;
        background: #00bb00;
      }
    }
  }
  >.delete{
    justify-content: flex-end;
    margin: 0.5rem 0;
    width: 100%;
    >a{
      margin-right: 0.5rem;
      font-size: 0.8rem;
      color: red;
    }
    >.check-box{
      margin: 0 0.5rem 0 1.5rem;
    }
    >.txt{
      margin-right: 0.5rem;
      font-size: 0.9rem;
    }
  }
  > .list{
    width: 95%;
    margin: 1rem 0;
    > table{
      width: 100%;
      tbody{
        tr{
          height: 8rem;
          td{
            text-align: center;
            &.title, &.summary{
              > span{
                @include text-overflow(4);
              }
            }
            &.cover{
              cursor: pointer;
              width: 15%;
              ::v-deep img{
                height: 8rem !important;
                object-fit: contain !important;
              }
            }
            &.title{
              width: 25%;
              font-size: 1.04rem;
              word-break: break-all;
              white-space: pre-line;
            }
            &.summary{
              width: 26%;
              font-size: 0.85rem;
              color: #545454;
            }
            &.time{
              width: 12%;
              font-weight: 500;
              max-width: 10rem;
              > div{
                flex-direction: column;
                span, a{
                  word-break: keep-all;
                  white-space: nowrap;
                }
                > span{
                  font-size: 0.8rem;
                  margin-right: 0.4rem;
                }
                > a{
                  font-size: 0.88rem;
                  color: #0003ff;
                }
              }
            }
            &.tags{
              width: 15%;
              > div{
                flex-wrap: wrap;
                > span{
                  margin: 0.4rem 0.2rem;
                  padding: 0.3rem 0.8rem;
                  font-size: 0.8rem;
                  border-radius: 0.2rem;
                  color: white;
                  cursor: pointer;
                  transition: all .15s linear;
                  &:hover{
                    box-shadow: 0 .1rem .3rem rgba(0, 0, 0, .7);
                  }
                }
              }
            }
            &.operate{
              width: 8%;
              > *{
                margin: auto;
              }
            }
          }
        }
      }
    }
  }
  @include media{
    td.cover{
      width: 30% !important;
    }
    td.summary, td.time, td.tags{
      display: none;
    }
  }
}
</style>
