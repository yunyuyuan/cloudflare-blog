<template>
  <div class="record">
    <div class="list" flex>
      <NuxtLink class="list-item" v-for="item in record" :data-file="item.file" :key="item.file" :to="'/record/'+item.file">
        <time>{{ item.time | time(true) }}</time>
        <div class="img" flex>
          <loading-img v-for="(i,idx) in item.images.slice(0, 4)" :key="idx" :src="i"/>
        </div>
        <span>{{ item.summary }}</span>
      </NuxtLink>
    </div>
    <NuxtChild/>
  </div>
</template>

<script>
import record from '~/rebuild/json/record.json'
import LoadingImg from "@/components/loading-img";
import SvgIcon from "@/components/svg-icon";
import config from "@/rebuild/json/config.json";

export default {
  name: "index",
  components: {SvgIcon, LoadingImg},
  data() {
    return {
      record,
    }
  },
  head () {
    return {
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,个人记录,records` },
      ],
      title: '记录' + config.SEOTitle
    }
  },
}
</script>

<style lang="scss" scoped>
@import "assets/style/public";

.record{
  width: 90%;
  > .list{
    flex-wrap: wrap;
    width: 100%;
    margin: 1rem 0;
    align-items: flex-start;
    > .list-item{
      padding: 0.6rem 1rem;
      height: 11rem;
      overflow: hidden;
      position: relative;
      transition: height .15s linear;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.6);
      border-radius: 0.2rem;
      background: white;
      cursor: pointer;
      margin: 0 1rem 4rem 1rem;
      text-decoration: none;
      color: black;
      &:hover{
        > time{
          opacity: 1;
        }
      }
      > time{
        opacity: 0;
        background: rgba(0, 0, 0, 0.4);
        padding: 0.3rem 1rem;
        font-size: 0.8rem;
        color: white;
        border-radius: 0.3rem;
        right: 0;
        top: 0;
        position: absolute;
        z-index: 2;
      }
      > .img{
        height: 8rem;
        ::v-deep .loading-img{
          height: 100% !important;
          width: unset !important;
          &:not(:last-of-type){
            border-right: 1px solid white;
          }
          img{
            height: 100%;
            width: unset;
            object-fit: contain;
            background: rgba(255, 255, 255, 0.5);
          }
        }
      }
      > span{
        width: calc(100% - 0.4rem);
        padding: 0 0.4rem;
        background: white;
        height: 2.5rem;
        line-height: 1.2rem;
        font-size: 0.88rem;
        margin-top: 0.5rem;
        @include text-overflow(2)
      }
    }
  }
  @include media{
    max-width: 100%;
    width: 100%;
    >.list{
      justify-content: center;
      >.list-item{
        height: unset;
        width: calc(98% - 2rem);
        &:hover{
          height: unset;
        }
        >.time{
          opacity: 1;
        }
        >.img{
          flex-wrap: wrap;
          height: unset;
          ::v-deep .loading-img{
            height: 100% !important;
            width: calc(50% - 2px) !important;
            &:not(:last-of-type){
              margin-right: 1px;
            }
            img{
              height: 100%;
              width: 100%;
              object-fit: contain;
              background: rgba(255, 255, 255, 0.5);
            }
          }
        }
      }
    }
  }
}
</style>
