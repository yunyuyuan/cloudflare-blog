<template>
  <div class="home-page" flex>
    <div class="btns" flex>
      <NuxtLink to="/article" flex>
        <svg-icon name="article"/>
        <span class="name">{{ $i18n('articles') }}</span>
        <span write-font class="tip">{{ $i18n('articlesDesc') }}</span>
      </NuxtLink>
      <NuxtLink to="/record" flex>
        <svg-icon name="record"/>
        <span class="name">{{ $i18n('records') }}</span>
        <span write-font class="tip">{{ $i18n('recordsDesc') }}</span>
      </NuxtLink>
      <NuxtLink to="/msg-board" flex>
        <svg-icon name="comments"/>
        <span class="name">{{ $i18n('msgBoard') }}</span>
        <span write-font class="tip">{{ $i18n('msgBoardDesc') }}</span>
      </NuxtLink>
    </div>
    <div class="info" flex>
      <div class="head" flex>
        <img src="/image/i.png" alt="self"/>
        <span write-font class="name">{{ config.name }}</span>
      </div>
      <div class="body" flex>
        <span write-font>{{ config.describe }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import config from "~/rebuild/json/config.json";
import SvgIcon from "@/components/svg-icon";

export default {
  name: "index",
  layout: 'home',
  components: {SvgIcon},
  data (){
    return {
      config
    }
  },
  head () {
    return {
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,主页,home` },
      ],
      title: config.captainTitle + config.SEOTitle
    }
  },
}
</script>

<style lang="scss" scoped>
@import "assets/style/public";

.home-page {
  width: 100%;
  min-height: 100%;
  flex-shrink: 0;
  justify-content: space-around;
  overflow-y: auto;
  > .btns {
    flex-direction: column;
    width: 30%;
    justify-content: center;

    > a {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 0.8rem;
      padding: 1rem 1.5rem;
      margin: 1rem 0;
      text-decoration: none;
      transition: all .15s ease-out;
      box-shadow: 0 0 0.8rem rgba(255, 255, 255, 0.6);
      flex-shrink: 0;

      &:hover {
        background: rgba(0, 0, 0, 0.5);

        > .tip {
          width: 6rem;
          opacity: 1;
        }
      }

      > svg {
        width: 2.4rem;
        height: 2.4rem;
      }

      > .name {
        color: white;
        font-size: 1.2rem;
        text-align: center;
        width: 6rem;
      }

      > .tip {
        width: 0;
        transition: all .15s ease-out;
        opacity: 0;
        font-size: 1.05rem;
        color: white;
        word-break: keep-all;
        white-space: nowrap;
        text-align: center;
      }
    }
  }

  > .info {
    width: 70%;
    justify-content: center;
    flex-direction: column;

    > .head {
      > img {
        width: 4rem;
        height: 4rem;
        border-radius: 0.3rem;
        margin-right: 2rem;
      }

      > span {
        padding: 0.6rem 0 0.6rem 2rem;
        font-size: 1.6rem;
        font-weight: bold;
        border-left: 2px solid white;
        color: white;
      }
    }

    > .body {
      margin-top: 1rem;
      flex-direction: column;
      width: 100%;

      > span {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.6);
        word-break: break-all;
        font-size: 1.1rem;
        white-space: pre-line;
        max-width: 60%;
      }
    }
  }
  @include media{
    flex-direction: column;
    justify-content: flex-start;
    >.btns{
      width: 100%;
      margin: 2rem 0;
      >a{
        >.tip{
          width: 6rem;
          opacity: 1;
        }
      }
    }
    >.info{
      width: 95%;
      margin: 4rem 0 2rem 0;
      >.body{
        >span{
          max-width: calc(100% - 2rem);
          font-size: 1.2rem;
        }
      }
    }
  }
}
</style>
