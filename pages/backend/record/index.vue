<template>
  <div class="record" flex>
    <div class="head" flex>
      <label class="search">
        <span>{{ $i18n('search') }}</span>
        <input v-model="search"/>
      </label>
      <single-button class="select-" :active="selecting"
                     @click.native="selecting=!selecting">{{selecting?$i18n('cancel'):$i18n('choose')}}</single-button>
      <NuxtLink to="/backend/record/detail?id=new">
        <loading-button icon="add" class="new">{{ $i18n('new') }}</loading-button>
      </NuxtLink>
    </div>
    <div class="delete" v-if="selecting" flex>
      <a>{{deleting.state}}</a>
      <single-button class="del-btn" :disabled="deleting.b" @click.native="deleteSome">{{ $i18n('del') }}</single-button>
      <span class="check-box" :class="{active: allSelected}" @click="changeSelectAll"></span>
      <span class="txt">{{ $i18n('chooseAll') }}</span>
    </div>
    <div class="delete" v-else-if="deleting.b" flex>
      <a>{{deleting.state}}</a>
    </div>
    <div class="body">
      <table>
        <thead>
        <tr>
          <td>{{ $i18n('image') }}</td>
          <td>{{ $i18n('content') }}</td>
          <td>{{ $i18n('operate') }}</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in searchResult" :key="item.file">
          <NuxtLink class="link" tag="td" :to="'/backend/record/detail?id='+item.file">
            <loading-img :src="item.images[0]" :size="[-1,-1]"/>
          </NuxtLink>
          <td>
            <span>{{ item.summary }}</span>
          </td>
          <td>
            <span v-if="selecting" :class="{active: selectList.indexOf(item.file)!==-1}" class="check-box"
                  @click="toggleSelect(item.file)"></span>
            <single-button class="del-btn" v-else @click.native="deleteItem([item.file])">{{ $i18n('del') }}</single-button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {parseAjaxError, sortByTime} from "@/utils/utils";

import record from '~/rebuild/json/record.json'
import SingleButton from "@/components/single-button";
import LoadingImg from "@/components/loading-img";
import LoadingButton from "@/components/loading-button";
import {mapState} from "vuex";
import config from "@/rebuild/json/config.json";

export default {
  name: "RecordList",
  components: {LoadingButton, LoadingImg, SingleButton},
  layout: 'backend',
  data() {
    return {
      record,
      search: '',
      deleting: {
        b: false,
        state: ''
      },
      selecting: false,
      selectList: []
    }
  },
  head (){
    return {
      title: '记录列表' + config.SEOTitle,
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,后台管理` },
      ],
    }
  },
  computed: {
    ...mapState('backend', ['gitUtil']),
    searchResult() {
      if (this.search === '') return this.record;
      const lis = [];
      this.record.forEach(e => {
        if (e.summary.search(this.search) !== -1) {
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
      const idx = this.selectList.indexOf(item);
      if (idx === -1) {
        this.selectList.push(item)
      } else {
        this.selectList.splice(idx, 1);
      }
    },
    async deleteSome() {
      if (this.selectList.length) {
        await this.deleteItem(this.selectList.slice())
      }
    },
    async deleteItem(files) {
      if (this.deleting.b) return;
      if (this.gitUtil) {
        if (confirm(this.$i18n('configDelete'))) {
          let err = null;
          this.deleting = {
            bool: true,
            state: this.$i18n('_update')+'record.json'
          };
          // 更新record
          const newRecordList = [];
          for (let i = 0; i < this.record.length; i++) {
            if (files.indexOf(this.record[i].file) === -1) {
              newRecordList.push(this.record[i]);
            }
          }
          sortByTime(newRecordList);
          let res = await this.gitUtil.updateJsonFile('record.json', newRecordList);
          if (res[0]) {
            // 删除文件夹
            res = await this.gitUtil.removeSome(files, this.deleting, 'record');
            if (res[0]) {
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
            bool: false,
            state: ''
          };
        }
      } else {
        this.$message.warning(this.$i18n('needLogin'));
        this.$emit('login')
      }
    },
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";
.record{
  min-height: 90%;
  flex-direction: column;
  > .head{
    width: 100%;
      margin: 1rem 0 0.5rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid gray;
    justify-content: space-between;
    flex-wrap: wrap;
    > .search{
      margin-left: 1rem;
      > span{
        margin-right: 1rem;
        font-size: 0.95rem;
      }
      > input{
        padding: 0.2rem;
        border-radius: 0.25em;
        font-size: 0.88rem;
        border: 1px solid gray;
        width: 10rem;
      }
    }
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
  > .body{
    width: 95%;
    margin: 1rem 0;
    > table{
      width: 100%;
      tbody{
        tr{
          height: 8rem;
          td{
            text-align: center;
            &:nth-child(1){
              width: 25%;
            }
            &:nth-child(2){
              width: 65%;
            }
            &.link{
              cursor: pointer;
            }
            ::v-deep .loading-img{
              width: 100%;
              img{
                width: 100%;
                max-height: 10rem;
                object-fit: cover;
              }
            }
            > span{
              @include text-overflow(4);
            }
            > *{
              margin: 0 auto;
            }
          }
        }
      }
    }
  }
}
</style>
