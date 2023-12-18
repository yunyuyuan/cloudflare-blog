<template>
  <div v-show="!finished" id="loading" :class="[theme, {hide: hide}]" flex>
    <div :class="`loader-${theme}`" v-if="theme==='light'">
      <div class="css-square square1"></div>
      <div class="css-square square2"></div>
      <div class="css-square square3"></div>
      <div class="css-square square4"></div>
      <div class="css-square square5"></div>
      <div class="css-square square6"></div>
      <div class="css-square square7"></div>
      <div class="css-square square8"></div>
    </div>
    <div :class="`loader-${theme}`" v-else>
      <div class="css-star star1"></div>
      <div class="css-star star2"></div>
      <div class="css-star star3"></div>
      <div class="css-star star4"></div>
      <div class="css-star star5"></div>
      <div class="css-star star6"></div>
      <div class="css-star star7"></div>
      <div class="css-star star8"></div>
    </div>
  </div>
</template>

<script>

export default {
  name: "Loading",
  data (){
    return {
      finished: true,
      hide: false,
      theme: Math.random()>0.5?'light':'dark'
    }
  },
  mounted() {
  },
  methods: {
    start (){
      try {
        // 不loading的页面
        if (!(['/record', '/backend'].some(r => location.pathname.startsWith(r)))) {
          this.theme = Math.random() > 0.5 ? 'light' : 'dark'
          this.finished = false;
        }
      }catch {}
    },
    finish (){
      this.$el.addEventListener('animationend', ()=>{
        this.finished = true
      })
      this.hide = true;
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/public";

#loading{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: $z-index-loading;
  background: rgba(255, 255, 255, 0.9);
  justify-content: center;
  overflow: hidden;
  @keyframes hide-loading{
    0%{
      opacity: 1;
    }
    99%{
      opacity: 0;
      height: 100%;
    }
    100%{
      opacity: 0;
      height: 0;
    }
  }
  &.hide{
    animation: hide-loading .6s ease-out forwards;
  }
  &.dark{
    background: rgba(0, 0, 0, 0.9);
  }
  > .loader-light{
    position: relative;
    > .css-square{
      position: absolute;
      top: 50%;
      width: .88rem;
      height: 2.6rem;
      border-radius: .2rem;
      -webkit-box-shadow: 2px 2px 3px 0 black;
      box-shadow: 2px 2px 3px 0 black;
    }

    @for $i from 1 through 8{
      > .square#{$i}{
        left: -8rem + $i*1.5rem;
        animation: dominos 1s 0.125s+$i*0.125 ease infinite;
      }
    }

    > .square1{
      background: #ff0000;
    }

    > .square2{
      background: #ff8800;
    }

    > .square3{
      background: #fff200;
    }

    > .square4{
      background: #00ff37;
    }

    > .square5{
      background: #00fbff;
    }

    > .square6{
      background: #2a00ff;
    }

    > .square7{
      background: #7b00ff;
    }

    > .square8{
      background: #ff007b;
    }
    @keyframes dominos{
      25%{
        transform: rotate(-90deg);
      }
      50%{
        opacity: 0.8;
      }
      75%{
      }
      80%{
        opacity: 1;
      }
    }
  }
  > .loader-dark{
    position: relative;
    > .css-star{
      position: absolute;
      -webkit-transform: rotate(180deg) scale(0.5);
      -ms-transform: rotate(180deg) scale(0.5);
      transform: rotate(180deg) scale(0.5);
      opacity: 0.4;
      margin: 10px 0;
      display: block;
      width: 0;
      height: 0;
      border-right: 26px solid transparent;
      border-bottom: 23px solid;
      border-left: 23px solid transparent;
      &:before, &:after{
        height: 0;
        width: 0;
        display: block;
        position: absolute;
        content: '';

      }
      &:before{
        border-bottom: 18px solid;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        top: -9px;
        left: -16px;
        -webkit-transform: rotate(-35deg);
        -moz-transform: rotate(-35deg);
        -ms-transform: rotate(-35deg);
        -o-transform: rotate(-35deg);
      }

      &:after{
        top: 2px;
        left: -26px;
        border-right: 25px solid transparent;
        border-bottom: 22px solid;
        border-left: 27px solid transparent;
        -webkit-transform: rotate(-70deg);
        -moz-transform: rotate(-70deg);
        -ms-transform: rotate(-70deg);
        -o-transform: rotate(-70deg);
      }
    }

    > .css-star,
    > .css-star:before,
    > .css-star:after{
      border-bottom-color: #00ffa5;
    }

    > .star1{
      top: -50px;
      left: -25px;
      -webkit-animation: star-crazyness 1s 0.125s ease infinite;
      animation: star-crazyness 1s 0.125s ease infinite;
    }

    > .star2{
      left: -5px;
      top: -40px;
      -webkit-animation: star-crazyness 1s 0.3s ease infinite;
      animation: star-crazyness 1s 0.3s ease infinite;
    }

    > .star3{
      left: 5px;
      top: -20px;
      -webkit-animation: star-crazyness 1s 0.425s ease infinite;
      animation: star-crazyness 1s 0.425s ease infinite;
    }

    > .star4{
      top: 0;
      left: -3px;
      -webkit-animation: star-crazyness 1s 0.540s ease infinite;
      animation: star-crazyness 1s 0.540s ease infinite;
    }

    > .star5{
      top: 10px;
      left: -25px;
      -webkit-animation: star-crazyness 1s 0.665s ease infinite;
      animation: star-crazyness 1s 0.665s ease infinite;
    }

    > .star6{
      top: 0;
      left: -45px;
      -webkit-animation: star-crazyness 1s 0.79s ease infinite;
      animation: star-crazyness 1s 0.79s ease infinite;
    }

    > .star7{
      top: -20px;
      left: -55px;
      -webkit-animation: star-crazyness 1s 0.9s ease infinite;
      animation: star-crazyness 1s 0.9s ease infinite;
    }

    > .star8{
      top: -40px;
      left: -45px;
      -webkit-animation: star-crazyness 1s 1s ease infinite;
      animation: star-crazyness 1s 1s ease infinite;
    }
    @keyframes star-crazyness{
      0%{
        opacity: 0.4;
        -webkit-transform: rotate(180deg) translate(0px, 0) scale(0.6);
        transform: rotate(180deg) translate(0px, 0) scale(0.6);
      }
      25%{
        opacity: 0.4;
        -webkit-transform: rotate(180deg) translate(0, 0) scale(0.2);
        transform: rotate(180deg) translate(0, 0) scale(0.2);
      }
      50%{
        opacity: 0.7;
        -webkit-transform: rotate(180deg) translate(5px, 5px) scale(0.4);
        transform: rotate(180deg) translate(5px, 5px) scale(0.4);
      }
      75%{
        opacity: 0.4;
        -webkit-transform: rotate(180deg) translate(0, 0) scale(0.6);
        transform: rotate(180deg) translate(0, 0) scale(0.6);
      }
      80%{
        opacity: 1;
        -webkit-transform: rotate(180deg) translate(5px, 0) scale(0.1);
        transform: rotate(180deg) translate(5px, 0) scale(0.1);
      }
      100%{
        opacity: 0.4;
        -webkit-transform: rotate(180deg) translate(0, 0) scale(0.6);
        transform: rotate(180deg) translate(0, 0) scale(0.6);
      }
    }
  }
}
</style>
