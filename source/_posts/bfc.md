---
title: 由清除float原理到BFC
date: 2018-05-15
---
  
## 关于浮动
设置为浮动的元素会脱离当前文档流，向左或向右移动直到边缘遇到另一个浮动元素或者到达边界。普通元素不会对齐造成影响。  
浮动是把双刃剑，在给我们的布局带来便利的同时有一些缺点需要我们去解决。例如最常见的父元素塌陷。如下图所示：  
<!-- more -->

```css  
.warper{
    width: 200px;
    border:1px solid  #ff6633;
}
.float-1{
    float: left;
    background: blue;
    height: 100px;
    width: 100px;
}
.float-2{
    float: left;
    background: #ff0;
    height: 50px;
    width: 100px;
}
//html  
<div class='warper'>
    <div class="float-1"></div>
    <div class="float-2"></div>
</div>
```  
<img src='/img/bfc/1.png'/>
可以看到父元素的高度为0,为了解决这种状况就要清除浮动了。  

### 清楚浮动的方式   

总结了一下，大致有如下几类:  

    1. 结尾空元素或者after等伪元素或者br 来clear
    2. 父元素同样浮动
    3. 父元素设置overflow为hidden或者auto 
    4. 父元素display：table       

大致归类，可以分为两大类，1使用clear的属性，后面的可以归为一类，都是通过触发BFC来实现的。
下面详细看一下这两大类清除浮动的方式及原理。   

#### clear属性    

clear 属性规定元素盒子的边不能和浮动元素相邻。该属性只能影响使用清除的元素本身，不能影响其他元素。    
换而言之，如果已经存在浮动元素的话，那么该元素就不会像原本元素一样受其影响了。
第一种方式里我们的填补元素(我自己的称呼)，就是起这种作用。  

```css  
//这里当然可以换成一个空的div，<br/>等，原理和效果都是一致的  
.warper:after {
    content: '';
    height: 0;
    display: block;
    clear: both;
} 
```     

此时after伪元素设置clear：both之后表明，我两边都不能接受浮动元素，原本受浮动元素影响，伪元素的位置在浮动元素下方如图：
<img src='/img/bfc/2.png'/>  

这样显然也不能撑起父元素的高度。设置之后，需要重新安排安排了。既然两边都不接受浮动元素，但浮动元素位置也确定了，那只能把伪元素放在下边，如图：  
<img src='/img/bfc/3.png'/>  

可以看到，伪元素的位置在最下方了，距顶部的高度为float元素的高度，顺带撑起了父元素的高度。同样适用其他填充元素（display为block），都能达到相同的目的。   
在看后面几种原理之前我们需要先看一下BFC的定义。  

### BFC    

#### 块级格式化上下文：BFC(block formatting contexts)    

照本宣科的定义看起来可能不大好理解，BFC是一个独立的渲染区域，只有Block-level box参与， 它规定了内部的Block-level Box如何布局，并且与这个区域外部毫不相干。借用张鑫旭大大的一句话，BFC元素特性表现原则就是，内部子元素再怎么翻江倒海，翻云覆雨都不会影响外部的元素。所以，避免margin穿透啊，清除浮动什么的也好理解了。  

正如下面的解释：  

In a block formatting context, each box’s left outer edge touches the left edge of the containing block (for right-to-left formatting, right edges touch). This is true even in the presence of floats (although a box’s line boxes may shrink due to the floats), unless the box establishes a new block formatting context (in which case the box itself may become narrower due to the floats)   
在BFC中，每个盒子的左外边框紧挨着包含块的左边框（从右到左的格式，则为紧挨右边框）。即使存在浮动也是这样的（尽管一个盒子的边框会由于浮动而收缩），除非这个盒子的内部创建了一个新的BFC浮动，盒子本身将会变得更窄）。     
 
#### BFC的特性     

1. 块级格式化上下文会阻止外边距叠加
2. 块级格式化上下文不会重叠浮动元素
3. 块级格式化上下文通常可以包含浮动     

换句话说创建了 BFC的元素就是一个独立的盒子，里面的子元素不会在布局上影响外面的元素，反之亦然，同时BFC任然属于文档中的普通流。所以呢浮动也就解决了，关于BFC以后要专门搞个文章仔细研究一下。  

看到这里就可以知道了，为什么可以拿来清除浮动了，表现为BFC的元素都是一个十分个性的存在，无论里面怎么折腾，对外表现始终如一。大家肯定可以猜到，上面几种利用了BFC的清除方式肯定是触发了BFC的条件，让父元素变为BFC。我们来看一下触发BFC的条件，看是不是如我们所想。 

#### BFC触发条件  
    
CSS3里面对这个规范做了改动，称之为：flow root，并且对触发条件进行了进一步说明。  

```js
float 除了none以外的值 
 
overflow 除了visible 以外的值（hidden，auto，scroll ） 
 
display (table-cell，table-caption，inline-block) 
 
position（absolute，fixed） 
 
fieldset元素
```   

由上面可以对比一下，我们提到那几种方法，就是触发了BFC而已。  
看个例子    

```CSS  
.warper{
    width: 200px;
    border:1px solid  #ff6633;
    // 下面属性任选其一
    overflow: hidden;
    overflow: auto;
    float: left;
    display:inline-block;
    position: fixed;
}
```      
 
<img src='/img/bfc/4.png'/>  

### 结束语   
#### 参考文章  
[CSS深入理解流体特性和BFC特性下多栏自适应布局](http://www.zhangxinxu.com/wordpress/2015/02/css-deep-understand-flow-bfc-column-two-auto-layout/)   
[理解CSS中BFC](https://www.w3cplus.com/css/understanding-block-formatting-contexts-in-css.html)
到这里清除float相关的内容就说完了，知其然更要知其所以然，清除float的方式繁多无比，掌握其中原理才能不人云亦云。当然抛砖引玉，更多的是共同学习共同进步,[更多请移步博客]()。





