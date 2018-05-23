---
title: 深入js隐式类型转换
date: 2018-05-23 08:00:29
tags:
---
## 前言  
相信刚开始了解js的时候，都会遇到 2 =='2',但是 1+'2' == '1'+'2'为false的情况，这时候应该会是一脸懵逼的状态，不得不感慨js弱类型的灵活让人发指，隐式类型转换就是这么猝不及防。结合实际中的情况来看，有意或无意中涉及到隐式类型转换的情况还是很多的。既然要用到，就需要掌握其原理，知其然重要知其所以然更重要。   
  <!--more  -->
## js的变量类型  
JavaScript 是弱类型语言，意味着JavaScript 变量没有预先确定的类型。    
并且变量的类型是其值的类型。也就是说变量当前的类型由其值所决定,夸张点说上一秒种的string，下一秒可能就是个array了。此外当进行某些操作时，变量可以进行类型转换，我们主动进行的就是显式类型转换，另一种就是隐式类型转换了。例如:

```js
var a = '1';   
typeof a;//string 

a =parseInt(a); //显示转换为number
typeof a  //number   

a == '1' //true
```

弱类型的特性在给我们带来便利的同时，也会给我们带来困扰。趋利避害，充分利用该特性的前提就是掌握类型转换的原理，下面一起看一下。  
## js数据类型   
老生常谈的两大类数据类型：   
 
1. 原始类型    
   Undefined、 Null、 String、 Number、 Boolean      
2. 引用类型  
   object   
此外还有一个es6新增的Symbol，先不讨论它。对于这五类原始类型，突然提问可能想不全，没必要去死记硬背，可以想一下为否的常见变量及其对应值即可。   
  
| 0 | Number |
| --: | --: |
| '' | String |
| false | Boolean |
| null | Null |
| undefined | Undefined |

对于不同的数据格式转换规则是不同的，我们需要分别对待。   
## 转换规则  
既然是规范定义的规则，那就不要问为什么了，先大致看一下，争取记住。是在不行经常翻翻看看大佬的博客[es5规范](http://yanhaijing.com/es5/#about)。转换有下面这么几类，我们分别看一下具体规范。（这部分转换规则，完全可以跳过去，看到下面的实例再回头看应该更容易接受一些）  
   
* 转换为原始值  
* 转换为数字  
* 转换为字符串    


### ToPrimitive(转换为原始值)   

ToPrimitive 运算符接受一个值，和一个可选的 期望类型 作参数。ToPrimitive 运算符把其值参数转换为非对象类型。如果对象有能力被转换为不止一种原语类型，可以使用可选的 期望类型 来暗示那个类型。根据下表完成转换  
<img src='http://xxdy.tech/img/jstype/1.png'> 

这段定义看起来有点枯燥。转换为原始值，其实就是针对引用数据的，其目的是转换为非对象类型。   
如果已经是原始类型，当然就不做处理了   
对于object，返回对应的原始类型，该原始类型是由期望类型决定的，期望类型其实就是我们传递的type。直接看下面比较清楚。  
ToPrimitive方法大概长这么个样子具体如下。  

```js
/**
* @obj 需要转换的对象
* @type 期望转换为的原始数据类型，可选
*/
ToPrimitive(obj,type)
```

type可以为number或者string，两者的执行顺序有一些差别   
**string:**   
   
1. 调用obj的toString方法，如果为原始值，则返回，否则下一步   
2. 调用obj的valueOf方法，后续同上
3. 抛出TypeError 异常
 
**number:**    

1. 调用obj的valueOf方法，如果为原始值，则返回，否则下一步   
2. 调用obj的toString方法，后续同上
3. 抛出TypeError 异常    

其实就是调用方法先后，毕竟期望数据类型不同，如果是string当然优先调用toString。反之亦然。   
当然type参数可以为空，这时候type的默认值会按照下面的规则设置    

1.  该对象为Date，则type被设置为String  
2.  否则，type被设置为Number 

对于Date数据类型，我们更多期望获得的是其转为时间后的字符串，而非毫秒值，如果为number，则会取到对应的毫秒值，显然字符串使用更多。
其他类型对象按照取值的类型操作即可。  

概括而言，ToPrimitive转成何种原始类型，取决于type，type参数可选，若指定，则按照指定类型转换，若不指定，默认根据实用情况分两种情况，Date为string，其余对象为number。那么什么时候会指定type类型呢，那就要看下面两种转换方式了。  

### toNumber 

某些特定情况下需要用到ToNumber方法来转成number 
运算符根据下表将其参数转换为数值类型的值
<img src='http://xxdy.tech/img/jstype/2.png'>    

对于string类型，情况比较多，只要掌握常见的就行了。和直接调用Number(str)的结果一致，这里就不多提了，主要是太多提不完。  
需要注意的是，这里调用ToPrimitive的时候，type就指定为number了。下面的toString则为string。

### toString   

ToString 运算符根据下表将其参数转换为字符串类型的值：  
其实了解也很简单，毕竟是个规范，借用大佬一张图：  
<img src='http://xxdy.tech/img/jstype/3.png'> 

虽然是需要死记的东西，还是有些规律可循的。
对于原始值：  
  
* Undefined，null，boolean 
  直接加上引号，例如'null' 
* number 则有比较长的规范,毕竟范围比较大  
  常见的就是 '1'   NaN则为'NaN'  基本等同于上面一条
  对于负数，则返回-+字符串 例如 '-2'  其他的先不考虑了。   
* 对象则是先转为原始值，再按照上面的步骤进行处理。   

### valueOf  

当调用 valueOf 方法，采用如下步骤：

1. 调用ToObject方法得到一个对象O
2. 原始数据类型转换为对应的内置对象， 引用类型则不变 
3. 调用该对象(O)内置valueOf方法.


不同内置对象的valueOf实现：
* String => 返回字符串值
* Number => 返回数字值  
* Date => 返回一个数字，即时间值,字符串中内容是依赖于具体实现的
* Boolean => 返回Boolean的this值
* Object => 返回this  

对照代码更清晰一点    

```js
var str = new String('123')
//123
console.log(str.valueOf())
var num = new Number(123)
//123
console.log(num.valueOf())
var date = new Date()
//1526990889729
console.log(date.valueOf())
var bool = new Boolean('123')
//true
console.log(bool.valueOf())
var obj = new Object({valueOf:()=>{
    return 1
}})
//依赖于内部实现
console.log(obj.valueOf())

```


## 运算隐式转换  
前面提了那么多抽象概念，就是为了这里来理解具体转换的。   
对于+运算来说，规则如下：  

* +号左右分别进行取值，进行ToPrimitive()操作
* 分别获取左右转换之后的值，如果存在String，则对其进行ToString处理后进行拼接操作。
* 其他的都进行ToNumber处理
* 在转换时ToPrimitive，除去Date为string外都按照ToPrimitive type为Number进行处理
说的自己都迷糊了快，一起结合代码来看一下   
 
```js
1+'2'+false
```

1. 左边取原始值，依旧是Number
2. 中间为String，则都进行toString操作  
3. 左边转换按照toString的规则，返回'1'
4. 得到结果temp值'12'
5. 右边布尔值和temp同样进行1步骤
6. temp为string，则布尔值也转为string'false'
7. 拼接两者 得到最后结果 '12false'

我们看一个复杂的

```js
var obj1 = {
    valueOf:function(){
        return 1
    }
}
var obj2 = {
    toString:function(){
        return 'a'
    }
}
//2
console.log(1+obj1)
//1a
console.log('1'+ obj2)
//1a
console.log(obj1+obj2)
```


不管多复杂，按照上面的顺序来吧。  

* 1+obj1      
  1. 左边就不说了，number
  2. 右边obj转为基础类型，按照type为number进行
  3. 先调用valueOf() 得到结果为1
  4. 两遍都是number，则进行相加得到2  
* 1+obj2  
  1. 左边为number 
  2. 右边同样按照按照type为number进行转化
  3. 调用obj2.valueOf()得到的不是原始值
  4. 调用toString() return 'a'
  5. 依据第二条规则，存在string，则都转换为string进行拼接
  6. 得到结果1a
* obj1+obj2  
  1. 两边都是引用，进行转换 ToPrimitive 默认type为number
  2. obj1.valueOf()为1 直接返回
  3. obj2.valueOf()得到的不是原始值
  4. 调用toString() return 'a'
  5. 依据第二条规则，存在string，则都转换为string进行拼接
  6. 得到结果1a 

到这里相信大家对+这种运算的类型转换了解的差不多了。下面就看一下另一种隐式类型转换  

### == 抽象相等比较

这种比较分为两大类，
* 类型相同
* 类型不同
相同的就不说了,隐式转换发生在不同类型之间。规律比较复杂，规范比较长，这里也不列举了，[大家可以查看抽象相等算法](http://yanhaijing.com/es5/#104)。简单总结一句，相等比较就不想+运算那样string优先了，是以number优先级为最高。概括而言就是，都尽量转成number来进行处理，这样也可以理解，毕竟比较还是期望比较数值。那么规则大概如下：  
对于x == y

1. 如果x,y均为number，直接比较

   ```js
    没什么可解释的了
    1 == 2 //false
    ```

2. 如果存在对象，ToPrimitive() type为number进行转换，再进行后面比较

    ```js
    var obj1 = {
        valueOf:function(){
            return '1'
        }
    }
    1 == obj2  //true
    //obj1转为原始值，调用obj1.valueOf()
    //返回原始值'1'
    //'1'toNumber得到 1 然后比较 1 == 1
    [] == ![] //true
    //[]作为对象ToPrimitive得到 ''  
    //![]作为boolean转换得到0 
    //'' == 0 
    //转换为 0==0 //true
    ```

3. 存在boolean，按照ToNumber将boolean转换为1或者0，再进行后面比较   
     
   ```js
   //boolean 先转成number，按照上面的规则得到1  
   //3 == 1 false
   //0 == 0 true
   3 == true // false
   '0' == false //true 
   ```

4. 如果x为string，y为number，x转成number进行比较
    
    ```js
    //'0' toNumber()得到 0  
    //0 == 0 true
    '0' == 0 //true 
    ```

## 结束语   

#### 参考文章  
[ECMAScript5.1中文版 + ECMAScript3 + ECMAScript（合集）](http://yanhaijing.com/es5/#101)  
[你所忽略的js隐式转换](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651227769&idx=1&sn=617160e64d2be13169b1b8f4506d8801&chksm=bd495ffd8a3ed6eb226d4ef193ff2ce3958d2d03d1f3047b635915f8215af40996c2f64d5c20&scene=21#wechat_redirect)  
这篇文章的本意是为自己解惑，写到后面真的感觉比较乏味，毕竟规范性的东西多一点，不过深入了解一下总好过死记硬背。[原文请移步我的博客](https://github.com/xiaoxiangdaiyu/blog)。对于有些观点说这些属于js糟粕，完全不应该深入，怎么说呢，结合自己情况判断吧。本人水平有限，抛砖引玉共同学习。


