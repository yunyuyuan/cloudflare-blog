<template>
  <div class="msg-board" flex>
    <div class="head" flex>
      <svg-icon name="comments"/>
      <h1>{{ $i18n('msgBoard') }}</h1>
    </div>
    <the-comment title="msg-board"/>
  </div>
</template>

<script>
import TheComment from "~/block/comment/index";
import SvgIcon from "~/components/svg-icon";
import '~/rebuild/markdown.scss'
import config from "@/rebuild/json/config.json";

export default {
  name: "index",
  components: {SvgIcon, TheComment},
  head () {
    return {
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,留言板,msg-board` },
      ],
      title: '留言板' + config.SEOTitle
    }
  },
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.msg-board{
  width: 90%;
  max-width: 60rem;
  margin: 1rem 0;
  flex-direction: column;
  flex-shrink: 0;
  > .head{
    width: 100%;
    margin-bottom: 1rem;
    background: #171717;
    box-shadow: 0 0 1rem rgba(255, 255, 255, 0.6);
    justify-content: center;
    padding: 0.6rem 0;
    border-radius: 0.2rem;
    > svg{
      width: 2.4rem;
      height: 2.4rem;
    }
    > h1{
      font-size: 1.15rem;
      margin-left: 1rem;
      color: white;
    }
  }
  ::v-deep .comment{
    width: 100%;
    > .list{
      order: -1;
      margin: 1rem 0;
      padding-top: 0;
      padding-bottom: 1rem;
      border-top: none;
      border-bottom: 2px solid gray;
    }
    > .write{
      margin-bottom: 1rem;
    }
  }
  @include media{
    width: 98%;
    ::v-deep .comment{
      >.write{
        width: 95%;
      }
    }
  }
}
</style>
