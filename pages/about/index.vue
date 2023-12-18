<template>
  <div class="about" flex>
    <p>Hello there,Geeker.</p>
    <span>Maybe you want to check <a :href="config.aboutUrl">this</a>.</span>
  </div>
</template>

<script>
import config from '~/rebuild/json/config.json'

export default {
  name: "realAbout",
  data() {
    return{
      config
    }
  },
  head () {
    return {
      meta: [
        { hid: 'keywords', name: 'keywords', content: `${config.name}的博客,${config.name}'s blog,博客,关于,about` }
      ],
      title: config.corner + config.SEOTitle,
    }
  },
  mounted() {
  }
}
</script>

<style scoped lang="scss">
.about{
  flex-direction: column;
  font-size: 1rem;
  width: 99%;
  height: 99%;
  justify-content: center;
  background: linear-gradient(45deg, #ffcfda, #71e5ffb5);
  p{

  }
  span{

  }
  a{

  }
}
</style>
