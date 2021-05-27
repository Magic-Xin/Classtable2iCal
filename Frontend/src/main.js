import Vue from 'vue';
import Stepper from './Stepper.vue';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';

Vue.use(MuseUI);
Vue.config.productionTip = false;

new Vue({
    render: h => h(Stepper)
  }).$mount("#app");