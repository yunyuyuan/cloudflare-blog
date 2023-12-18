<template>
  <top-dialog class="login" v-show="showLogin" @click.native.self="hide">
    <div class="head" flex>
      <svg-icon name="backend"/>
      <b>{{ $i18n('managerAccount') }}</b>
    </div>
    <div class="body" flex>
      <float-input :name="'token'" @input="input" :id="'token'" :size="1" :value="token"/>
      <span :class="{err: true, show: !token}" :title="$i18n('required')">
              <svg-icon name="warning"/>
            </span>
    </div>
    <div class="option">
      <label @click="remember = !remember" flex>
        <a :class="{active: remember}" flex></a>
        <span>{{ $i18n('rememberMe') }}</span>
      </label>
    </div>
    <div class="btn" flex>
      <single-button class="exit" @click.native="hide">{{ $i18n('cancel') }}</single-button>
      <single-button :class="{save: true, disabled: !token}" @click.native="save">{{ $i18n('save') }}</single-button>
    </div>
  </top-dialog>
</template>

<script>
import {mapMutations, mapState} from "vuex";

import config from "~/rebuild/json/config.json";
import {GithubUtils} from "~/utils/github_api";
import TopDialog from "@/components/top-dialog";
import SvgIcon from "@/components/svg-icon";
import FloatInput from "@/components/float-input";
import SingleButton from "@/components/single-button";

export default {
  name: "Login",
  components: {SingleButton, FloatInput, SvgIcon, TopDialog},
  data() {
    return {
      token: '',
      remember: false,
    }
  },
  computed: {
    ...mapState('backend', ['showLogin'])
  },
  created() {
    if (process.server) return;
    // 获取localStorage中配置
    this.token = localStorage.getItem('login-token') || '';
    if (this.token) {
      this.remember = true;
      this.commitUpdateGitutil();
    }
  },
  methods: {
    ...mapMutations('backend', ['toggleLogin']),
    save() {
      if (!this.token) return;
      if (this.remember) {
        //存储到localStorage
        localStorage.setItem('login-token', this.token);
      } else {
        // 删除localStorage
        localStorage.removeItem('login-token');
      }
      this.commitUpdateGitutil();
      this.toggleLogin(false)
    },
    commitUpdateGitutil() {
      this.$emit('gitUtil', {
        instance: new GithubUtils(
            this.token,
            config.githubName,
            config.repo,
            {
              name: config.githubName,
              email: config.githubEmail
            }),
        token: this.token
      });
    },
    input(payload) {
      this.token = payload[1];
    },
    hide (){
      this.toggleLogin(false)
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/style/public";
.login{
  ::v-deep > .inner{
    background: #efefef;
    > .head{
      background: white;
      padding: 0.6rem 10rem;
      border-radius: 1rem 1rem 0 0;
      justify-content: center;
      border-bottom: 1px solid gray;
      > svg{
        width: 2.4rem;
        height: 2.4rem;
      }
      > b{
        margin-left: 2rem;
        font-size: 1.08rem;
        word-break: keep-all;
      }
    }
    > .body{
      width: 100%;
      margin: 0.8rem 0;
      justify-content: center;
      > .float-input{
        width: 60%;
        margin: 1rem 0;
      }
      > .err{
        margin-left: 1rem;
        overflow: hidden;
        height: 0;
        &.show{
          height: unset;
        }
        > svg{
          width: 1.2rem;
          height: 1.2rem;
        }
      }
    }
    > .option{
      width: 80%;
      flex-direction: column;
      align-items: flex-start;
      > label{
        cursor: pointer;
        margin: 0.5rem 0;
        &:hover{
          > a{
            border-color: red;
          }
        }
        > a{
          width: 1rem;
          height: 1rem;
          justify-content: center;
          border-radius: 50%;
          border: 2px solid #252525;
          &:before{
            width: 100%;
            height: 100%;
            border-radius: inherit;
            content: '';
          }
          &.active{
            &:before{
              background: #ff7c17;
            }
          }
        }
        > span{
          font-size: 0.85rem;
          margin-left: 1rem;
        }
      }
    }
    > .btn{
      margin: 1rem 0;
      >.single-button{
        background: #808080;
        margin: 0 1rem;
        &:hover{
          background: #646464;
        }
        &.save{
          background: #004fff;
          &:hover{
            background: #0042d4;
          }
          &.disabled{
            background: #5f5f5f !important;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
</style>
