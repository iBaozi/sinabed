const Home = function() { return import('../pages/Home'); };
const Setting = function() { return import('../pages/Setting'); };
const History = function() { return import('../pages/History'); };
const Api = function() { return import('../pages/Api'); };
let routes = [];

routes.push({
    path: '/',
    name: '主页',
    icon: "home",
    component: Home
}, {
    path: '/setting',
    name: '设置',
    icon: "setting",
    component: Setting
}, {
    path: '/history',
    name: '历史',
    icon: "history",
    component: History
}, {
    path: '/api',
    name: '接口',
    icon: "api",
    component: Api
}, );

export default routes;