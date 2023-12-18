<template>
  <div id="index">
    <img class="bg" src="/image/home.png" alt="bg"/>
    <section class="body" flex>
      <div class="back-end">
        <Menu :login-state="loginState"/>
        <login @gitUtil="initGitUtil"/>
        <div class="body">
          <Nuxt keep-alive/>
        </div>
      </div>
    </section>
    <message ref="message"/>
  </div>
</template>

<script>
import Message from "~/block/Message";
import Vue from 'vue';
import '~/utils/filter';
import Menu from "~/pages/backend/menu";
import config from "~/rebuild/json/config.json";
import {mapMutations} from "vuex";
import Login from "~/pages/backend/login";
import mixins from "@/utils/mixins";

export default {
  components: {Login, Menu, Message},
  mixins: [mixins],
  data (){
    return {
      loginState: 'none', // none | doing | ok
    }
  },
  head: {
      meta: [
        { hid: 'description', name: 'description', content: `${config.name}的博客 后台管理 backends` }
      ],
      title: 'manage'
  },
  mounted() {
    Vue.prototype.$message = this.$refs.message;
  },
  methods: {
    ...mapMutations('backend', ['setGitUtil']),
    initGitUtil ({instance, token}){
      // verify
      this.loginState = 'doing';
      instance.verifyToken().then(res=>{
        if (res[0] && res[1].login === config.githubName) {
          this.setGitUtil([instance, token]);
          this.$message.success('登录成功!');
          this.loginState = 'ok';
          return
        }
        this.$message.error('token错误!');
        localStorage.removeItem('login-token');
        this.loginState = 'none';
      })
    },
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.back-end {
  width: 100%;
  height: 100%;
  position: relative;
  flex-shrink: 0;

  > .body{
    position: absolute;
    width: calc(100% - 9rem);
    height: 100%;
    overflow-y: auto;
    right: 0;
    top: 0;
    align-items: flex-start;
    transition: all .2s ease-out;
    > div{
      background: white;
      width: calc(100% - 4rem);
      overflow: hidden;
      margin: 1rem 1rem 1rem 3rem;
      border-radius: 0.6rem;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    }
  }
  ::v-deep .check-box{
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;
    border: 1px solid gray;
    border-radius: 50%;
    &.active{
      background: #ff3700;
    }
  }
  ::v-deep .single-button.del-btn{
    border-radius: 0.2rem;
    background: #ff344f;
    width: 2.4rem;
    margin: 0 0.5rem;
    &:not(.disabled):hover{
      background: #f1314a;
    }
  }
  ::v-deep .init-load{
    width: 100%;
    margin-top: 2rem;
    justify-content: center;
    >svg{
      width: 5rem;
      height: 5rem;
    }
  }
  @include media{
    >.menu{
      background: rgba(43, 43, 48, 0.75);
    }
    >.body{
      width: 100%;
      >div{
        width: 99% !important;
        margin-left: 0.5% !important;
      }
    }
  }
}
</style>
