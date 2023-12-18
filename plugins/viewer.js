import Vue from 'vue'
import Viewer from 'v-viewer'
Vue.use(Viewer)

Viewer.setDefaults({
  filter(img) {
    return img.hasAttribute('data-viewer')
  }
})
