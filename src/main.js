import 'babel-polyfill'

import Vue from 'vue'
import App from './App'

import {
  faMicrophone,
  faMicrophoneSlash,
  faPlay,
  faPause
} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faMicrophone, faMicrophoneSlash, faPlay, faPause)

Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
  el: '#app',
  render: h => h(App)
})
