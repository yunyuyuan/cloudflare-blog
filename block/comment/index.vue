<template>
  <div class="comment" flex>
    <div class="token" flex>
      <div v-if="logined" class="logined" flex>
        <err-avatar :avatar="loginInfo.avatar" :url="loginInfo.url"/>
        <a class="nick" :href="loginInfo.url" target="_blank">{{ loginInfo.nick }}</a>
        <single-button :size="0.9" @click.native="logout">{{$i18n('logout')}}</single-button>
      </div>
      <div v-else class="login" flex>
        <a ref="a" :href="oauthUrl" target="_blank" @click="clickLogin">
          <loading-button icon="github" :loading="loging" :size="0.9" :class="{disabled: loging}">{{$i18n('login')}}</loading-button>
        </a>
      </div>
    </div>
    <write-comment @submit="submit" :loading="submitting"/>
    <list-comment ref="list" :title="this.title" :login="loginInfo.nick"/>
  </div>
</template>

<script>
import {createComment, getLoginInfo, getRepoId, logError, removeToken, tokenKey} from "~/utils/github_graphql";
import {parseAjaxError} from "~/utils/utils";
import config from "~/rebuild/json/config.json";
import ErrAvatar from "~/block/comment/errAvatar";
import WriteComment from "~/block/comment/Write";
import ListComment from "~/block/comment/List";
import SingleButton from "@/components/single-button";
import LoadingButton from "@/components/loading-button";

export default {
  name: "TheComment",
  components: {LoadingButton, SingleButton, ListComment, WriteComment, ErrAvatar},
  props: {
    title: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      token: null,
      loging: false,
      logined: false,
      loginInfo: {},
      submitting: false,
    }
  },
  computed: {
    name() {
      return config.name
    },
    oauthUrl (){
      return `https://github.com/login/oauth/authorize?`+
              `client_id=${config.oauth.client_id}&`+
              `redirect_uri=${config.oauth.redirect_uri}&`+
              `scope=public_repo`
    }
  },
  async created() {
    if (process.server) return;
    this.token = localStorage.getItem(tokenKey);
    if (this.token) {
      await this.doLogin(false);
    }
  },
  methods: {
    clickLogin (e){
      if (this.loging) {
        e.preventDefault();
      }else{
        removeToken();
        const handle = setInterval(()=>{
          const token = localStorage.getItem(tokenKey);
          if (token){
            this.token = token;
            this.doLogin(true);
            clearInterval(handle);
          }
        }, 500)
      }
    },
    async doLogin(remind) {
      if (process.server) return;
      if (this.loging || !this.token) return;
      this.loging = true;
      const res = await getLoginInfo(this.token);
      // 尝试使用localStorage的token登录
      if (res[0]) {
        localStorage.setItem(tokenKey, this.token);
        if (remind) {
          this.$message.success('登录成功!');
        }
        this.logined = true;
        const data = res[1].data.data.viewer;
        this.loginInfo = {
          avatar: data.avatarUrl,
          url: data.url,
          nick: data.login,
        }
        await getRepoId();
      } else {
        removeToken();
        if (remind) {
          this.$message.error(parseAjaxError(res[1]));
        }
      }
      this.loging = false;
    },
    logout() {
      this.logined = false;
      removeToken();
    },
    async submit(payload) {
      this.submitting = true;
      const res = await createComment({
        title: this.title,
        body: payload.text
      });
      if (logError.call(this, res, '评论成功!', '评论失败')) {
        setTimeout(async () => {
          await this.$refs.list.updatePage()
        }, 1000)
      }
      this.submitting = false;
    },
  }
}
</script>

<style scoped lang="scss">
.comment {
  background: white;
  flex-direction: column;
  padding: 1rem 0;
  flex-shrink: 0;

  > .token {
    width: 100%;
    margin-bottom: 2rem;

    > div {
      width: calc(100% - 2rem);
      padding: 0 1rem;
    }

    > .login {
      >a {
        text-decoration: none;
        ::v-deep .loading-button{
          background: linear-gradient(90deg, #0058ff, #169eff);
          >svg{
            fill: white;
          }
        }
      }
    }

    > .logined {
      ::v-deep .avatar {
        width: 2.8rem;
        height: 2.8rem;
        &:hover{
          transform: scale(1.1);
        }
      }

      > .nick {
        margin: 0 1rem;
        color: #000000;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
          color: #0040ff;
        }
      }

      > .single-button {
        background: #ff5f5f;

        &:hover {
          background: #ff3c3c;
        }
      }
    }
  }
}
</style>
