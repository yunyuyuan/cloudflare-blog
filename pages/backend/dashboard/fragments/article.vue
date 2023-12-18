<template>
  <div class="echarts-article" flex>
    <template v-if="!inited">
      <div class="loading" flex>
        <svg-icon name="loading"/>
      </div>
    </template>
    <template v-else>
      <label class="select" flex>
        <select v-model="xBy" @change="selectX">
          <option selected value="create">{{ $i18n('create') }}</option>
          <option value="modify">{{ $i18n('update') }}</option>
        </select>
        <select v-model="yBy" @change="selectY">
          <option selected value="comment">评论数</option>
          <option value="view">浏览数</option>
        </select>
      </label>
    </template>
    <div class="echarts"></div>
  </div>
</template>

<script>
import 'zrender/lib/svg/svg';

import echarts from 'echarts/lib/echarts'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/dataZoomInside'
import 'echarts/lib/chart/line'

import {getCommentNum} from "~/utils/github_graphql";

const isPhone = process.server?false:(window.innerWidth < 768);
import md from '~/rebuild/json/md.json'
import SvgIcon from "@/components/svg-icon";

export default {
  name: "the-article",
  components: {SvgIcon},
  data (){
    return {
      myChart: null,
      md,
      inited: false,
      xBy: 'create',
      yBy: 'comment',

      option: {
        title: {
          left: isPhone?'10%':'center',
          text: '博文统计'
        },
        dataZoom: [{
          type: 'inside'
        }, {
          show: true,
          bottom: '0'
        }],
        xAxis: [{
          name: '创建时间',
          nameLocation: 'center',
          data: []
        }],
        yAxis: [{
          name: '评论数',
          minInterval: 1
        }],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            axis: 'x',
            label: {
              formatter ({value}){
                return `日期:${value}`
              }
            }
          },
        },
        series: [
          {
            name: '时间线',
            type: 'line',
            data: [],
            tooltip: {},
            lineStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgb(255,41,34)'
                }, {
                  offset: 1,
                  color: 'rgb(255,186,97)'
                }])
              }
            },
            animationDelay (idx){
              return idx*100
            }
          }
        ]
      }
    }
  },
  mounted() {
    // 评论
    const promises = [];
    const echartsContainer = this.$el.querySelector('div.echarts');
    let count = 0;
    this.md.forEach(e => {
      e.commentNum = 0;
      promises.push(getCommentNum(e.file).then(res => {
        e.commentNum = res[0] ? res[1].data.data.search.issueCount : 0;
        this.changeXBy()
        this.changeYBy()
        this.doUpdate()
      }).finally(()=>{
        count ++;
        if (count === promises.length){
          this.inited = true
        }
      }))
    })
    this.myChart = echarts.init(echartsContainer, null, {
      renderer: 'svg',
      width: 'auto',
      height: 'auto'
    });
    const resize = () => {
      this.myChart.resize({
        width: echartsContainer.clientWidth,
        height: echartsContainer.clientHeight
      })
    }
    resize()
    window.addEventListener('resize', resize);
    this.myChart.setOption(this.option);
  },
  methods: {
    doUpdate (){
      this.myChart.setOption(this.option)
    },
    selectX (){
      this.changeXBy()
      this.doUpdate()
    },
    selectY (){
      this.changeYBy()
      this.doUpdate()
    },
    changeXBy (){
      const isModify = this.xBy === 'modify';
      this.option.xAxis[0].data = this.md.map(v=>{
        return this.$options.filters.time(isModify?v.modifyTime:v.time, true)
      });
      this.option.xAxis[0].name = (isModify?'修改':'创建')+'时间';
    },
    changeYBy (){
      const isComment = this.yBy === 'comment'
      if (isComment){
        this.option.series[0].data = this.md.map(v=>{
          return v.commentNum||0
        });
        this.option.tooltip.formatter = ([{dataIndex, value}])=>{
          return `<span>
                    ${this.md[dataIndex].name}<br/>
                    评论数:
                    <b style="font-size: 1.2em">${value}</b>
                </span>`
        }
      }else{
        this.option.series[0].data = this.md.map(v=>{
          return v.viewNum||0
        });
        this.option.tooltip.formatter = ([{dataIndex, value}])=>{
          return `<span>
                    ${this.md[dataIndex].name}<br/>
                    浏览数:
                    <b style="font-size: 1.2em">${value}</b>
                </span>`
        }
        this.option.yAxis[0].name = (isComment?'评论':'浏览')+'数';
      }
    }
  }
}
</script>

<style scoped lang="scss">
.echarts-article{
  width: 100%;
  height: 20rem;
  position: relative;
  box-shadow: 0 0 0.6rem rgba(0, 0, 0, 0.4);
  border-radius: 0.2rem;
  border: 1px solid #a5a5a5;
  >div.loading{
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    background: rgba(255, 255, 255, 0.9);
    justify-content: center;
    >svg{
      width: 4rem;
      height: 4rem;
    }
  }
  >label.select{
    position: absolute;
    top: 0.5rem;
    right: 1rem;
    z-index: 1;
    >select{
      &:not(:last-of-type){
        margin-right: 0.5rem;
      }
    }
  }
  >.echarts{
    height: calc(100% - 1rem);
    margin: 0.3rem 0 0.7rem 0;
    width: 100%;
  }
}
</style>
