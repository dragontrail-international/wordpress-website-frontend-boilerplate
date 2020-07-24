import Vue from 'vue'
import { from } from 'rxjs'
import { delay } from 'rxjs/operators'
import VueApp from './vue-app.vue'
import './index.scss'

console.log('test/index.js')

from([1, 2, 3]).pipe(delay(1000)).subscribe(
  (res) => {
    console.log('interval res', res)
  },
)

new Vue({
  render: h => h(VueApp),
}).$mount('#vueApp')

console.log('test js')
