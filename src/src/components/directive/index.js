import Vue from 'vue';
import TransferDom from './transfer-dom';
import others from './others';

Vue.directive('transfer-dom', TransferDom);

Vue.directive('focus', others.focus);
// Vue.directive('blur', others.blur);

// Vue.directive('drag-data', drag.dragData);
// Vue.directive('drop', drag.drag);