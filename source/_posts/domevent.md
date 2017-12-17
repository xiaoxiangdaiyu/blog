---
title: DOMContentLoaded、readystatechange、load、ready详谈
date: 2017-12-17
---
对前端同学而言，loade,unload,DOMContentLoaded等页面加载过程中会触发的事件肯定是都接触过，不过要是具体问各个事件的区别，我就不是那么能清晰的解答上来的了。正好刚刚在无阻塞脚本那看到了DOMContentLoaded事件，就来翻翻具体文档详细看一下各个事件吧。常言道温故而知新，让我们一起回头看一下  
<!-- more -->
## 触发时机
先看下各个事件的触发时机(参考自[MDN](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded))  
### DOMContentLoaded   
当初始html文档完全加载并解析之后触发，无需等待样式、图片、子frame结束。作为明显的对比，load事件只有一个页面完全被加载时才触发。改用DOMContentLoaded的地方常常是load来代替，这是错误的。
tips: 有许多通用和独立的库提供跨浏览器方法来检测 DOM 是否已准备就绪即ready事件，后面我们可以看下zepto的实现
### load
当一个资源及其依赖的资源结束加载时触发。从这里可以看到需要等待依赖资源的结束加载。
### readystatechange
document有readyState属性来描述document的loading状态，readyState的改变会触发readystatechange事件.  

* loading  

    文档仍然在加载  
* interactive  


  文档结束加载并且被解析，但是想图片，样式，frame之类的子资源仍在加载  
* complete    

  
  文档和子资源已经结束加载，该状态表明将要触发load事件。  

因此，我们同样可以使用该事件来判断dom的加载状态。  
但并非所有对象都会经历 readyState 的这几个阶段，有时候需要
### beforeunload
当浏览器窗口，文档或其资源将要卸载时，会触发beforeunload事件。这个文档是依然可见的，并且这个事件在这一刻是可以取消的.  
如果处理函数为Event对象的returnValue属性赋值非空字符串，浏览器会弹出一个对话框，来询问用户是否确定要离开当前页面（如下示例）。有些浏览器会将返回的字符串展示在弹框里，但有些其他浏览器只展示它们自定义的信息。没有赋值时，该事件不做任何响应。
tip:2011年5月25号起，html5中指出，该事件中调用window.alert(), window.confirm(), and window.prompt()方法将会被忽略。
### unload
当文档或者一个子资源将要被卸载时，在beforeunload 、pagehide两个事件之后触发。  
文档会处于一个特定状态。  

* 所有资源仍存在 (图片, iframe 等.)
* 对于终端用户所有资源均不可见
* 界面交互无效 (window.open, alert, confirm 等.)
* 错误不会停止卸载文档的过程  


## 页面加载中的执行顺序  
  
从上面的定义，我们可以得出一个比较清晰的顺序了。  
  
1. 页面加载开始，首先肯定是先发出加载资源的请求，加载未完成之前，不触发任何事件。
2. document加载结束并解析，此时css等其他资源未加载完成。

   此时readyState为'interactive'，表明document已经load并解析完成，触发 readystatechange，然后触发DOMContentLoaded(在大多数浏览器上的表现如此)。捎带提一句，此时，加载完成且带有defer标记的脚本，会按顺序开始执行。  
      
3.  css、img等子资源加载完成之后  

    此时触发window.load事件  
4.  点击关闭标签或者刷新时，会依次触发beforeunload、unload事件。  

可能概念看的有点枯燥，还是看下代码比较清晰。大家可以看下，下面的代码会依次输出什么。  

```html
<!DOCTYPE html>
<html>

<head>
    <title>文档加载事件</title>
    <script>
            document.addEventListener("DOMContentLoaded", function (event) {
                console.log("初始DOM 加载并解析");
            });
            window.addEventListener("load", function (event) {
                console.log("window 所有资源加载完成");
            });
    
            document.onreadystatechange = function () {
                console.log(document.readyState)
                if (document.readyState === "complete") {
                    console.log('初始DOM,加载解析完成')
                }
            }
            window.addEventListener("beforeunload", function (event) {
                console.log('即将关闭')
                event.returnValue = "\o/";
            });
            window.addEventListener('unload', function (event) {
                console.log('即将关闭1');
            });
        </script>
    <link rel="stylesheet" href="./test.css">
</head>

<body>
    <div id="root">dom事件</div>
    <script src="./index.js"></script>
</body>

</html>
```  
   
依次输出如下:  
    
```js
    interactive //(index):15
    初始DOM 加载并解析 //(index):8
    complet//(index):15 
    初始DOM,加载解析完成//(index):17 
    window 所有资源加载完成//(index):11 
    //点击关闭按钮
    即将关闭
    即将关闭2  
```    
### 关于ready  
像jquery、zepto等类库中都有document一个ready方法，来确保我们的操作在初始dom加载之后进行，原生dom定义里是没有这个api的，是大牛们封装了一下判断的过程，提供我们以便利。  
有了前面的例子，让我们猜一下他们是怎么实现的。  
  
1. ready对应的状态是初始化dom已经加载完成，我们来看一下什么情况下对应该情况。

   有下面几个状态，complete、interactive 还有一个DOMContentLoaded也是初始dom加载完成，当然还有load事件，显然这里不会用到它，相对其他状态而言有点太晚了。 
2. 确定触发条件之后，下面的实现就简单了，判断就行了。  

   
以zepto为例，我们看下实现：   
 
```js 
//声明变量，不只使用interactive，是因为前面提到这些状态不一定全部出现
readyRE = /complete|loaded|interactive/

ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    } 
```  

至此，介绍就结束了。对我而言，明了原来不太清楚的概念，希望对大家也有所帮助。    





