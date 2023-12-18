<template>
  <div class="card" ref="card">
    <div class="arrow"></div>
    <div v-if="fetching" class="load">
      <svg-icon name="loading"/>
    </div>
    <div v-else class="wrap">
      <div class="info" flex>
        <err-avatar :url="cardInfo.ghUrl" :avatar="cardInfo.avatar"/>
        <div flex>
          <a :href="cardInfo.ghUrl" target="_blank">{{ $props.login }}<span>({{ cardInfo.name||defaultCardInfo.name }})</span></a>
          <span>{{ cardInfo.bio || defaultCardInfo.bio }}</span>
        </div>
      </div>
      <div class="detail" flex>
        <div>
          <svg-icon name="card-website"/>
          <b>{{ $i18n('site') }}</b>
          <span>
            <a :href="href" target="_blank">{{ cardInfo.website }}</a>
          </span>
        </div>
        <div>
          <svg-icon name="card-location"/>
          <b>{{ $i18n('address') }}</b>
          <span>{{ cardInfo.location || defaultCardInfo.location }}</span>
        </div>
        <div>
          <svg-icon name="card-followers"/>
          <b>{{ $i18n('followers') }}</b>
          <span>{{ cardInfo.followers || defaultCardInfo.followers }}</span>
        </div>
        <div>
          <svg-icon name="card-repositories"/>
          <b>{{ $i18n('repos') }}</b>
          <span>{{ cardInfo.repoCount || defaultCardInfo.repoCount }}</span>
        </div>
        <div>
          <svg-icon name="card-disk"/>
          <b>{{ $i18n('reposSize') }}</b>
          <span>{{ cardInfo.repoSize || defaultCardInfo.repoSize }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getUserCard} from "~/utils/github_graphql";
import ErrAvatar from "~/block/comment/errAvatar";
import SvgIcon from "@/components/svg-icon";

export default {
  components: {SvgIcon, ErrAvatar},
  props: ['login'],
  name: "userCard",
  data() {
    return {
      defaultCardInfo: {
        avatar: '/image/error.jpg',
        ghUrl: 'https://github.com/',
        name: 'Unknown',
        bio: '暂无',
        website: 'https://github.com/',
        location: '地球',
        followers: 0,
        repoCount: 0,
        repoSize: '0k',
      },
      cardInfo: {
        avatar: '',
        ghUrl: '',
        name: '',
        bio: '',
        website: '',
        location: '',
        followers: 0,
        repoCount: 0,
        repoSize: '',
      },
      fetching: true
    }
  },
  computed: {
    href() {
      return this.cardInfo.website.match(/^https?:\/\//) ?
          this.cardInfo.website :
          ('http://' + this.cardInfo.website)
    },
    defaultUrl (){
      return (this.defaultCardInfo.website+this.$props.login)
    }
  },
  created() {
    getUserCard(this.$props.login).then(res => {
      this.fetching = false;
      if (res[0] && res[1].status === 200) {
        const data = res[1].data.data.user;
        this.cardInfo.avatar = data.avatarUrl;
        this.cardInfo.ghUrl = data.url||this.defaultUrl;
        this.cardInfo.name = data.name;
        this.cardInfo.bio = data.bio;
        this.cardInfo.website = data.websiteUrl||this.defaultUrl;
        this.cardInfo.location = data.location;
        this.cardInfo.followers = data.followers.totalCount;
        this.cardInfo.repoCount = data.repositories.totalCount;
        const usage = data.repositories.totalDiskUsage;
        this.cardInfo.repoSize = usage > 1024 ? ((usage / 1024).toFixed(1) + 'M') : (usage + 'K');
      } else {
        this.cardInfo = this.defaultCardInfo;
      }
    })
  },
  methods: {
    errAvatar (e){
      e.src = '/image/error.jpg'
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.card {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: .5rem;
  background: white;
  border: 1px solid #cecece;
  box-shadow: 0 0 1rem rgba(0, 0, 0, .4);
  border-radius: .2rem;
  z-index: $z-index-comment-card;
  animation: fade-in .2s ease-out forwards;
  opacity: 0;
  @keyframes fade-in {
    0%{
      opacity: 0;
    }
    100%{
      opacity: 1;
    }
  }
  > .arrow {
    position: absolute;
    top: -.4rem;
    left: .8rem;
    border: inherit;
    box-shadow: inherit;
    background: inherit;
    width: .8rem;
    height: .8rem;
    transform: rotate(45deg);
    z-index: 1;
    &:before{
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: transparent;
    }
  }

  >.load, > .wrap {
    position: relative;
    z-index: 2;
    background: inherit;
  }
  >.load{
    padding: 1rem;
    >svg{
      width: 5rem;
      height: 5rem;
    }
  }

  > .wrap {
    padding: .4rem .8rem;
    overflow-x: auto;
    max-width: 20rem;

    > .info {
      align-items: flex-start;

      ::v-deep >.avatar {
        width: 3rem;
        height: 3rem;
        margin-right: .4rem;
      }

      > div {
        flex-direction: column;

        > a {
          font-size: .85rem;
          color: black;
          word-break: keep-all;
          font-weight: bold;
          text-decoration: none;
          > span {
            margin-left: .4rem;
            color: #505050;
          }
          &:hover, &:hover>span{
            color: #0003ff;
          }
        }

        > span {
          margin-top: .5rem;
          font-size: .85rem;
          color: #4e4e4e;
        }
      }
    }

    > .detail {
      margin-top: .5rem;
      padding-top: .5rem;
      flex-direction: column;
      border-top: 1px solid #c1c1c1;
      width: 100%;

      > div {
        display: flex;
        align-items: center;
        width: 100%;
        margin: .3rem 0;

        > svg {
          width: 1.1rem;
          height: 1.1rem;
          flex-shrink: 0;
        }
        >b{
          margin: 0 .8rem 0 .4rem;
          font-size: .8rem;
          width: 3.2rem;
          text-align: center;
          word-break: keep-all;
        }

        > span {
          font-size: .82rem;
          flex-grow: 1;
          text-align: right;

          > a[href] {
            color: black;
            text-decoration: none;

            &:hover {
              color: #0037ff;
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}
</style>
