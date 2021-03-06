---
title: 硬件、网络及性能
date: 2018-05-07
---
## 提升现代web app的中的页面性能
前言，本文翻译自[https://docs.google.com/presentation/d/1hBIb0CshY9DlM1fkxSLXVSW3Srg3CxaxAbdocI67NCQ/edit#slide=id.g32e52b1ea6_1_0](https://docs.google.com/presentation/d/1hBIb0CshY9DlM1fkxSLXVSW3Srg3CxaxAbdocI67NCQ/edit#slide=id.g32e52b1ea6_1_0)看到之后感觉讲解的系统清晰明了，实属一篇好文。就加上自己的理解翻译了一下，聊以加深印象。
<!-- more -->
### 硬件、网络，对性能的而言始终不能避开的两个物理因素 
  
### 一、 硬件如何影响性能  
硬件（即处理能力）决定了计算密集型任务的表现  
浏览器必须解析、编译并执行所有的js，如下如所示：
<img src='/img/performance/1.png'> 
对于每个阶段而言，代码量的差异显然会影响其变现即影响性能，这种差异在低处理能力的机器上的体现尤为明显。  
当然其他类型的资源请求也会影响性能，相比之下js的影响是比较突出的。  
所以考虑不同用户cpu的状况，减少js怪物(即缩小js体积)是很必要的。可以从以下几方面着手：
1. 删除不必要js
2. 延迟加载非关键js
3. 借助相关工具
### 1.1 删除不必要js
#### 只在必要的时候进行转换 
仅仅对需要ES5的客户端才进行转换，80%的浏览器已经支持ES2015。(结合自己实际开发情况，移动端而言确实80%+的手机已经支持ES2015，仅仅只遇到oppop，vivio这两中手机不支持。)因为转换之后的代价还是有的，如下所示:   

```js
//ES2015
books.map(b => b.title);
//ES5
books.map(function(b) { return b.title; }, this);
//体积大了一倍
```
#### 使用压缩工具/优化工具  
像UglifyJS & Closure Compiler 之类的工具，在压缩之外还有一些优化功能。
对大多数的js而言压缩代码中空格移除和符号修改占了95%的工作量，并非是精心的代码转换。
压缩不应该是盲目的，应该平衡下面几点。  
* 更好的压缩比
* 高额的计算机资源消耗
* 前期准备
* 可能的副作用 
压缩可能不是一味的追求体积更小，相对而言，压缩也应该权衡一下其他方面。比较常见就是代码压缩时相比于其他流程，超长的时间消耗。压缩之后可能遇到关键字的问题。  
如何解决其实应该是从本身项目出发。
* 尽可能的优化可缓存的静态资源
* 在压缩体积和时间之间找到一个平衡点  

#### 使用tree-shaking移除没用的代码  
和压缩代码的目的一致，减小资源大小，不过是从另一个层面的解决方案。像webpack，rollup都提供了该功能。  
tree-shaking会将没有被用到的exports移除  

```js
//tool 
//used
export function a(){
    console.log('1')
}
export function b(){
    console.log('2')
}
//app.js
import {a} from './tool'
a()
```   
 
function b 未被使用，最终的打包文件中b将会被删除。
#### ES2015的模块是静态的，可以使用tree-shaking  
import/export 在执行之前就被确定，并且两者只能在顶层，没有条件逻辑的情况下使用(毕竟未执行)  
#### tree-shaking的局限  
  
* 仅仅删除未被使用的导出  
* 不支持所有的代码库（仅仅ES2015） 
* 可能做不到极致  
   难以确定删除是否会有副作用，这种打包器只能保留    
   
#### 自我排查  
工具不能做到尽善尽美，并且在执行之前确定某项问题是困难的。  
当前来说应该从代码规范和代码注释来自我完善。  
#### 对于框架   
如果非必须，请不要使用。大的框架至少300kb的体积。   
当然必要，请基于下面几点来选择：   
 
* 服务端渲染  
* 懒加载 
* 代码优化    
* 性能  


### 1.2 延迟加载非必需js   
  
先看一下js不同引入方式的差别  

|  | 默认方式 | Async | Defer |
| --- | --- | --- | --- |
| 阻塞渲染 | 是 | 否 | 否 |
| 执行时机 | 加载完成 | 加载完成 | document解析完成 |

#### 使用代码分割和懒加载  
* 减少启动时需要加载的js  
* 尽可能少的加载不相关的js   
传统的做法是加载Bundle js，代码分割是将代码分成不同的chunk  
这里同样有两种极端：  
* 每个模块对应一个js  
    不好压缩  
    利于缓存  
    粒度更小
* 整个应用只对应一个js   
    便于压缩  
    不利于缓存  
    粒度太大，即可维护性
忽然有种中庸的感觉了，凡事皆有度，所有单一操作都不能过分苛求极致，兼顾才是合理
### 1.3 使用其他工具  
#### 使用html和css   
某些状况下可能需要vanilla JS(即原生js)，框架带来便利的同时不可避免的有其他的一些性能消耗。提到这里有一篇文章大家可以看一下[我是怎么把我的 React 应用换成 VanillaJS 的（这是不是一个坏主意）](https://www.w3ctech.com/topic/1978)
举个例子：
Netflix 降低了他们登录页50%的TTI（传输时间间隔）通过下面的方式：
* 使用原生js来代替React
* 当用户登录的时候加载余下的部分   

#### 使用server
将代价昂贵的库放到server端,使用ssr来代替client-side-render.  
ssr可以将我们初始页面加载事件减少到原来的1/5并减少不同浏览器之间的差异。
ssr确实首屏的优化确实很大，优点不多说。但这里提一句，不要盲目ssr，特别是初次请求响应时间较长的接口

## 二、网络的影响  
首先了解两个概念：  

* 带宽:  数据吞吐量(比特/秒)
* 延迟: 延迟数据传输时间(ms)

  
对于大部分市场来说，带宽是可以满足需求的(这里统计是国外的，平均26兆，国内略低一点)，平均页面大小3.5Mb。传输时间（3.5/26）0.13s。国内会差一点。
延迟对性能影响比较明显。
移动网络的延迟  

| 网络 | 延迟ms |
| --- | :-- |
| 5G | <=4 |
| 4G | <=100 |
| 3G | 100-500 |
| 3G | 300-1000 |

### 适应移动网络的限制   

应该从下面几方面来分别考虑。   
  
* 减少请求数量
* 优化关键路径  
* 减少请求大小  

### 2.1 减少请求数量   

#### 新建一次连接的代价是昂贵的，要重复以下过程  
建立连接需要1至3+响应在数据相应之前。   
 
1. DNS 查询(可能) 
2. TLS 握手(可能)
3. 请求资源      


#### 初始状态连接不能被充分利用  

TCP slow-start限制了在初始响应里里数据被发送的数量  

#### 发送更多的数据通常情况下比新建连接要划算。    

请求的体积与相应时间并不是线性关系。  
两次50k的请求消耗比一次100k的大了不少。   
  
#### 减少重定向的使用    

* 重定向增加了服务器昂贵的循环  
* server-side 相对于client-side来说重定向优秀一点（快并且可缓存）
* 看一下301和302的响应code    


#### 使用缓存  
理想状态下，确实资源是否最新不应该通过网络请求  
可以通过下面的方式：    

* 使用Content-addressed URLs: 
      即内容与地址对应，log13234d.jpg而非log.jpg    
* 使用max-age   

这种浏览器调整为Facebook节省了60%的请求  

#### 使用service workers来增强缓存  

service worker可以帮组我们：  
  
* 拦截网络请求 
* 访问浏览器缓存  
* 代替发送网络请求来处理过期的资源  

#### 使用http2  
使用HTTP2时，每个来源只需要一个连接，减少了连接创建的开销。   
### 2.2 优化关键路径  
优化页面渲染或者加载时所需的事件以便尽可能的加快完成。  

#### 浏览器优化资源请求   
对于所有的请求，浏览器对其是有权重处理的，即分不同的优先级来加载。具体来说就是重要会阻塞渲染的优先级比较高。  
如下图所示： 
<img src='/img/performance/2.png'> 
  
#### 使用资源提示  
通过以下方式，提前加载或者请求将要用到的内容：    

* Dns-prefresh  
* preconnect
* preconnect
* Preload（当前页面）
* Prefetch(下个页面)  

### 2.3 降低请求大小   
 
* 使用Brotli压缩    
   相对于gzip 
    更好的压缩比，文件越大越明显
    更快的解压缩  
    压缩速度极大提升
* 减少js体积  
* 优化图片
23就不再多提了，方式有很多。   
 
### 结束语  
对于好的资源，多读收益还是很明显的。这次翻译感觉体会又多了一些，不过由于本人才疏学浅，如有错误还望多多指正。一言概之，共同学习。   
