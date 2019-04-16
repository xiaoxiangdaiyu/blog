---
title: node.js监听文件变化的实现
date: 2019-04-16
---

## 前言

随着前端技术的飞速发展，前端开发也从原始的刀耕火种，向着工程化效率化的方向发展。在各种开发框架之外，打包编译等技术也是层出不穷，开发体验也是越来越好。例如HMR，让我们的更新可以即时可见，告别了手动F5的情况。其实现就是监听文件变化自动调用构建过程。下面就关注下如何实现node监听文件变化。
<!-- more -->
## 场景
假定要监听index.js，每当内容更改重新编译。  
我们就用简单的console来标识执行编译。下面就是实现该功能。

## node原生API
### fs.watchFile
翻下node的文档就会看到一个满足我们需求的Api[fs.watchFile](https://nodejs.org/docs/latest-v9.x/api/fs.html#fs_fs_watchfile_filename_options_listener)(毕竟是文件相关的操作，很大可能就在fs模块下面了)。  

```js
fs.watchFile(filename[, options], listener)
```

* filename 显然就是文件名
* options 可选 对象 包含以下两个属性
        
   *  persistent  文件被监听时进程是否继续，默认true 
   *  interval 多长时间轮训一次目标文件，默认5007毫秒
* listener 事件回调 包含两个参数
   * current  当前文件stat对象
   * prev 之前文件stat对象  


看完参数信息，不知道大家有没有从其参数属性中得到点什么特别的信息。特别是interval选项和listener中的回调参数。
  
监控filename对应文件，每当访问文件时会触发回调。  

这里每当访问文件时会触发，实际指的是每次切换之后再次进入文件，然后保存之后，无论是否做了修改都会出发回调。  

另外轮询事件和文件对象，是不是可以猜测，其实现监听的原理，固定时间轮询文件状态，然后将前后的状态返回，将判断交给使用者。  
所以node也建议，如果要获取文件修改，那么需要根据stat对象的修改时间来进行对比，即比较 curr.mtime 和 prev.mtime。  

这样就有点问题，我们先看下例子，会更清晰一点。

```js
const fs = require('fs')
const filePath = './index.js'
console.log(`正在监听 ${filePath}`);
fs.watchFile(filePath, (cur, prv) => {
    if (filePath) {
        // 打印出修改时间
        console.log(`cur.mtime>>${cur.mtime.toLocaleString()}`)
        console.log(`prv.mtime>>${prv.mtime.toLocaleString()}`)
        // 根据修改时间判断做下区分，以分辨是否更改
        if (cur.mtime != prv.mtime){
            console.log(`${filePath}文件发生更新`)
        }
    }
})
```
然后测试结果如下：

```js
// 运行 
node watch1.js
// 1、访问index.js 不做修改，然后保存
// 2、切换文件，再次访问，不做修改，只报错
// 3、编辑内容，并保存
```
<img src='/img/watchfile/watchFile.gif'/>

可以看到1、2两步，并没有实际修改内容，然而我们并没有办法区分。只要你是切换之后再保存，修改时间戳mtime就发生变化。  
另外响应时间真的很慢，毕竟是轮询。

对于这些问题，其实官网也给了一句话：  
  
```bash
Using fs.watch() is more efficient than fs.watchFile and fs.unwatchFile. fs.watch should be used instead of fs.watchFile and fs.unwatchFile when possible.
```

**能用fs.watch的情况就不要用watchFile了。一是效率，二是不能准确获知修改状态 三是只能监听单独文件**  
对于实际开发过程中，显然我们想要关注的是源文件夹的变动。  

### fs.watch

首先用法如下：

```js
fs.watch(filename[, options][, listener])
```
跟fs.watchFile比较类似。 

* filename 显然就是文件名
* options 可选 对象或者字符串 包含以下三个属性
        
   *  persistent  文件被监听时进程是否继续，默认true
   *  recursive 是否监控所有子目录，默认false 即当前目录，true为所有子目录。 
   *  encoding 指定传递给回调事件的文件名称，默认utf8
* listener 事件回调 包含两个参数
   * eventType  事件类型，rename 或者 change
   * filename 当前变更文件的文件名

options如果是字符串，指的是encoding。  

监听filename对应的文件或者文件夹(recursive参数也体现出来这一特性)，返回一个fs.FSWatcher对象。

该功能的实现依赖于底层操作系统的对于文件更改的通知。 所以就存在一个问题，可能不同平台的实现不太相同。
如下示例1：  

```js
const fs = require('fs')
const filePath = './'    
console.log(`正在监听 ${filePath}`);
fs.watch(filePath,(event,filename)=>{
    if (filename){
        console.log(`${filename}文件发生更新`)
    }
})
```
一个比较明显的优势就体现出来了：响应比较及时，相比于轮询，效率肯定更高。  

不过这样修改并保存的时候回发现同样有点问题。
直接保存，显示两次更新  
修改文件之后，同样显示两次更新(mac系统上是两次，其他系统可能有所差别)
<img src='/img/watchfile/watch1.gif'/>
这样可能是于操作系统对文件修改的事件支持有关，在保存的时候出发了不止一次。  
下面聚焦于回调事件的参数，event对应事件类型，是否可以判断事件类型为change呢，才执行呢，忽略空保存。  

```js
const fs = require('fs')
const filePath = './'    
console.log(`正在监听 ${filePath}`);
fs.watch(filePath,(event,filename)=>{
    console.log(`event类型${event}`)
    if (filename && event == 'change') {
        console.log(`${filename}文件发生更新`)
    }
})
```
不过实际上，空的保存event也是change，另外不同平台event的实现可能也有所不同。这种方式要pass掉。   

#### 校验变更时间
显然从上面的例子可以看到，变更时间依然不可控。因为每次保存，node对应stat对象依然会修改。

#### 对比文件内容  
只能选择这种方式来判断是否是否更新。例如md5:

```js
const fs = require('fs'),
    md5 = require('md5');
const filePath = './'    
let preveMd5 = null

console.log(`正在监听 ${filePath}`);
fs.watch(filePath,(event,filename)=>{
    var currentMd5 = md5(fs.readFileSync(filePath + filename))
    if (currentMd5 == preveMd5) {
        return
    }
    preveMd5 = currentMd5
    console.log(`${filePath}文件发生更新`)
})
```
先保存当前文件md5值，每次文件变化时(即保存操作响应之后)，每次都获取文件的md5然后进行对比，看是否发生变化。  
<img src='/img/watchfile/md51.gif'/>
不过这样可以看到，当初次保存时，都会执行一次，因为初始值为null的缘故。这样可以加个兼容，根据是否第一次保存来判断好了。

#### 优化

对于不同的操作系统，可能保存时触发的回调不止一个(mac上到没出现)。为了避免这种实时响应对应的频繁触发，可以引入debounce函数来保证性能。  

```js
const fs = require('fs'),
    md5 = require('md5');
let preveMd5 = null,
    fsWait = false
const filePath = './'    
console.log(`正在监听 ${filePath}`);
fs.watch(filePath,(event,filename)=>{
    if (filename){
        if (fsWait) return;
        fsWait = setTimeout(() => {
            fsWait = false;
        }, 100)
        var currentMd5 = md5(fs.readFileSync(filePath + filename))
        if (currentMd5 == preveMd5){
            return 
        }
        preveMd5 = currentMd5
        console.log(`${filePath}文件发生更新`)
    }
})
```


## 结束语  
到这里，node监听文件的实现就结束了。做个学习笔记，来做个参考记录。实现起来并不难，但是要实际应用的话需要考虑的方面就比较多了。还是推荐开源框架node-watch、chokidar等，各方面实现的都比较完善。   
#### 参考文章
[node文档](https://nodejs.org/docs/latest-v9.x/api/fs.html#fs_fs_watchfile_filename_options_listener)  
[How to Watch for Files Changes in Node.js](https://thisdavej.com/how-to-watch-for-files-changes-in-node-js/)  
[Nodejs Monitor File Changes](https://stackfame.com/nodejs-monitor-file-changes)