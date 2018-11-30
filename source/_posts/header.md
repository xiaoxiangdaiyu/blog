---
title: provisional headers are shown  知多少
date: 2018-11-30 08:00:29
tags:
---

## 前言 
请求里面provisional headers are shown(显示临时报头) 出现的情况很多，但原因是多样的。  
如果你去直接匹配关键字搜索，得到的结果可能与你自己的情况大相径庭。  
网上大部分都是在跨域时出现，或者是请求被插件拦截，但关于缓存时的请求很少。  
我在[上文查看缓存的时候发现了这个问题](https://juejin.im/post/5bfcd79e6fb9a04a08215cf3),当时查找资料都是聚焦于请求被拦截，  
所以本文就简单整理一下相关情况。
<!-- more -->
## 问题描述

当刷新页面时，想要查看http请求header中相关信息时，  
发现使用缓存的请求（from disk cache或者from memory cache）header相关信息不能查看

<img src='https://user-gold-cdn.xitu.io/2018/11/30/1676251cabb19a3f?w=2826&h=1670&f=jpeg&s=411272'/>

第一次看到确实有点疑惑，那么就去搜索了下。  
碰到这个提示的情况挺多，但细看下与我们的场景不太符合。
<img src='https://user-gold-cdn.xitu.io/2018/11/30/1676251ca86991f9?w=1910&h=1374&f=jpeg&s=410863'/>
基本上遇到的都是provisional headers are shown，阻止了请求的正常加载。  
而我们只是在使用缓存的时候遇到，而看起来请求没有被block掉。好像不太符合。  
  
## 问题定位

虽然没有看到匹配度十分相关的信息，但看到了[有启发的一篇文章(详情点击)](https://stackoverflow.com/questions/21177387/caution-provisional-headers-are-shown-in-chrome-debugger)。  

摘抄部分如下：  

*The resource could be being blocked by an extension (AdBlock in my case).
The message is there because the request to retrieve that resource was never made, so the headers being shown are not the real thing. As explained in the issue you referenced, the real headers are updated when the server responds, but there is no response if the request was blocked.*
 
资源可能被一些扩展程序拦截 。  

另外还有一句：  
  
*I believe it happens when the actual request is not sent. Usually happens when you are loading a cached resource.*

真正请求并未被发送，当使用缓存时经常发生。

之所以会出现这个信息是因为获取相关资源的请求并没有发出，  
所以headers被展示并不是真正的信息。  
就像提到的那样，真正的header只有在服务端返回的时候会更新。  
当请求被拦截后，并没有返回。   
基于这个情况开始猜测原因所在：

### 猜测一、请求跨域被拦截  

虽然现在网站的静态资源都会存在专门的静态域名下面，和html域名可能不一致。  
但是基本都是基于CORS来解决这个问题，所以不存在这个问题。   
再有就是，我们这种情况首次请求的时候不会发生，如果有跨域，应该都被block。  
另外如果是被拦截，那么请求应该不会被响应的，我们这里显然得到了正确的响应。
这种被排除。

### 猜测二、服务器未及时响应   

这种猜测和一差不多，特定情况下才会出现，跟服务器关联不大。 
 
### 猜测三、被扩展程序拦截  

作为一个开发人员，大家的chrome上肯定装了不少的插件。这种原因还是有可能的。  
我们可以通过 chrome://net-internals 来根据关键字查找相关请求，
然后具体去看相关状态。  
例如我们http://xxdy.tech/css/main.css?v=5.1.4请求
<img src='https://user-gold-cdn.xitu.io/2018/11/30/1676251ca84e838b?w=2546&h=1068&f=jpeg&s=250219' />
可以看到并没有出现block，timeout等字段，只能看到比较明显的DISK_CACHE。  
因此这种情况也不满足，我们应该是和本地缓存强烈相关的。  

### 本地缓存

结合上面的分析，我们可以缩小到缓存上面。冲着这个目标，我们继续去看下相关资料。  
最后在一篇[日文资料](https://did2memo.net/2017/01/23/chrome-devtools-provisional-headers-are-shown/)里找到了相关解释。  
似乎只从缓存中获得的通信显示为“显示临时标题”（或“执行”）  
因为该文件是从缓存中获取的，并且未进行通信
所以详细标头并不会显示。

#### 原因：未与服务端正确通信  

回过头来看，前面提到的那么多情况其实都是与服务器没有进行或者完成正确的通信，所以只展示临时信息。

####  常见状况

provisional headers are shown出现的情况有这么几种：  

1. 跨域，请求被浏览器拦截
2. 请求被浏览器插件拦截
3. 服务器出错或者超时，没有真正的返回
4. 强缓存from disk cache或者from memory cache，此时也不会显示 

## 结束语
  
到这里provisional headers are shown相关总结就结束了，本身并不是一个问题，但在自身不了解的情况下还是要去研究一下，不然永远是个问题。本文抛砖引玉，给自己一个总结，同时希望能给有需要人一些帮助。   

### 参考文章  
[https://stackoverflow.com/questions/21177387/caution-provisional-headers-are-shown-in-chrome-debugger](https://stackoverflow.com/questions/21177387/caution-provisional-headers-are-shown-in-chrome-debugger)  
[https://did2memo.net/2017/01/23/chrome-devtools-provisional-headers-are-shown/](https://did2memo.net/2017/01/23/chrome-devtools-provisional-headers-are-shown/)   
[http://www.techfolks.net/provisional-headers-are-shown-in-google-chrome-browser-debugger/](http://www.techfolks.net/provisional-headers-are-shown-in-google-chrome-browser-debugger/)


