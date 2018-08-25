---
title: 由自定义事件到双向绑定
date: 2018-08-25 08:00:29
tags:
---
#由自定义事件到双向绑定  
## 前言  
除了大家经常提到的自定义事件之外，浏览器本身也支持我们自定义事件，我们常说的自定义事件一般也都是用于项目中的一些通知机制，例如双向绑定。一起看一下如何实现自定义事件，以及基于观察者模式的双向绑定的基本原理。
<!-- mmore -->
## 浏览器自定义事件
### 定义  
除了我们常见的click，touch等事件之外，浏览器支持我们定义和分发自定义事件。
创建也十分简单：

```js
//创建名为test的自定义事件
var event = new Event('test')
//如果是需要更多参数可以这样
var event = new CustomEvent('test', { 'detail': elem.dataset.time });
```
大多数现代浏览器对new Event/CustomEvent 的支持还算可以（IE除外），可以看下具体情况：
<img src='https://p1.meituan.net/dpnewvc/f85dbad9ff379e936ef42744f4b73266184137.png'/>
可以放心大胆的使用，如果非要兼容IE那么有下面的方式

```js
var event = document.createEvent('Event');
//相关参数
event.initEvent('test', true, true);
```
自定义事件的触发和原生事件类似，可以通过冒泡事件触发。

```html
<form>
  <textarea></textarea>
</form>
```
触发如下，这里就偷个懒，直接拿mdn的源码来示例了，毕竟清晰易懂。

```js
const form = document.querySelector('form');
const textarea = document.querySelector('textarea');


//创建新的事件，允许冒泡，支持传递在details中定义的所有数据
const eventAwesome = new CustomEvent('awesome', {
  bubbles: true,
  detail: { text: () => textarea.value }
});

  //form元素监听自定义的awesome事件，打印text事件的输出
  // 也就是text的输出内容
form.addEventListener('awesome', e => console.log(e.detail.text()));
  //  
  // textarea当输入时，触发awesome
textarea.addEventListener('input', e => e.target.dispatchEvent(eventAwesome));
```
上面例子很清晰的展示了自定义事件定义、监听、触发的整个过程，和原生事件的流程相比看起来多了个触发的步骤，原因在原生事件的触发已经被封装无需手动处理而已。   
### 应用
### 各大js类库
各种js库中用到的也比较多，例如zepto中的tap，原理就是监听touch事件，然后去触发自定的tap事件(当然这种成熟的框架做的是比较严谨的)。可以看下部分代码：

```js
//这里做了个event的map，来将原始事件对应为自定义事件以便处理
// 可以只关注下ontouchstart，这里先判断是否移动端，移动端down就对应touchstart，up对应touchend，后面的可以先不关注
eventMap = (__eventMap && ('down' in __eventMap)) ? __eventMap :
      ('ontouchstart' in document ?
      { 'down': 'touchstart', 'up': 'touchend',
        'move': 'touchmove', 'cancel': 'touchcancel' } :
      'onpointerdown' in document ?
      { 'down': 'pointerdown', 'up': 'pointerup',
        'move': 'pointermove', 'cancel': 'pointercancel' } :
       'onmspointerdown' in document ?
      { 'down': 'MSPointerDown', 'up': 'MSPointerUp',
        'move': 'MSPointerMove', 'cancel': 'MSPointerCancel' } : false)
 //监听事件
     $(document).on(eventMap.up, up)
      .on(eventMap.down, down)
      .on(eventMap.move, move)       
 //up事件即touchend时，满足条件的会触发tap    
 var up = function (e) {
      /* 忽略 */
       tapTimeout = setTimeout(function () {
           var event = $.Event('tap')
            event.cancelTouch = cancelAll
            if (touch.el) touch.el.trigger(event); 
          },0）
        }
     //其他   
```
### 发布订阅
和原生事件一样，大部分都用于观察者模式中。除了上面的库之外，自己开发过程中用到的地方也不少。  
举个例子，一个输入框表示单价，另一个div表示五本的总价，单价改变总价也会变动。借助自定义事件应该怎么实现呢。
html结构比较简单

```js
<div >一本书的价格：<input type='text' id='el' value=10 /></div>
<div >5本书的价格：<span id='el2'>50</span>元</div>
```
当改变input值得时候，效果如下：
<img src='https://p1.meituan.net/dpnewvc/5a5d14a552d668507c41463e5c865c347690486.gif'/>

大概思路捋一下：
1、自定义事件，priceChange，用来监听改变price的改变
2、 加个监听事件，priceChange触发时改变total的值。
3、input value改变的时候，触发priceChange事件
代码实现如下：

```js
  const count = document.querySelector('#el'),
      total1 = document.querySelector('#el2');
  const eventAwesome = new CustomEvent('priceChange', {
      bubbles: true,
      detail: { getprice: () => count.value }
    });
  document.addEventListener('priceChange', function (e) {
      var price = e.detail.getprice() || 0
      total1.innerHTML=5 * price
    })
  el.addEventListener('change', function (e) {
    var val = e.target.value
    e.target.dispatchEvent(eventAwesome)
  });
```
代码确实比较简单，当然实现的方式是多样的。但是看起来是不是有点双向绑定的味道。  
确实目前大多数框架中都会用到发布订阅的方式来处理数据的变化。例如vue中的双向绑定，react中的setState等，以vue为例子，我们可以来看看其双向绑定实现原理。  
## 自定义事件
这里的自定义事件就是前面提到的第二层定义了，非基于浏览器的事件。这种事件也正是大型前端项目中常用到。对照原生事件，应该具有on、trigger、off三个方法。分别看一下
1. 对照原生事件很容易理解，绑定一个事件，应该有对应方法名和回调,当然还有一个事件队列

```js
class Event1{
    constructor(){
      // 事件队列
      this._events = {}
    }
    // type对应事件名称，call回调
    on(type,call){
      let funs = this._events[type]
      // 首次直接赋值，同种类型事件可能多个回调所以数组
      // 否则push进入队列即可
      if(funs){
        funs.push(call)
      }else{
        this._events.type=[]
        this._events.type.push(call)
      }
    }
}
```
2. 触发事件trigger

```js
// 触发事件
    trigger(type){
      let funs = this._events.type,
        [first,...other] = Array.from(arguments)
      //对应事件类型存在，循环执行回调队列  
      if(funs){
        let i = 0,
            j = funs.length;
        for (i=0; i < j; i++) {
          let cb = funs[i];
          cb.apply(this, other);
        }
      }
    }
```
3. 解除绑定：

```js
// 取消绑定，还是循环查找
    off(type,func){
      let funs = this._events.type
      if(funs){
        let i = 0,
          j = funs.length;
        for (i = 0; i < j; i++) {
          let cb = funs[i];
           if (cb === func) {
            funs.splice(i, 1);
            return;
          }
        }
      }
      return this
    }
  }
```
这样一个简单的事件系统就完成了，结合这个事件系统，我们可以实现下上面那个例子。  
html不变，绑定和触发事件的方式改变一下就好

```js
 // 初始化 event1为了区别原生Event
  const event1 = new Event1()    
  
  // 此处监听 priceChange 即可
  event1.on('priceChange', function (e) {
      // 值获取方式修改
      var price = count.value || 0
      total1.innerHTML = 5 * price
    })  
  el.addEventListener('change', function (e) {
    var val = e.target.value
    // 触发事件
    event1.trigger('priceChange')
  });
```
这样同样可以实现上面的效果，实现了事件系统之后，我们接着实现一下vue里面的双向绑定。
### 双向绑定  
说到vue的双向绑定，网上相关文章简直太多了，这里就不深入去讨论了。简单搬运一下基本概念。详细的话大家可以自行搜索。  
### 基本原理
直接看图比较直观：
<img src='https://p0.ssl.qhimg.com/t0166c573c58763fc45.png'/>
就是通过观察者模式来实现，不过其通过数据劫持方式实现的更加巧妙。  
数据劫持是通过Object.defineProperty()来监听各个属性的变化，从而进行一些额外操作。
举个简单例子：  

```js
let a = {
   b:'1' 
}
Object.defineProperty(a,'b',{
        get(){
            console.log('get>>>',1)
            return 1
        },
        set(newVal){
            console.log('set>>>11','设置是不被允许的')
            return 1
        }
    })
a.b //'get>>>1'
a.b = 11    //set>>>11 设置是不被允许的
```
所谓数据劫持就是在get/set操作时加上额外操作，这里是加了些log，如果在这里去监听某些属性的变化，进而更改其他属性也是可行的。   
要达到目的，应该对每个属性在get是监听，set的时候出发事件，且每个属性上只注册一次。  
另外应该每个属性对应一个监听者，这样处理起来比较方便，如果和上面那样全放在一个监听实例里面，有多个属性及复杂操作时，就太难维护了。
    
```js
//基本数据
let data = {
    price: 5,
    count: 2
  },
callb = null  
```
可以对自定义事件进行部分改造,  
不需要显式指定type，全局维护一个标记即可  
事件数组一维即可，因为是每个属性对应一个示例  

```js
class Events {
    constructor() {
      this._events = []
    }
    on() {
      //此处不需要指定tyep了
      if (callb && !this._events.includes(callb)) {
        this._events.push(callb)
      }
    }
    triger() {
      this._events.forEach((callb) => {
        callb && callb()
      })
    }
  }
```
对应上图中vue的Data部分，就是实行数据劫持的地方

```js
Object.keys(data).forEach((key) => {
    let initVlue = data[key]
    const e1 = new Events()
    Object.defineProperty(data, key, {
      get() {
         //内部判断是否需要注册
        e1.on()
        // 执行过置否
        callb = null
        // get不变更值
        return initVlue
      },
      set(newVal) {
        initVlue = newVal
        // set操作触发事件，同步数据变动
        e1.triger()
      }
    })
  })
```
此时数据劫持即事件监听准备完成，大家可能会发现callback始终为null，这始终不能起作用。为了解决该问题，下面的watcher就要出场了。

```js
function watcher(func) {
    // 参数赋予callback，执行时触发get方法，进行监听事件注册
    callb = func
    // 初次执行时，获取对应值自然经过get方法注册事件
    callb()
    // 置否避免重复注册
    callb = null
  }
  // 此处指定事件触发回调，注册监听事件
  watcher(() => {
    data.total = data.price * data.count
  })
```
这样就保证了会将监听事件挂载上去。到这里，乞丐版双向绑定应该就能跑了。可以将下面的完整代码放到console台跑跑看。   

```js
let data = {
    price: 5,
    count: 2
  },
    callb = null

  class Events {
    constructor() {
      this._events = []
    }
    on() {
      if (callb && !this._events.includes(callb)) {
        this._events.push(callb)
      }
    }
    triger() {
      this._events.forEach((callb) => {
        callb && callb()
      })
    }
  }
 
  Object.keys(data).forEach((key) => {
    let initVlue = data[key]
    const e1 = new Events()
    Object.defineProperty(data, key, {
      get() {
         //内部判断是否需要注册
        e1.on()
        // 执行过置否
        callb = null
        // get不变更值
        return initVlue
      },
      set(newVal) {
        initVlue = newVal
        // set操作触发事件，同步数据变动
        e1.triger()
      }
    })
  })
  function watcher(func) {
    // 参数赋予callback，执行时触发get方法，进行监听事件注册
    callb = func
    // 初次执行时，获取对应值自然经过get方法注册事件
    callb()
    // 置否避免重复注册
    callb = null
  }
  // 此处指定事件触发回调，注册监听事件
  watcher(() => {
    data.total = data.price * data.count
  })
```
### 结束语
#### 参考文章
[vue数据响应的实现](https://medium.com/vue-mastery/the-best-explanation-of-javascript-reactivity-fea6112dd80d)  
[Creating and triggering events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events)  
看到知识盲点，就需要立即行动，不然下次还是盲点。正好是事件相关，就一并总结了下发布订阅相关进而到了数据响应的实现。个人的一点心得记录，分享出来希望共同学习和进步。[更多请移步我的博客](https://github.com/xiaoxiangdaiyu/blog)
