<template>
  <div class="pwd" flex>
    <div class="wrap" flex>
      <div class="input-pwd" flex>
        <float-input :name="'管理密码'" :value="input" @input="getPwd" @submit="submitPwd"/>
        <single-button @click.native="submitPwd">提交</single-button>
      </div>
      <loading-button @click.native="direct" :loading="false" icon="middle-finger">就不输密码</loading-button>
    </div>
  </div>
</template>

<script>
import {checkPwd, dontInput} from "~/pages/backend/utils";
import FloatInput from "@/components/float-input";
import SingleButton from "@/components/single-button";
import LoadingButton from "@/components/loading-button";

export default {
name: "pwd",
  components: {LoadingButton, SingleButton, FloatInput},
  data (){
    return {
      input: ''
    }
  },
  methods: {
    getPwd (v){
      this.input = v[1];
    },
    submitPwd (){
      if (checkPwd(this.input)){
        localStorage.setItem('pwd', this.input);
        location.reload();
      }else{
        this.$message.error('密码错误!');
      }
    },
    direct (){
      localStorage.setItem('pwd', dontInput);
      location.reload();
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.pwd{
  width: 100%;
  height: 100%;
  justify-content: center;
  background: #0000009e;
  >.wrap {
    flex-direction: column;
    justify-content: center;
    background: white;
    padding: 3rem 4rem;
    box-shadow: 0 0 1rem rgba(255, 255, 255, 0.4);
    border-radius: .6rem;
    ::v-deep > .input-pwd {
      margin-bottom: 1rem;
      .float-input {
        width: 15rem;
      }

      .single-button {
        margin-left: .8rem;
        background: #2896d9;
      }
    }

    ::v-deep > .loading-button {
      background: gray;
    }
  }
}
</style>
