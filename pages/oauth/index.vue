<template>
  <div class="login" flex>
    <svg-icon :name="status"/>
    <strong v-html="$i18n(state)"></strong>
  </div>
</template>

<script>
import {tokenKey} from "~/utils/github_graphql";

import config from '~/rebuild/json/config.json'
import axios from "axios";
import {queryMap} from "~/utils/utils";
import SvgIcon from "@/components/svg-icon";

export default {
  name: "oauth",
  layout: "oauth",
  components: {SvgIcon},
  data() {
    return {
      state: 'processing',
      status: 'loading'
    }
  },
  head () {
    return {
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,oauth` },
      ],
      title: 'oauth' + config.SEOTitle
    }
  },
  created() {
    if (process.server) return ;
    const query = queryMap();
    if (query.code) {
      // 获取token
      axios({
        url: config.corsServer+'https://github.com/login/oauth/access_token',
        method: 'post',
        data: {
          client_id: config.oauth.client_id,
          client_secret: config.oauth.client_secret,
          code: query.code,
        }
      }).then(res => {
        const mather = res.data.match(/^access_token=([^&]+)&.*?$/);
        if (mather){
          this.state = 'oauthSuccess';
          this.status = 'success';
          localStorage.setItem(tokenKey, mather[1]);
          setTimeout(()=>{
            window.close();
          }, 500)
        }else{
          this.state = 'badParam';
          this.status = 'error';
        }
      }).catch(err=>{
        this.state = this.$i18n('errReq')+':'+err;
        this.status = 'error';
      })
    }else{
      this.state = 'omitCode';
      this.status = 'error';
    }
  }
}
</script>

<style scoped lang="scss">
.login{
  width: 100%;
  height: 100%;
  justify-content: center;
  background: white;
  >svg{
    width: 3rem;
    height: 3rem;
    margin-right: 1rem;
  }
  >strong{
    font-size: 1.2rem;
  }
}
</style>
