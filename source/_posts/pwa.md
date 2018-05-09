---
title: 前端er应该了解的PWA
date: 2018-05-09
---
## 一、传统web 应用  
当前web应用在移动时代并没有达到其在桌面设备上流行的程度，下面有张图来对比与原生应用之间的差别。     
<img src='/img/pwa/1.png'/>   
究其原因，无外乎下面不可避免的几点：
* 移动设备网络限制-不可忽略的加载时间 
* web应用依赖于浏览器作为入口  
* 体验与原生的差距 
<!-- more -->
假如能解决以上的几点，对web app 来说会有多大的提升可以想象。
## 二、PWA是什么  
PWA 全称Progressive Web Apps(渐进式Web应用程序)，旨在使用现有的web技术提供用户更优的使用体验。
基本要求    
 
* 可靠（Reliable）
    即使在不稳定的网络环境下，也能瞬间加载并展现
* 快速响应（Fast）
    快速响应，并且有平滑的动画响应用户的操作
* 粘性(Engaging)
    像设备上的原生应用，具有沉浸式的用户体验，用户可以添加到桌面   
    
PWA 本身强调渐进式，并不要求一次性达到安全、性能和体验上的所有要求，开发者可以通过 PWA Checklist 查看现有的特征。  

除以上的基准要求外，还应该包括以下特性：  

* 渐进式 - 适用于所有浏览器，因为它是以渐进式增强作为宗旨开发的
* 连接无关性 - 能够借助 Service Worker 在离线或者网络较差的情况下正常访问
* 类似应用 - 由于是在 App Shell 模型基础上开发，因为应具有 Native App 的交互和导航，给用户 Native App 的体验
* 持续更新 - 始终是最新的，无版本和更新问题
* 安全 - 通过 HTTPS 协议提供服务，防止窥探和确保内容不被篡改
* 可索引 - 应用清单文件和 Service Worker 可以让搜索引擎索引到，从而将其识别为『应用』
* 粘性 - 通过推送离线通知等，可以让用户回流
* 可安装 - 用户可以添加常用的 webapp 到桌面，免去去应用商店下载的麻烦
* 可链接 - 通过链接即可分享内容，无需下载安装  


看起来有点眼花缭乱，这又是一个新的飞起的轮子吗？这里重申一下,PWA背后不是一种新的技术，而是集合当前多种web技术的一种集合。分别利用各自的功能来完成渐进式的整体需求。下面就沿着前面提出的问题分别了解一下相关技术  

## 三、技术组成  
由以下几种技术构成：  

* App Manifest
* Service Worker
* Notifications API
* Push API  

其中Service Worker是PWA技术的关键，它们可以让app满足上面的三基准。其他技术则是锦上添花，让app更加的强大。 
### 3.1 service worker背景
#### 离线缓存背景  
针对网页的体验，从前到后都做了很多努力，极力去降低响应时间，这里就不表述多样的技术手段。
另一个方向的就是缓存，减少与服务器非必要的交互，不过对于离线的情况下浏览器缓存就无力了，
这样离线缓存的需求就出现了。
#### 离线缓存的历程   
web应用在离线缓存发展的过程中也不是一簇而就的，经历了逐渐完善的过程。  
初期的解决方案是AppCache(原来阿波罗的h5接入过)
 然而，事实证明这是一个失败的尝试，缺陷太多，已经被废弃了。具体可以查看Application Cache is a douchebag
但是方向还是正确的，那就继续孜孜不倦的探索。
#### workers 
持久化先放一边，来谈谈另一个问题
基于浏览器中的 javaScript 单线程的现实逐渐不能满足现代web需求的现状,例如耗时的计算，用户的交互显然会受影响。
为了将这些耗时操作从主线程中解放出来，早期W3C新增了一个Web Worker 的 API，可以脱离主线程单独执行，并且可以与主线程交互。
不过Web Worker是临时性的依赖于创建页面 ，不能满足我们持久化的需求。
冲着这个目标，下面就比较容易解决了，搞个能持久存在的就行了。
在Web Worker的基础上，W3C新增了service worker来满足我们持久化的需求。
其生命周期与页面无关，关联页面未关闭时，它也可以退出，没有关联页面时，它也可以启动
功能  

Service Worker虽然满足了离线缓存来，其功能可不仅仅局限于此。  可以提供  

* 丰富的离线体验，
* 周期的后台同步，
* 消息推送通知，
* 拦截和处理网络请求，
* 管理资源缓存
这些正好也是PWA的目的，所以说Service Worker是PWA的关键技术。 
#### 前提条件
Service Worker 出于安全性和其实现原理，在使用的时候有一定的前提条件。
* 由于 Service Worker 要求 HTTPS 的环境  
    当然一般浏览器允许调试 Service Worker 的时候 host 为 localhost 或者 127.0.0.1 
* Service Worker 的缓存机制是依赖 Cache API (略过)
* 依赖 HTML5 fetch API（略过）
* 依赖 Promise 实现   
由上可知，不是所有的浏览器都支持的，支持情况大概如下：  

 <img src='/img/pwa/2.png'/>
iOS 内的所有的浏览器都基于 safari，所以iOS要在11.3以上
IE是放弃支持了，不过Edge好歹支持了。     
### 3.2 Cache  

Cache是Service Worker衍生出来的API，配合Service Worker实现对资源请求的缓存。
不过cache并不直接缓存字符串，而是直接缓存资源请求（css、js、html等）。  
cache也是key-value形式，一般来说key就是request，value就是response   
 
* caches.open(cacheName) 打开一个cache   
* caches是global对象，返回一个带有cache返回值的Promise
* cache.keys() 遍历cache中所有键，得到value的集合
* cache.match(Request|url) 在cache中匹配传入的request，返回Promise；  
* cache.matchAll只有第一个参数与match不同，需要一个request的数组，当然返回的结果也是response的数组
* cache.add(Request|url) 并不是单纯的add，因为传入的是request或者url，在cache.add内部会自动去调用fetch取回request的请求结果，然后才是把response存入cache；
* cache.addAll类似，通常在sw install的时候用cache.addAll把所有需要缓存的文件都请求一遍
* cache.put(Request, Response) 这个相当于cache.add的第二步，即fetch到response后存入cache
* cache.delete(Request|url) 删除缓存     

 
### 3.3 注册Service Worker         

注册即声明sw文件的位置，显然应该在主js中引入。大概如下：  

```js
//基于promise
function registerServiceWorker(){
    // 注册service worker
    return navigator.serviceWorker.register('./sw1.js').then(registration => {
        console.log('注册成功');
        // 返回
        return registration;
    })
    .catch(err => {
        console.error('注册失败', err);
    });
}
window.onload = function () {
    //是否支持
    if (!('serviceWorker' in navigator)) {
        return;
    }
    registerServiceWorker()
}
```   
### 3.4 生命周期      

Service worker 有一个独立于web 页面的生命周期。
如果在网站上安装 serice worker ，你需要注册，注册后浏览器会在后台安装 service worker。然后进入下面的不同阶段。
激活之后，service worker 将控制所有的页面，纳入它的范围，不过第一次在页面注册 service worker 时不会控制页面，直到它再次加载。
 service worker 生效之后,它会处于下面两种状态之一：  
 
* service worker 终止来节省内存，
* 页面发起网络请求后，它将处理请求获取和消息事件。  


由上图看知，分为这么几个阶段：  
  
* Installing   
           发生在 Service Worker 注册之后，表示开始安装，触发 install 事件回调指定一些静态资源进行离线缓存 
* Installed
           Service Worker 已经完成了安装，并且等待其他的 Service Worker 线程被关闭。
* Activating 
          在这个状态下没有被其他的 Service Worker 控制的客户端，允许当前的 worker 完成安装
* Activated   
          在这个状态会处理 activate 事件回调 (提供了更新缓存策略的机会)。并可以处理功能性的事件 fetch (请求)、sync (后台同步)、push (推送)
* Redundant
         被替换，即被销毁  
         
了解声明周期其实是为了我们在不同时间段去监听事件来完成相应操作。对PWA来说主要两个事件。
 
* install 事件回调：
 
event.waitUntil()：传入一个 Promise 为参数，等到该 Promise 为 resolve 状态为止。
self.skipWaiting()：self 是当前 context 的 global 变量，执行该方法表示强制当前处在 waiting 状态的 Service Worker 进入 activate 状态。
 
* activate 回调：
 
event.waitUntil()：传入一个 Promise 为参数，等到该 Promise 为 resolve 状态为止。
self.clients.claim()：在 activate 事件回调中执行该方法表示取得页面的控制权, 这样之后打开页面都会使用版本更新的缓存。旧的 Service Worker 脚本不再控制着页面，之后会被停止。   

```js 
const CURCACHE = 'CURCACHE_test_1'
const RUNTIME = 'runtime';
const CURCACHE_URLS = [
    './',
    '/asset/sw.jpg',
    'index.js'
]
self.addEventListener('install',e=>{
    e.waitUntil(
      //存储缓存路径对应的资源
        caches.open(CURCACHE).then(cache=>{
            cache.addAll(CURCACHE_URLS)
        }).then(
            self.skipWaiting()
        )
    )
})  
  //代理请求，使用缓存，请求发送之前
  self.addEventListener('fetch', e => {
    e.respondWith(
      //缓存是否匹配 
      caches.match(e.request).then(function(response) {
        if (response != null) {
          //命中缓存返回缓存，结束请求
          return response
        }
        //未命中缓存，正常请求
        return fetch(e.request.url)
      })
    )
  });
```  
#### 更新service worker  

service worker 更新步骤如下：   

* 更新 service worker 的文件   
           网页打开时服务器会进行对比，保持最新  
* 新的 service worker 启动install
* 当前页面生效的依然是老的service worker，新的 service worker 会进入 “waiting” 状态。
* 页面关闭之后，老的 service worker 会被干掉，新的 servicer worker 接管页面
* 新的 service worker 生效后会触发 activate 事件  

```js
const CURCACHE = 'precache_test_1'
//假设上个版本的key为precache_test_2 反正不等于CURCACHE
self.addEventListener('activate', e => {
  e.waitUntil(
      //遍历当前缓存keys
      caches.keys().then(cacheNames=>{
        return Promise.all(
          cacheNames.map(function(cacheName) {
            //是否等于当前key,保留自己
            if (cacheName !== CURCACHE) {
              return caches.delete(cacheName);
            }
          })
    )}).then(() => self.clients.claim())
 )
}) 
```  

这样一个简单的service worker离线缓存完成了。控制台可以看到，来源是service worker  

<img src='/img/pwa/3.png'>
关闭网络之后再次访问，可以同样得到上面的结果，并且sw.js请求未能拿到，但是不影响，旧的文件依然在，这里证明了每次都回去对比sw文件以确保更新
<img src='/img/pwa/4.png'>  
到这里，离线缓存就实现了。   
  
## 四、添加到主屏幕  

允许将站点添加至主屏幕，是 PWA 提供的一项重要功能。这样就不用再依赖于浏览器作为平台，符合移动端的用户习惯。  

### manifest.json  

需要 manifest.json 文件去配置应用的图标、名称等基本信息如下：
 
```js
{
    //被提示安装应用时出现的文本
    "name": "PQJ-PWA",
    //添加至主屏幕后的文本
    "short_name":"PQJ",
    "description": "测试demo",
    //添加之后，启动地址
    "start_url": "/index.html",
    //图标信息
    "icons": {
      "128": "/asset/sw.jpg"
    },
    "developer": {
      "name": "pqj",
      "url": ""
    },
    "display": "standalone",
    "background_color": "#287fc5",
    "theme_color": "#fff",
    "permissions": {
        "desktop-notification": {
          "description": "Needed for creating system notifications."
        }
      }
}  
```  
然后以如下方式在html中引入

```js
<link rel="manifest" href="/mainfest.json" />
```  
这样完成之后，移动端安卓使用chrome(亲测),首次访问时会提示是否允许安装到主屏幕，以应用icon的形式出现。
图片和文字即由配置决定。  
  
### 五、消息通知  
消息通知也是使用service worker的通知功能进行的，允许服务器想用户发生通知，而非用户主动请求才去响应某些行为。   
正常的通知逻辑需要服务器来参与实现，这次展示只实现功能。   
 
* 首先申请通知权限
* 注册service worker 
* 处理逻辑，发送通知  

```js 
function getPermission(){
    return new Promise((resolve, reject) => {
        //权限获取
        const permissionPromise = Notification.requestPermission(result => {
            resolve(result);
        });
    }).then(result => {
            //判断条件
            if (result === 'granted') {
                execute();
            }
            else {
                console.log('no permission');
            }
        });
} 
```  
发送通知  

```js
function execute() {
    // 允许之后执行
    registerServiceWorker().then(registration => {
        // 通知
        registration.showNotification('Hello World!');
    });
}  
```  
### 结束语   
#### 参考文档  
[https://lavas.baidu.com/doc](https://lavas.baidu.com/doc)  
[https://developer.mozilla.org/zh-CN/Apps/Progressive](https://developer.mozilla.org/zh-CN/Apps/Progressive)
至此，本文介绍就结束了，更多请参考[实例](https://github.com/xiaoxiangdaiyu/PWA)虽然PWA目前来看，面对的限制还很多，但是也可以看出web组织在更好的提升web应用方向上做的努力。正如一直提到的那句话，未来可期。
目前国内百度这方面做的比较成熟，新浪微博已经有了pwa 测试版。

  

