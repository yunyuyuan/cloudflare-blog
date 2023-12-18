<template>
  <div class="echarts-comment" flex>
    <div v-if="!inited" class="loading" flex>
      <svg-icon name="loading"/>
    </div>
    <div class="echarts"></div>
  </div>
</template>

<script>
import 'zrender/lib/svg/svg';

import echarts from 'echarts/lib/echarts'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/chart/pie'
import {getCommentNum} from "~/utils/github_graphql";
import SvgIcon from "@/components/svg-icon";


export default {
  name: "the-article",
  components: {SvgIcon},
  data (){
    return {
      myChart: null,
      count: [
        {value: 0, name: '正常的'},
        {value: 0, name: '关闭的'}
      ],
      inited: false,

      option: {
        title: {
          left: 'center',
          text: '评论统计'
        },
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            name: '评论统计',
            type: 'pie',
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
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
    const echartsContainer = this.$el.querySelector('div.echarts');
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

    const promises = [];
    let count = 0;
    promises.push(getCommentNum('', 'open').then(res=>{
      if (res[0]){
        this.count.splice(0, 1, {value: res[1].data.data.search.issueCount, name: '正常的'})
      }
    }).finally(()=>{
      count ++;
      if (count === promises.length){
        this.inited = true
      }
    }))
    promises.push(getCommentNum('', 'closed').then(res=>{
      if (res[0]){
        this.count.splice(1, 1, {value: res[1].data.data.search.issueCount, name: '关闭的'})
      }
    }).finally(()=>{
      count ++;
      if (count === promises.length){
        this.option.series[0].data = this.count
        this.myChart.setOption(this.option);
        this.inited = true
      }
    }))
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
.echarts-comment{
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
