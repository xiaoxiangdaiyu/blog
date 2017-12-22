---
title: 更便捷的css处理方式-PostCSS
date: 2017-12-22
---
一般来说介绍一个东西都是要从是什么，怎么用的顺序来讲。我感觉这样很容易让大家失去兴趣，先看一下postcss能做点什么，有兴趣的话再往下看，否则可能没有耐心看下去。让我们开始吧
<!-- more -->
## postcss能做什么  
### 补全css属性浏览器前缀 
手写的代码可以是这样的:  

```css
.div{
    display: flex;
}
```
   
postcss可以转换之后成了这样:

```css
.div{
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
}
``` 
  
### 检查css语法   
 
```css
    body{
    color: #f0;
    }
```

会有以下提示:    

```
src/er.css
 2:12  ✖  Unexpected invalid hex color "#f0"   color-no-invalid-hex



[18:27:28] 'css-lint' errored after 98 ms
[18:27:28] Error in plugin 'gulp-stylelint'
Message:
    Failed with 1 error
```
### 拥抱下个版本规范的css 即css4
对于下个规范的css而言，变量，方法等功能的都会增加上去，你可以这样来定义一个变量：    
```css
:root { 
    --red: #d33;
  }
  a { 
      color: var(--red);
  }
```
当然直接在现有浏览器上是跑不通的，就正如es2015刚开始一样，我们需要一个转化器来将其转成当前可用规范。postcss的插件就可以做到。  

```css
a{
    color:#d33
}
```
除了上面之外还有其他很多功能，postcss及其插件都能提供。

## 什么是postcss  

现在让我们回到最基本的问题，postcss是什么。  
援引官网的定义，一种使用js来转化css的工具(A tool for transforming CSS with JavaScript)。其实我们更多的时候提到postcss是有两个含义的：
1. postcss本身，也就是我们npm install时的安装部分  
2. 基于postCss的丰富插件系统。   
   上文那些功能，都是基于postcss的插件提供的功能。  
   
postcss本身并不直接用于处理样式，只有配合它的插件，才能完成相关的编译工作。
 
#### postcss不是预编译语言的替代品   
  
我想你脑海里一直在复现两个名词，less/sass，开始的时候我也一样，认为postcss跟二者一样是一种css预编译语言或者起到类似作用的一种语言。postcss不是要取代哪一个，更多的是提供的一种补充，完全可以是互补的概念。  
作为一个是使用js将css转化为AST然后进行处理的工具，完全不是预处理语言的替代品，postcss处理的必须是css文件，所以完全可以和预编译语言结合，使用预编译语言转化为css之后然后进行处理。  
我一直认为两者不是互斥的关系，完全可以互补使用。   

## 为什么需要postcss    

大家可能有这么个疑问既然两者不互相冲突，目前我使用less/sass 也很容易满足我的需求，为什么要使用新的东西呢。我认为主要原因是其提供的丰富的插件功能，可以工作更加的简单化，便捷化，一句话，你只需要编写基本的css，其他的功能交给postcss就好。做了简单的对比可能更加清晰明了。  

#### 实现给css属性加上浏览器前缀的功能  

对比一下less和postcss的实现： 

1、 对于less而言，肯定是写一个方法  

```css
.flex-block() {
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
}
.test{
    .flex-block()
}
```
2、使用postcss

```css
.test{
    display: flex;
}
```
只需要编译的时候使用autoprefixer处理就好。  
可能一个属性的效果不是特别明显，要是有很多个属性需要处理呢?  

```css
.flex-block() {
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
}
.transform(){
    //仅仅是举例子
}
.ccc(){
}
.test{
    .flex-block()
    .transform()
    .ccc()
}
```
这时候postcss还是只需要如下:  

```css
.test{
    display: flex;
    transform:rotate(7deg);
}
```
这时候就能看出来postcss的便捷性了，我一直认为可以抽象公共化的东西完全没有必要去重复的去手动开发。  

## postcss工作原理   

postcss本身是一个node模块，可以将css文件解析为抽象语法树(AST)，将该树在多个插件方法传递，然后将AST转换为字符串返回，该字符串可以输出到目标文件中。传递过程中的插件可以选择是否改变该语法树，上诉改变可以通过sourcemap来记录。如下面的流程所示(借用w3cplus的一张图)：
<img src='https://www.w3cplus.com/sites/default/files/blogs/2017/1707/figure-18.png'/>

其实这里我们更应该关联起来的是babel，看一下功能：  
* 将未来规范的转化为当前规范的转义器
* 实现相同，都是将源文件解析为AST然后经由插件处理。
* 丰富的插件，满足不同的需求
* 支持自定义插件的开发   

#### 当前工作流中引入postcss  
  
大家可能会有这种想法，又是一种新的工具，我当前的开发框架中岂不是要大动。其实这种担心是没必要的。postcss是很容易引入当前的工作流中的。无论是webpack还是gulp，都有比较方便的方式。[官方有详细的介绍文档](https://github.com/postcss/postcss#usage)  

## 结束语  

原先很早就看到postCss，当时太年轻认为是less的一种替代品罢了，所以一直没有去关注。了解之后感觉真的不错，至于如何使用这里就不去演示了，有兴趣的可以查看下[我的简单示例](https://github.com/xiaoxiangdaiyu/postcss/tree/master/)希望更多的人使用。

#### 参考文章  
[http://davidtheclark.com/its-time-for-everyone-to-learn-about-postcss/](http://davidtheclark.com/its-time-for-everyone-to-learn-about-postcss/)
[http://julian.io/some-things-you-may-think-about-postcss-and-you-might-be-wrong/](http://julian.io/some-things-you-may-think-about-postcss-and-you-might-be-wrong/)
