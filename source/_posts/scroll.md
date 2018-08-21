---
title: 滚动边界
date: 2018-05-15
---
## 阻止页面橡皮筋滑动的解决方案
### 前言  
本文翻自[Scroll Bouncing On Your Websites](https://www.smashingmagazine.com/2018/08/scroll-bouncing-websites/)，拜读之后收获颇多，结合自己的理解，将该文章翻成中文，一方面加深理解另一方面好文共享。
  <!--more  -->
### 导读  
本文介绍了不同浏览器上弹簧滚动(即scroll bouncing)特效及实现，并回顾了网上几种常见的解决方案,顺便介绍了下近来实现的css属性 overscroll-behavior。希望读过之后能对构建和设计带有fixed元素的页面有所帮助

### Scroll bouncing  
弹簧特效（同样被叫做滑动橡皮筋特效或弹性滚动），经常发生于下面的场景：  
1. 当滚动到页面或者html元素的最上或者最下部的时候，在页面或者元素回到顶部/底部之前(即你松开手指或者鼠标之前)，会短暂的看到空白区域的出现。  
2. 同样的效果也可以在元素之间的CSS滚动捕捉([CSS scroll-snapping](http://www.w3cplus.com/css/practical-css-scroll-snapping.html))中看到。
本文主要关注于第一种情况，换句话说就是滚动端口到达其滚动边界时的场景  
对于Scroll bouncing的深入理解，可以帮助我们决定如何构建网页和页面如何滚动。

### 背景

当你不想看到fixed的元素跟着页面移动时，弹簧特效就不那么令人愉快了。例如：我们希望页面上有位置固定的header和footer、或者需要一个fixed的菜单、滚动过程中捕获页面的具体位置、不希望顶部或者底部有额外的滚动。这时候就需要我们去看一下有什么方案去解决这类页面顶/底部的弹簧特效了。   

### 场景回顾   

假如入我们有下面这个页面，底部有一个固定且不能移动的footer，同时页面其他内容可以滚动。看起来如下：
<img src='https://user-gold-cdn.xitu.io/2018/8/20/16557cd210e6d683?w=800&h=443&f=gif&s=175632'/> 
如果是在非触摸屏和触摸板的Firefox和其他浏览器上，表现是符合预期，但是当我们使用mac上的chrome时，当用触摸板scroll到最下部时，事情就有点不一样了。
<img src='https://user-gold-cdn.xitu.io/2018/8/20/16557cd22c2b7ef4?w=1280&h=710&f=gif&s=2726862'/>  

虽然设置了footer为fixed=>bottom的css，但是这个橡皮筋特效确实有点猝不及防。  
让我们看看position:fixed到底几个意思：  
According to the CSS 2.1 Specification, when a “box” (in this case, the dark blue footer) is fixed, it is “fixed with respect to the viewport and does not move when scrolled.”  
根据CSS 2.1 规范： 当一个box(这里显然是footer)被设置为fixed，它将根据viewport定位并且在滚动过程中不移动。  

显然上面的效果是预期之外的。  
为了使文章更加完整，把在移动端Edge、移动端Safari和桌面Safari的效果都进行了尝试，确实在firefox和chrome上的表现是不同的。在不同平台上开发相同效果的滑动确实是一件挑战性的事情。  

### 解决方案  
对于我们来说最先出来的想法肯定是简单快捷的方式，那么针对这种情况，首选当然是css来单独处理。因此选择下面的方式来尝试。测试浏览器包括win10和mac上的chrome、firefox、safari以及Edge和移动端safari，浏览器的版本都是2018最新版本。页面结构如下：   

```html
<html>
  <body>
    <div class="body-container">
      <div class="color-picker-main-container"> 
      </div>
    </div>
    <footer>
    </footer>
</body>    
``` 

## 只用css、html来解决   

### 一、绝对定位以及相对定位的方式   
使用absolute来定位footer，然后html相对定位height100%，以便footer始终在下方固定，content的高度就是100%减去footer的高度。当然也可以设置padding-bottom来代替calc，同时设置body-containe为100%防止footer重复。语言比较苍白，看代码就完了：  

```css
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

body {
  width: 100%;
  margin: 0;
  font-family: sans-serif;
  height: 100%;
  overflow: hidden;
}

.body-container {
  height: calc(100% - 100px);
  overflow: auto;
}

.color-picker-main-container {
  width: 100%;
  font-size: 22px;
  padding-bottom: 10px;
}

footer {
  position: absolute;
  bottom: 0;
  height: 100px;
  width: 100%;
}
```
这种方式和原来fixed的方式几乎一样。差别在于该方式滑动的部分不再是整个页面而是content内容，不包括footer。这种方式最大的问题在于移动端的safari上，不仅仅是content，footer也会跟着一起滑动。。。当滑动很快的时候表现简直是灾难。如下图
<img src='https://user-gold-cdn.xitu.io/2018/8/20/16557cd21927ccd6?w=600&h=1067&f=gif&s=1828247'/>

此外，另一个不想看到的情况也出现了，当滑来滑去的尝试的时候，发现此时的滑动性能有点差。  
因为我们设置滑动容器的高度为它本身的100%，这样就阻碍了ios上的momentum-based scrolling，  
这里的momentum-based scrolling，我没有很好的语言来翻译，简称为阻尼滑动吧  
简单而言就是移动设备上增加的一种旨在提升页面滑动性能的功能，比较明显的体现就是当你的手指轻触触碰设备表面时，页面自身开始滑动，当手指停止滑动之后页面还会顺势滑动一会。[更多了解请转](http://www.hnldesign.nl/work/code/momentum-scrolling-using-jquery/)。我肯定是希望有这种效果的，所以要远离设置滑动元素height100%。  

在继续其他的尝试之前，我们先慢下来想一想当前的状态。原先的fixed定位存在橡皮筋的问题，上面的将其转换为absolute+relative的话没有了阻尼滑动。如果想要阻尼滑动，那么内容部分的height就不能设置为100%。那么是否可以不去显式设置height为100%呢。

```css
html {
  width: 100%;
  position: fixed;
  overflow: hidden;
}

body {
  width: 100%;
  margin: 0;
  font-family: sans-serif;
  position: fixed;
  overflow: hidden;
}

.body-container {
  width: 100vw;
  height: calc(100vh - 100px);
  overflow-y: auto;
  // Use momentum-based scrolling on WebKit-based touch devices
  -webkit-overflow-scrolling: touch;
}

.color-picker-main-container {
  width: 100%;
  font-size: 22px;
  padding-bottom: 10px;
}

footer {
  position: fixed;
  bottom: 0;
  height: 100px;
  width: 100%;
}

```  
这里设置html，body均为fixed、overflow: hidden。footer同样为fixed。  
在需要滚动的body-container内容区域设置其高度为100vh-footer的高度，  
同时增加-webkit-overflow-scrolling: touch;开启阻尼滑动支持。   
效果会怎么样呢。
mac上的Chrome和Firefox和上一种方式标表现形式是一样的，这种方式的优点就是不再需要100% height,  
所以 momentum-based scrolling表现的还不错，然而在Safari，footer不见了。。。   
<img src='https://user-gold-cdn.xitu.io/2018/8/20/16557cd223f6b2a5?w=1280&h=709&f=gif&s=1743190'/> 
在iOS的 Safari上，footer变短，并且底部有了个额外的间隔。同样，当滚到底部的时候，滚动页面的能力消失了。   
<img src='https://user-gold-cdn.xitu.io/2018/8/20/16557cd21927ccd6?w=600&h=1067&f=gif&s=1828247'/>


在上面代码里-webkit-overflow-scrolling: touch;给指定元素增加 momentum-based scrolling 的能力。不过该属性在MDN中标识是非标准的，兼容性有待考虑，所以也只能抛弃它了。  

另一种方案如下：

```css
html {
  position: fixed;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: sans-serif;
  margin: 0;
  width: 100vw; 
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.color-picker-main-container {
  width: 100%;
  font-size: 22px;
  padding-bottom: 110px;
}

footer {
  position: fixed;
}

```
这种方式在不同的桌面浏览器上表现是不错的，阻尼滑动、footer固定并且不跟随移动。但是这种方式的缺点在于在iOS Safari 上可以发现footer有轻微抖动  
并且当你滑动的时候可以看到content在footer下面。   

## 使用javascript  
既然上面的方式都有些瑕疵，那么我们还是试试js来解决吧。  
首先声明我不推荐并且建议尽量避免使用该方式。依据原作者的经验，应该存在更为优雅和简介的html+css方式。
不过已经花费了很多时间去解决该问题，去看看使用js是否有更好的方式也不会有什么损失。   

一种避免滑动弹簧的方式是阻止window或者document的touchmove或touchstart事件。思路是阻止外层window的tocuch事件，只允许content部分的touch。代码如下：
  
```js
// Prevents window from moving on touch on older browsers.
window.addEventListener('touchmove', function (event) {
  event.preventDefault()
}, false)

// Allows content to move on touch.
document.querySelector('.body-container').addEventListener('touchmove', function (event) {
  event.stopPropagation()
}, false)
```
我尝试了很多方式尽力使滑动表现良好，阻止widow的touchmove和阻止document的没什么区别，我也尝试使用touchstart和touchmove来控制滑动，  
不过这两种方式也没什么区别。后来发现出于性能的考虑，不应该这种方式来使用event.preventDefault()，应该设置将false作为passive的选项来设置。  

```js
// Prevents window from moving on touch on newer browsers.
window.addEventListener('touchmove', function (event) {
  event.preventDefault()
}, {passive: false})
```  

## 工具  
另外可以使用iNoBounce来帮助自己，该库目的就是解决ios上web应用滑动时的弹簧效应。需要提一下的时，使用该库解决上面问题时要加上-webkit-overflow-scrolling。   
另外我在结尾时提到的简洁方法和其有异曲同工之妙，可以对比一下两者。

## Overscroll Behavior  

尝试那么多方案之后，我发现了css的一个属性overscroll-behavior，该属性CSS属性在2017年12月和2018年3月分别在Chrome 63、Firefox 59中实现。  
根据mdn的定义：允许你控制浏览器的滑动溢出的行为--当到达滚动区域的边边界时会发生的行为。这就是最后的一种方案。  
需要做的仅仅是在body设置overscroll-behavior:none,并设置footer为fixed，相比于没有foter，整个页面应用momentum-based scrolling是可以接受的。
更加客观的是Edge正在开发中，未来可期。  

## 结束语  
### 参考文章  
1. [Momentum Scrolling on iOS Overflow Elements](https://css-tricks.com/snippets/css/momentum-scrolling-on-ios-overflow-elements/)
2. [Scroll Bouncing On Your Websites](https://www.smashingmagazine.com/2018/08/scroll-bouncing-websites/)
3. [MOMENTUM SCROLLING USING JQUERY](http://www.hnldesign.nl/work/code/momentum-scrolling-using-jquery/)   

再次感谢原作者William Lim，提供了比较丰富滑动橡皮筋特效的解决思路。才疏学浅，有些翻译不到位的地方多请指正，[详情异步原文](https://www.smashingmagazine.com/2018/08/scroll-bouncing-websites/)
 







 

  