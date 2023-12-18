<template>
  <top-dialog class="upload-image">
    <input ref="input" @change="inputImage" type="file" accept="image/*"/>
    <single-button @click.native="submit">提交</single-button>
  </top-dialog>
</template>

<script>
import axios from "axios";
import config from '~/rebuild/json/config.json'
import SingleButton from "@/components/single-button";
import TopDialog from "@/components/top-dialog";

export default {
  name: "UploadImg",
  components: {TopDialog, SingleButton},
  data() {
    return {
      file: null
    }
  },
  methods: {
    inputImage() {
      const files = this.$refs.input.files;
      const file = files.length?files[0]:null;
      if (file && file.size / 1024 ** 2 < 5) {
        this.file = file;
      }
    },
    submit (){
      const form = new FormData();
      form.append('smfile', this.file)
      axios({
        url: config.corsServer+'https://sm.ms/api/v2/upload',
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'uNjOYgMN4AyQwvjroqt3Z1zlWEKTr8a4'
        },
        data: form
      }).then(res=>{
        console.log(res)
      }).catch(err=>{
        console.log()
      })
    }
  }
}
</script>

<style scoped lang="scss">
.upload-image{
  ::v-deep > .inner{
  }
}
</style>
