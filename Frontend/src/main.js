import Vue from 'vue';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';

Vue.use(MuseUI);

new Vue({
    el: '#app',
    render (h) {
        return h('mu-button', {}, 'Hello World');
    }
});