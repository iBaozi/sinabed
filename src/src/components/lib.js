import Vue from 'vue';
import filter from './filter';

import './directive';
import IListItem from './IListItem';
Vue.component('IListItem', IListItem);
import ITree from './ITree';
Vue.component('ITree', ITree);
import IIcon from './IIcon';
Vue.component('IIcon', IIcon);
import IDate from './IDate';
Vue.component('IDate', IDate);
// import IEditor from './IEditor/Demo';
// Vue.component('IEditor', IEditor);
import IDateRange from './IDateRange';
Vue.component("IDateRange", IDateRange);
import IHeader from './IHeader';
Vue.component("IHeader", IHeader);
import IForm from './IForm';
Vue.component("IForm", IForm);
for (let k in filter) {
    Vue.filter(k, filter[k]);
}