<template>
  <div class="float-input">
    <component spellcheck="false" :is="isArea?'textarea':'input'" :style="{height: `${(isArea?5:2)*size}rem`, fontSize: `${0.95*size}rem`}" :value="value" :class="{inputed: text!==''}"
               :id="`float-input-${_uid}`" @keydown.enter="$emit('submit')" @input="input">{{value}}</component>
    <label :style="{lineHeight: `${2*size}rem`, fontSize: `${1.4*size}rem`}" :for="`login-${_uid}`">{{ name }}</label>
    <div class="bar"></div>
  </div>
</template>

<script>
export default {
  name: "FloatInput",
  props: {
    name: {
      type: String,
      default: ''
    },
    id: {
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 1
    },
    isArea: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      text: this.$props.value,
      inputed: false
    }
  },
  watch: {
    '$props.value'() {
      this.text = this.$props.value
    }
  },
  methods: {
    input(e) {
      this.text = e.target.value
      this.$emit('input', [this.$props.id, this.text])
    }
  }
}
</script>

<style scoped lang="scss">
.float-input {
  position: relative;

  input, textarea{
    width: 100%;
    border: 0;
    color: #212121;
    font-weight: 400;
    outline: none;
    z-index: 1;
    position: relative;
    background: transparent !important;
    &:focus, &.inputed {
      ~ label {
        color: #333;
        background: #ffdcb1;
        padding: 0 .6rem;
        transform: translate(-12%, -70%) scale(0.75);
      }
    }
    &:focus {
      ~ .bar {
        &:before,
        &:after {
          width: 50%;
        }
      }
    }
  }

  input {
    height: 2rem;
  }

  textarea{
    height: 10rem;
    padding-top: 0.2rem;
    margin-top: 0.4rem;
    border-top: 1px dashed #b6b6b6;
  }

  label {
    position: absolute;
    top: 0;
    left: 0;
    color: #9e9e9e;
    font-size: 1.4rem;
    line-height: 2rem;
    transition: all .2s ease;
    word-break: keep-all;
    border-radius: .3rem;
  }

  .bar {
    position: absolute;
    left: 0;
    bottom: 0;
    background: #757575;
    width: 100%;
    height: 1px;

    &:before,
    &:after {
      content: '';
      position: absolute;
      background: #007aff;
      width: 0;
      height: 2px;
      transition: .2s ease;
    }

    &:before {
      left: 50%;
    }

    &:after {
      right: 50%;
    }
  }
}
</style>