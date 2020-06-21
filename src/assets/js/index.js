
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';


import Vue from 'vue'

import AppVue from './index/app-vue.vue'

new Vue({
  render: h => h(AppVue),
}).$mount('#vueApp')

console.log('index js')
