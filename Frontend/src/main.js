import Vue from 'vue';
//import Stepper from './Stepper.vue';
import Bar from "@/Bar";
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';

Vue.use(MuseUI);
Vue.config.productionTip = false;

new Vue({
    el: '#app',
    render (h) {
        return h(Bar);
    }
});