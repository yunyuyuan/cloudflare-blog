<template>
  <div class="config" flex>
    <div class="head" flex>
      <svg-icon name="config"/>
      <b>{{$i18n('changeConfig')}}</b>
    </div>
    <div class="list" flex>
      <the-fragment v-for="item in keys" :key="item.name" :name="item.name" :icon="item.icon">
        <template v-for="k in item.data">
          <float-input v-if="typeof k === typeof ''" :key="k"
                       :name="$i18n(k)"
                       :value="item.sub?config[item.sub][k]:config[k]"
                       :id="k"
                       :size="0.85"
                       @input="input($event, item.sub)"
          />
          <label v-else-if="typeof k === typeof []" :key="k[0]" flex>
            <b>{{ $i18n(k[0]) }}:</b>
            <span v-for="key in k[1]"
                  :class="{active: (item.sub?config[item.sub][k[0]]:config[k[0]])===key}"
                  @click="input([k[0], key], item.sub)">{{ $i18n(key) }}</span>
          </label>
        </template>
      </the-fragment>
      <the-fragment :name="$i18n('friends')" icon="friends" class="friends">
        <div v-for="item in config.friends" :key="item.id" class="list-item" flex>
          <float-input :name="$i18n('describe')" :value="item.summary" :id="item.id" :size="0.85" @input="friendsSummary"/>
          <float-input :name="'github'" :value="item.github" :id="item.id" :size="0.85" @input="friendsGithub"/>
          <float-input :name="$i18n('site')" :value="item.site" :id="item.id" :size="0.85" @input="friendsSite"/>
          <single-button class="del-btn" @click.native="friendsDel(item)">{{ $i18n('del') }}</single-button>
        </div>
        <loading-button :loading="false" icon="add" :size="0.9" @click.native="friendsNew">{{ $i18n('add') }}</loading-button>
      </the-fragment>
    </div>
    <loading-button :loading="updating" icon="save" @click.native="commitConfig">{{ $i18n('upload') }}</loading-button>
  </div>
</template>

<script>
import {parseAjaxError} from "@/utils/utils";
import config from '~/rebuild/json/config.json';
import {mapState} from "vuex";
import SvgIcon from "@/components/svg-icon";
import FloatInput from "@/components/float-input";
import SingleButton from "@/components/single-button";
import LoadingButton from "@/components/loading-button";
import Fragment from "@/pages/backend/config/ui/fragment";

config.friends.forEach((v, idx) => {
  v.id = idx
})

export default {
  name: "Config",
  components: {TheFragment: Fragment, LoadingButton, SingleButton, FloatInput, SvgIcon},
  layout: 'backend',
  data() {
    return {
      config,
      updating: false,
      keys: [
        {
          name: 'appearance',
          icon: 'brash',
          data: ['name', 'describe', 'headDescribe', 'SEOTitle', 'aboutme', 'captainTitle', 'tip',
            ['backgroundImg', ['random', 'img', 'comet']]
          ]
        },
        {
          name: 'buildConfig',
          icon: 'config',
          data: ['githubName', 'githubEmail', 'repo', 'domain', 'corsServer',
          ]
        },
        {
          name: 'rss',
          icon: 'rss',
          sub: 'rss',
          data: ['title', 'description', 'categories', 'ttl', 'count', ['timeBy', ['create', 'update']]]
        },
        {
          name: 'oauth',
          icon: 'oauth',
          sub: 'oauth',
          data: ['client_id', 'client_secret', 'redirect_uri',]
        },
        {
          name: 'another',
          icon: 'more',
          data: ['aboutthis', 'copyright', 'github', 'email', 'corner', 'aboutUrl',
          ]
        },
      ]
    }
  },
  head() {
    return {
      title: '网站配置'+config.SEOTitle,
      meta: [
        {hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,后台管理`},
      ],
    }
  },
  computed: {
    ...mapState('backend', ['gitUtil'])
  },
  methods: {
    input(payload, sub) {
      if (sub) {
        return this.config[sub][payload[0]] = payload[1];
      }
      this.config[payload[0]] = payload[1];
    },
    friendsSummary([id, text]) {
      this.config.friends.find(v => v.id === id).summary = text;
    },
    friendsGithub([id, text]) {
      this.config.friends.find(v => v.id === id).github = text;
    },
    friendsSite([id, text]) {
      this.config.friends.find(v => v.id === id).site = text;
    },
    friendsDel(item) {
      this.config.friends.splice(this.config.friends.indexOf(item), 1)
    },
    friendsNew() {
      this.config.friends.push({
        summary: '',
        github: '',
        site: '',
        id: Math.max(...this.config.friends.map(v => v.id)) + 1
      })
    },
    async commitConfig() {
      if (this.updating) return;
      if (this.gitUtil) {
        this.updating = true;
        // 更新config.json
        this.config.friends = this.config.friends.map(v => {
          const item = {};
          for (const k in v) {
            if (k !== 'id') {
              item[k] = v[k]
            }
          }
          return item
        });
        const res = await this.gitUtil.updateJsonFile('config.json', this.config);
        this.updating = false;
        if (res[0]) {
          this.$message.success(this.$i18n('updateOk'))
        } else {
          this.$message.error(parseAjaxError(res[1]))
        }
      } else {
        this.$message.warning(this.$i18n('needLogin'));
        this.$emit('login')
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.config {
  flex-direction: column;
  margin: 2rem auto 1rem auto !important;
  width: 40rem !important;

  > .head {
    padding: 0.6rem 0;
    width: 100%;
    border-radius: 0.6rem 0.6rem 0 0;
    background: linear-gradient(to bottom, #686868, #3b3b3b);
    border-bottom: 1px solid #cecece;
    justify-content: center;

    > svg {
      width: 2.2rem;
      height: 2.2rem;
    }

    > b {
      margin-left: 1rem;
      font-size: 1.1rem;
      color: white;
    }
  }

  > .list {
    width: 100%;
    flex-direction: column;
    margin-top: 1rem;

    .float-input {
      width: 80%;
      margin: 1rem 0;
    }

    label {
      margin: 0.5rem 0;
      width: 80%;

      > b {
        font-size: .9rem;
        margin-right: 1rem;
      }

      > span {
        cursor: pointer;
        font-size: 0.85rem;
        background: #87f3ff;
        border-radius: 0.2rem;
        padding: 0.3rem 0.8rem;
        margin: 0 0.5rem;
        color: black;
        transition: all .15s linear;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.3);

        &:hover {
          border-color: rgba(0, 0, 0, 0.4);
        }

        &.active {
          background: #1b00ff;
          color: white;
        }
      }
    }

    > .friends {
      .list-item {
        margin: 0.8rem 0;

        ::v-deep .float-input {
          margin: 0 0.5rem;
          flex-shrink: 1;

          &:nth-child(1) {
            width: 35%;
          }

          &:nth-child(2) {
            width: 20%;
          }

          &:nth-child(3) {
            width: 30%;
          }
        }
      }

      ::v-deep .loading-button {
        background: #ff8100;

        svg {
          fill: white;
        }
      }
    }
  }

  ::v-deep > .loading-button {
    margin: 1rem 0;
    padding: 0.3rem 0.8rem;
    background: #54b361;
    box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);

    &.loading {
      background: gray;
      color: white;
    }
  }

  @include media {
    > .list {
      .float-input {
        width: 95% !important;
      }

      > label {
        width: 90%;
      }
    }
  }
}
</style>
