webpackJsonp([1],{HXef:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a,n,i,o,s,u,c,l=r("C4MV"),f=r.n(l),p=r("Xxa5"),v=r.n(p),d=r("exGp"),h=r.n(d),b=r("Zx67"),k=r.n(b),y=r("Zrlr"),g=r.n(y),m=r("wxAW"),_=r.n(m),x=r("zwoO"),w=r.n(x),P=r("Pf15"),q=r.n(P),z=r("7+uW"),O=r("443i"),C=r("ipus"),D=r("JaHG");function j(e,t,r,a){r&&f()(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(a):void 0})}function U(e,t,r,a,n){var i={};return Object.keys(a).forEach(function(e){i[e]=a[e]}),i.enumerable=!!i.enumerable,i.configurable=!!i.configurable,("value"in i||i.initializer)&&(i.writable=!0),i=r.slice().reverse().reduce(function(r,a){return a(e,t,r)||r},i),n&&void 0!==i.initializer&&(i.value=i.initializer?i.initializer.call(n):void 0,i.initializer=void 0),void 0===i.initializer&&(Object.defineProperty(e,t,i),i=null),i}var $=(a=Object(O.a)({components:{}}),n=Object(C.b)(function(e){return e.user.user}),i=Object(C.a)("addPhoto"),a((s=function(e){function t(){var e,r,a,n;g()(this,t);for(var i=arguments.length,o=Array(i),s=0;s<i;s++)o[s]=arguments[s];return r=a=w()(this,(e=t.__proto__||k()(t)).call.apply(e,[this].concat(o))),j(a,"user",u,a),a.query=D.a.query({qr:null},!0),a.focus=0,a.dragover=0,a.list=[],a.visibility=!1,j(a,"addPhoto",c,a),n=r,w()(a,n)}return q()(t,e),_()(t,[{key:"onDragOver",value:function(e,t){this.dragover=t,e.preventDefault()}},{key:"onPick",value:function(){var e=this;return D.a.pick("image/*").then(function(t){return e.upload(t)})}},{key:"paste",value:function(){var e=h()(v.a.mark(function e(t){var r,a,n;return v.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:r=t.clipboardData.files,a=0;case 2:if(!(a<r.length)){e.next=9;break}return n=r[a],e.next=6,this.upload(n);case 6:a++,e.next=2;break;case 9:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()},{key:"drop",value:function(){var e=h()(v.a.mark(function e(t){var r,a,n;return v.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:this.dragover=0,t.preventDefault(),r=t.dataTransfer.files,a=0;case 4:if(!(a<r.length)){e.next=11;break}return n=r[a],e.next=8,this.upload(n);case 8:a++,e.next=4;break;case 11:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()},{key:"upload",value:function(){var e=h()(v.a.mark(function e(t){var r,a,n,i,o,s,u;return v.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!(t instanceof File)){e.next=7;break}return t={name:(r=t).name,url:window.URL.createObjectURL(r),create_at:+new Date,percent:0,data:"",file:r,err:0},this.list.push(t),e.next=6,this.upload(t);case 6:return e.abrupt("return",e.sent);case 7:for(n in(a=new FormData).append("f",t.file),this.query.qr&&a.append("qr",1),this.user)i=this.user[n],a.append(n,i);return e.prev=11,e.next=14,this.$post("file/image",a,{onUploadProgress:function(e){t.percent=e.loaded/e.total*100|0}});case 14:o=e.sent,s=o.data,u=o.url,t.url=u,t.data=s,t.err=0,this.addPhoto(t),e.next=26;break;case 23:e.prev=23,e.t0=e.catch(11),t.err=e.t0;case 26:case"end":return e.stop()}},e,this,[[11,23]])}));return function(t){return e.apply(this,arguments)}}()},{key:"copy",value:function(e){D.a.copy(e)?this.$toast.success("复制成功"):this.$toast.error("复制失败")}}]),t}(z.default),u=U(s.prototype,"user",[n],{enumerable:!0,initializer:null}),c=U(s.prototype,"addPhoto",[i],{enumerable:!0,initializer:null}),o=s))||o),F={render:function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("mu-container",{staticClass:"pages-home"},[r("h1",[e._v("上传图片")]),e._v(" "),r("mu-checkbox",{attrs:{label:"识别图中二维码"},model:{value:e.query.qr,callback:function(t){e.$set(e.query,"qr",t)},expression:"query.qr"}}),e._v(" "),r("div",{staticClass:"dropbox"},[r("div",{staticClass:"drop tac",class:{dragover:e.dragover,focus:e.focus},attrs:{tabindex:"0"},on:{focus:function(t){e.focus=1},blur:function(t){e.focus=0},paste:e.paste,dragover:function(t){e.onDragOver(t,1)},dragleave:function(t){e.onDragOver(t,0)},drop:e.drop}},[e.list.length?e._e():r("div",{staticClass:"tip"},[e._v("Paste or Drag & drop files here …")]),e._v(" "),e._l(e.list,function(t,a){return r("div",{key:a,staticClass:"wrapper"},[r("img",{attrs:{src:t.url,alt:t.name}}),e._v(" "),t.percent<100?r("div",{staticClass:"progress",style:{backgroundSize:"100%"+(100-t.percent)+"%"}},[e._v(e._s(t.percent)+"%")]):t.err?r("div",{staticClass:"mask tar"},[r("mu-button",{attrs:{flat:"",color:"error"},on:{click:function(r){e.upload(t)}}},[e._v("重传")])],1):r("div",{staticClass:"mask tar"},[t.data?r("mu-button",{attrs:{flat:"",color:"warning"},on:{click:function(r){e.copy(t.data)}}},[e._v("复制二维码")]):e._e(),e._v(" "),r("mu-button",{attrs:{flat:"",color:"warning"},on:{click:function(r){e.copy(t.url)}}},[e._v("复制链接")])],1)])})],2)]),e._v(" "),r("div",{staticClass:"tar"},[r("mu-button",{attrs:{color:"grey900"},on:{click:e.onPick}},[e._v("选择图片")])],1)],1)},staticRenderFns:[]};var R=r("VU/8")($,F,!1,function(e){r("PUt5")},null,null);t.default=R.exports},PUt5:function(e,t){}});