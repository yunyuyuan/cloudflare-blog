<template>
  <div></div>
</template>

<script>
export default {
  name: "index",
  layout: 'backend',
  fetch({redirect, route}) {
    if (route.name === 'backend'){
      redirect('/backend/config')
    }
  },
}
</script>

<style scoped lang="scss">
</style>
