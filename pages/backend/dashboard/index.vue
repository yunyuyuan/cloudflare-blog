<template>
  <div class="dashboard">
    <div class="row article">
      <the-article/>
    </div>
    <div class="row comment">
      <the-comment/>
    </div>
  </div>
</template>

<script>
import Article from "./fragments/article";
import Comment from "./fragments/comment";
import config from "@/rebuild/json/config.json";

export default {
  name: "Dashboard",
  layout: 'backend',
  components: {TheArticle: Article, TheComment: Comment},
  data (){
    return {
      md: [],
      mdInited: '',
      record: [],
      recordInited: '',
      option: {},
    }
  },
  head (){
    return {
      title: '统计面板' + config.SEOTitle,
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,后台管理` },
      ],
    }
  },
}
</script>

<style scoped lang="scss">
.dashboard{
  min-height: 90%;
  >.row{
    width: 90%;
    margin: 2rem 5%;
    display: flex;
    align-items: center;
  }
}
</style>
