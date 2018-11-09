---
title: react-router v4 路由规则解析
date: 2018-11-08
---
  

## 前言  
react-router升级到4之后，跟前面版本比有了很大的差别。  
例如包的拆分，动态路由等[详细的差别就不说了，各位大神的总结也很到位，详细可以点击看看，All About React Router 4这篇文章](https://css-tricks.com/react-router-4/)。  
此外还有个差别是路由规则的变化。  一直有着上个版本的习惯，所以稍微复杂的路由，配起来的时候简直痛不欲生。  
痛定思痛，要好好了解下其依赖的匹配规则，即[path-to-regexp](path-to-regexp)。

本文期望读者是对react-router有过使用的同学，不然本文省略了太多东西，可能看起来可能有点太乱。
<!-- more -->
## path-to-regexp 是什么   
其文档一句话介绍很简洁明了:  将路径字符串（如/user/：name）转换为正则表达式。react-router matchPath就是基于其来匹配了。   

### 使用  

```js
var pathToRegexp = require('path-to-regexp')

// pathToRegexp(path, keys?, options?)
// pathToRegexp.parse(path)
// pathToRegexp.compile(path)
```

参数：  
* **path**: 字符串、字符串数组、正则表达式  
* **keys**  可选  由在path里找到的key组成的数组
* **options** 可选 由下面几部分组成：  
   1. 敏感匹配 默认false，当为true时，正则将区分大小写
   2. 严格模式 默认false 为true，将会匹配可选的紧跟的分隔符
   3. end 默认true 正则是否匹配至字符串结尾
   4. start 默认true 是否从字符串开始进行匹配
   5. 高阶选项（用于非路径名称字符串，例如主机名称hostname）  
        1. 分隔符 默认每段的分隔符是'/'
        2. 结尾字符 可选字段或字段列表、用于作为结束字符
        3. 分隔符列表 解析时要当做分隔符考虑的字段列表 默认‘./’ 

还是直接看官方例子吧

```js
// 匹配的path中关键字，得到由其组成的数组
// 简而言之，就是匹配的结果，增加该参数，可以更方便的使用和分析
var keys = []
var re = pathToRegexp('/foo/:bar', keys)
// 执行结果，转换之后的正则就如下
// re = /^\/foo\/([^\/]+?)\/?$/i
// 得到的路由相关信息
keys = [
    { 
        // 路由path中的参数名称
        name: 'bar', 
        // 前缀，分隔符等    
        prefix: '/', 
        delimiter: '/', 
        optional: false, 
        repeat: false, 
        pattern: '[^\\/]+?' 
    }
]
```

这样看起来应该清楚一下，下面继续看使用规则  
         
### 规则  

最简单的例子（结合react-router-config 路由最简单的路由可以如下， 各字段含义就不提了，本文只关注匹配规则）:
 
```js
const routes = [
  { component: Root,  
    routes: [
      { 
        //只匹配/  
        path: '/',
        exact: true,
        component: Home
      }
    ]
  }
]  
```

看起来也不过尔尔，简单匹配就完了，但是如果要是有比较复杂的路径的话，例如有这么一个路径:'/a/1/3.html' 其实/1/3都是可以省略的也是可选的，也就是说如下面这样：  

```js
'/a/1/3.html'
'/a.html'
'/a/2.html'
```
先不要急着写，这种当然是要有按照相应规则来匹配了，先看下对应规则：

### 参数
  
路径参数将会被用来定义参数和匹配关键字列表(即我们的keys)  

#### 命名参数  
命名参数通过如下形式定义： 在参数前面加上引号，例如：‘：foo’。默认情况下，在path的该区域结束之前的部分都会被匹配到(默认的话也就是两个//之间为一个区域，例如/:foo/，那么:foo 部分就是一个区域(segment))。

```js
var re = pathToRegexp('/:foo/:bar')
// 对应的匹配key数组如下
keys = [
    { name: 'foo', prefix: '/', ... },
    { name: 'bar', prefix: '/', ... }
]
// 对于下面的path，执行结果
re.exec('/test/route')
//=> ['/test/route', 'test', 'route']
```

#### 参数修饰符  

##### 可选
参数后缀可以加上一个可选标识即'?',表明该参数可选,这样情况下该部分参数如果没有也不正确匹配，只不过在匹配结果里值为undefined  

```js
var re = pathToRegexp('/:foo/:bar?')
keys = [
    { name: 'foo', ... }, 
    { 
    name: 'bar', 
    delimiter: '/', 
    // 匹配key数组第二部分就为true，表明该参数可选
    optional: true, 
    repeat: false }
]
// 可省略候选bar对应的部分
re.exec('/test')
//=> ['/test', 'test', undefined]

re.exec('/test/route')
//=> ['/test', 'test', 'route']
```
  
##### 0-n  

当然参数可以以*结尾，标识该部分参数0-n(可以类比正则)。每个匹配都会将前缀(/)考虑进去，即/已经不是默认的区块分割了，这也是跟？的区别。看例子比较清晰  

```js
var re = pathToRegexp('/:foo*')
// keys = [{ name: 'foo', delimiter: '/', optional: true, repeat: true }]

re.exec('/')
//=> ['/', undefined]
// 主要看这里，这时候/baz的内容同样被当成 foo的value组成部分了，直接和前面的一起输出
re.exec('/bar/baz')
//=> ['/bar/baz', 'bar/baz']
```
 
对比下？修饰符，应该比较清楚了。

```js
var re = pathToRegexp('/:foo?')

// 直接认为是不匹配的，输出为null
re.exec('/bar/baz')
//=> null
```

##### 1-n 
参数以+结尾时，表明该部分参数至少为1，同样会将分隔符计算进来。可以对比下上面与*的区别

```js
var re = pathToRegexp('/:foo+')
// keys = [{ name: 'foo', delimiter: '/', optional: false, repeat: true }]
// 此时/ 的路由已经不能匹配了，至少有一个参数
re.exec('/')
//=> null
// 这里倒是跟*一样
re.exec('/bar/baz')
//=> ['/bar/baz', 'bar/baz']
```

##### 自定义匹配参数

所有的参数都可以提供自定义的匹配规则，来覆盖默认规则([^\/]+)，如下匹配数字的例子：  

```js
// 这里自定的规则就是我们的数字匹配了(\d+) 
var re = pathToRegexp('/icon-:foo(\\d+).png')
// keys = [{ name: 'foo', ... }]

re.exec('/icon-123.png')
//=> ['/icon-123.png', '123']

re.exec('/icon-abc.png')
//=> null
```
注意：自定义规则中反斜杠(\)前面需要再加一个反斜杠，例如上线的例子(\\d+)(这里跟正则不太一致，记得别混淆)  

#### 未命名参数  

未命名的参数当然也是可行的，即只包含修饰符的群组。和命名参数的功能一样，只不过其name不是对应的key而是数字下标  

```js
// 第二个区块，匹配的是所有字符.*，显然是未命名的
var re = pathToRegexp('/:foo/(.*)')
keys = [
{ name: 'foo', ... }, 
// name就是0了，再有一个则按顺序排列    
{ name: 0, ... }]
// 结果没什么差别。
re.exec('/test/route')
//=> ['/test/route', 'test', 'route']  
```  
注意： react-router v4 不再处理querystring了，大家可以使用各种工具来处理，自己撸个工具也行。  

到这里参数部分已经结束了，回到上面的部分，/a/1/3.html。后面两个参数可选。
具体规则可以如下配置。  

```js
const routes = [
  { component: Root,  
    routes: [
      {  
        path: '/a(/)?:num1?(/)?:num2?(/)?',
        exact: true,
        component: Home
      }
    ]
  }
]  
```
是不是感觉日了那什么，有这么复杂吗，来我们仔细看看有没有这么复杂。
   
1. /a是固定的，可以不变，第一部分确定。  
2. 后面这个1对应num1，且可选  /a/:num1?
3. 3对应num2,同样可选 /a/:num1?/:num2?.html

看起来应该是这样。那么来试一试吧。

```js
var re = pathToRegexp('/a/:num1?/:num2?.html')
// 第一种情况是满足的，并且正确的得到value了。 3，4
console.log(re.exec('/a/3/4.html')) 
// [ '/a/3/4.html', '3', '4', index: 0, input: '/a/3/4.html' ]
// 这里看起来没问题，但是我们第一个匹配num1 是 undefined
// 这样顺序就乱了，这里应该是num1而非num2
console.log(re.exec('/a/4.html'))
// [ '/a/4.html', undefined, '4', index: 0, input: '/a/4.html' ]

// 直接不能匹配了
console.log(re.exec('/a.html'))
// null
```

这里的问题就在于连续两个可选参数的情况下，单纯的使用？就不满足了。  

按照上面的表达式，匹配的应该是第一个参数可选，但只有一个参数时，4.html连着一起，认为是num2的value了。  
上面的表达式转换为正则之后如下，有兴趣可以研究下：
这里的4.html命中的是后面的([^\/]+?)?\.html(?:\/)?$

```js
/^\/a(?:\/([^\/]+?))?\/([^\/]+?)?\.html(?:\/)?$/i
```  

对着上面的文档思考下，可以自定义可选参数，那么我们可不可以这样来试试(讲真的，开始真是试的)：    

指明前缀也是可选，表明.html不是跟最后一个区块紧密相连，这样应该可以满足要求  

```js
var re = pathToRegexp('/a(/)?:num1?(/)?:num2?.html')
console.log(re.exec('/a/0/4.html'))
//[ '/a/0/4.html', '/', '0', '/', '4', index: 0, input: '/a/0/4.html' ]
// 满足需求，这样4其实为num2的value 
console.log(re.exec('/a/4.html'))
//[ '/a/4.html','/','4',undefined,undefined,index: 0,input: '/a/4.html' ]
// 第三种满足情况
console.log(re.exec('/a.html'))
// [ '/a.html',undefined,undefined,undefined,undefined,index: 0,input: '/a.html' ]
```

这样总算满足需求了。  

#### 方法 

有以下这么几个，这里就不详细介绍了。  
* Parse 返回一个字符串和keys的数组。
* Compile ("Reverse" Path-To-RegExp)  将字符串转换为有效路径。 
* [其他的参考官网](https://github.com/pillarjs/path-to-regexp)

## 结束语
到这里关于react-router V4 路由规则部分的解析就结束了。起因也是自己在配置路由时有点懵，不想就那样跟着别人的路由配完就完了。知其然也要知其所以然，应该是我们技术人员一直秉承的一个态度，所以自己总结了一下，抛砖引玉，以供自己记忆和有需要的同学参考。  
[更多我的博客请移步](https://github.com/xiaoxiangdaiyu/blog)
### 参考文章  
* [path-to-regexp文档](https://github.com/pillarjs/path-to-regexp)  
* [https://css-tricks.com/react-router-4/](https://css-tricks.com/react-router-4/)


