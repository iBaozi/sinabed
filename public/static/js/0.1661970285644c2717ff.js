webpackJsonp([0],{"6Nvg":function(t,r,e){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n,a=e("mvHQ"),s=e.n(a),u=e("woOf"),i=e.n(u),_=e("Xxa5"),o=e.n(_),v=e("exGp"),l=e.n(v),p=e("Zx67"),c=e.n(p),f=e("Zrlr"),d=e.n(f),m=e("wxAW"),h=e.n(m),y=e("zwoO"),w=e.n(y),g=e("Pf15"),k=e.n(g),b=e("7+uW"),x=e("443i"),O=(e("ipus"),e("JaHG")),W=e("wYMm"),j=Object(x.a)()(n=function(t){function r(){var t,e,n,a;d()(this,r);for(var s=arguments.length,u=Array(s),i=0;i<s;i++)u[i]=arguments[i];return e=n=w()(this,(t=r.__proto__||c()(r)).call.apply(t,[this].concat(u))),n.columns=[{title:"参数",width:120},{title:"参数名",width:120},{title:"参数类型",width:96},{title:"是否必传",width:96},{title:"参数说明"}],a=e,w()(n,a)}return k()(r,t),h()(r,[{key:"refresh",value:function(){var t=l()(o.a.mark(function t(){return o.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"mounted",value:function(){this.refresh()}},{key:"list",get:function(){return O.a.apis.map(function(t){t=i()({},t);var r=[];for(var e in t.params){var n=t.params[e];n.key=e,n.rem=n.rem||"",n.opts&&(n.rem+=n.opts.map(function(t,r){return r+":"+t}).join("\n")),r.push(n)}var a=[];for(var u in t.error){var _=t.error[u];a.push({key:u,msg:_})}return t.error=a,t.params=r,t.ret=s()(t.ret,null,2),t.rem=t.rem||"",t.url=W.a.api+"/api/file/"+t.url,t})}}]),r}(b.default))||n,A={render:function(){var t=this,r=t.$createElement,e=t._self._c||r;return e("mu-container",{staticClass:"pages-api"},[e("h1",[t._v("接口说明:")]),t._v(" "),e("pre",[t._v('接口一般返回格式 {"no":响应代码,"msg":错误信息,data:返回数据} 其中响应代码=200时代表请求成功，否则会返回msg\n所有接口支持跨域访问\n\t')]),t._v(" "),t._l(t.list,function(r,n){return e("div",{key:n,staticClass:"api"},[e("h1",[t._v(t._s(r.name)+"接口")]),t._v(" "),e("mu-divider"),t._v(" "),e("h3",[t._v("地址: "),e("a",{attrs:{href:r.url}},[t._v(t._s(r.url))])]),t._v(" "),e("h3",[t._v("方法: "+t._s(r.method))]),t._v(" "),e("h3",[t._v("参数:")]),t._v(" "),r.params&&r.params.length?e("mu-data-table",{attrs:{columns:t.columns,data:r.params},scopedSlots:t._u([{key:"default",fn:function(r){var n=r.row;return[e("td",[t._v(t._s(n.key))]),t._v(" "),e("td",[t._v(t._s(n.lbl))]),t._v(" "),e("td",[t._v(t._s(n.type?n.type:"string"))]),t._v(" "),e("td",[t._v(t._s(n.need?"是":"否"))]),t._v(" "),e("td",[t._v(t._s(n.rem))])]}}])}):t._e(),t._v(" "),r.error&&r.error.length?e("h3",[t._v("错误代码:")]):t._e(),t._v(" "),r.error&&r.error.length?e("mu-data-table",{attrs:{columns:[{title:"代码",width:96},{title:"含意"}],data:r.error},scopedSlots:t._u([{key:"default",fn:function(r){var n=r.row;return[e("td",[t._v(t._s(n.key))]),t._v(" "),e("td",[t._v(t._s(n.msg))])]}}])}):t._e(),t._v(" "),e("h3",[t._v("返回示例:")]),t._v(" "),e("pre",[t._v(t._s(r.ret))])],1)})],2)},staticRenderFns:[]};var B=e("VU/8")(j,A,!1,function(t){e("WBpb")},null,null);r.default=B.exports},WBpb:function(t,r){}});