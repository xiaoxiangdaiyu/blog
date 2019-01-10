---
title: 其实我们可以少写点if else和switch
date: 2019-01-10
---

## 前言
作为搬砖在第一线的底层工人，业务场景从来是没有做不到只有想不到的复杂。  
不过他强任他强，if-else全搞定，搬就完了。但是随着业务迭代或者项目交接，自己在看自己或者别人的if代码的时候，心情就不再表述了，各自深有体会。所以我们一起看看if还能怎么写
<!-- more -->
## 最基本if-else
  
假设有这么个场景,不同情况下打印不同值。
因为涉及到的条件太多，就不提三目运算之类优化了。

```js
if (a == 1) {
    console.log('a1')
} else if (a == 2) {
    console.log('b2')
} else if (a == 3) {
    console.log('c3')
} else if (a == 4) {
    console.log('d4')
}
/* n..... */
```
现在还算能看，因为逻辑简单，如果逻辑复杂，迭代多个版本之后，你还敢动吗。  
每动一下就战战兢兢，谁知道哪里会遗漏。
那么换种方式呢
## switch-case
这样稍微清晰那么一点,差别好像没什么差别：

```js
switch(a){
    case 1:
        console.log('a1');
        break;
    /* 省略。。。 */  
    case 40:
        console.log('a40');
        break;
}
```
## 分离配置信息与执行动作

### object映射
定义一个object作为配置对象来存放不同状态，通过链表查找

```js
const statusMap = {
    1:()=>{
        console.log('a1')
    },
    2:()=>{
        console.log('b2')
    }
    /* n.... */
}
// 执行
let a = 1 
statusMap[a || 1]()
```

这样比较清晰，将条件配置与具体执行分离。如果要增加其他状态，只修改配置对象即可。

### 数组映射

当然在某些状态下可以使用数组，来做这个配置对象。  

```js
// 这里就涉及其他优化了，例如将执行函数抽离出来，大家不要关注func的内容就好。
// 它就是个function，内容很复杂
const statusArr = [function(){
    console.log(1)
},
    function () {
        console.log(2)
    },]
// 执行
let a = 1
statusArr[a || 1]()
```
数组的要求更高一点，如果是其他key，例如字符串，那么数组就不能满足需求了

## 升级版：不同key相同value

这样看起来好一点了，那么需求又有变动了，  
前面是每种处理方式都不同，下面有几种情况下处理函数相同的，
例如1-39的时候，调用a，40之后调用b，如果我们继续来用映射的方式来处理。

```js
function f1 (){
    console.log(1)
}
function f2 (){
    console.log(2)
}
const statusMap={
    1:f1,
    2:f1,
    3:f1,
    4:f1,
    //省略
    40:f2
}
let a = 2
statusMap[a]()
```

这样当然也可以，不过重复写那么多f1，代码看起来不够简洁。

开始重构之前我们先捋一下思路，无非是想把多个key合并起来，对应一个value。  
也就是说我们的键值不是字符串而是个数组，object显然只支持字符串，
那么可以将这么多key合并成一个：'1,2,3,4,..,9'。

但是查找的时候有点问题了，我们的参数肯定不能完全匹配。  
接着走下去，是不是做个遍历加个判断，包含在子集内的都算匹配，那么代码看起来就是下面这个样子。  

```js
// 将键值key设置为一个拼接之后的字符串
const statusMap = {
    '1,2,3,4,5': f1,
    //省略
    40: f2
}
// 获取所有的键值，待会遍历用
const keys = Object.keys(statusMap),
    len = keys.length
// 遍历获取对应的值 
const getVal=(param='')=>{
    // 用for循环的原因在于匹配之后就不需要继续遍历
    for (let i = 0; i < len; i++) {
        const key = keys[i],
            val = statusMap[key]
        // 这里用什么来判断就随便了，两个字符串都有。    
        if (key.includes(param)) {
            return val
        }
    }
}
let a = 2,
    handle = getVal(a)
handle() // 1
```

但是这样来看，增加了个遍历的过程，而且是拼接字符串，万一哪天传了个逗号进来，会得到了预料之外的结果。

### map

es6有个新的数据结构Map，支持任意数据结构作为键值。如果用Map可能更清晰一点。

```js
/**
 * map键值索引的是引用地址，
 * 如果是下面这样的写法不好意思，永远得不到值
 * map1.set([1,4,5],'引用地址')
 * map1.get([1,4,5])  //输出为undefined
 * 就像直接访问
 * map1.get([1,2,3,4,5]) //同样为undefined
 */
const map1 = new Map()
const statusArr = [1,2,3,4,5]
map1.set(statusArr,f1)
// 预设默认值，因为不能直接遍历
let handle = function(){}
const getVal = (param = '') => {
for (let value of map1.entries()) {
    console.log(JSON.stringify(value))
    if (value[0].includes(param)){
        console.log(value)
        // 不能跳出 只能处理了
        handle = value[1]
    }
}
}
const a = 2
getVal(a)
handle()
```

个人而言虽然这样减少了重复代码，但是又增加了一步匹配值的操作，优劣就见仁见智吧。  

### 双数组

肯定有部分人就是不想做遍历的操作，既然一个数组不能满足，那么两个数组呢。   

```js
// 键值数组和value 保持对应关系
const keyArr = ['1,2,3,4,5','40']
const valArr = [f1,f2]
const getVal = (param = '')=>{
    // 查找参数对应的下标
    let index = keyArr.findIndex((it)=>{
        return it.includes(param)
    })
    // 获取对应值
    return valArr[index]
}
let a = 2,
    handle = getVal(a)
handle()
```
利用数组提供的下标，将key和value对应起来，进而获取想要的值。  
这里一直没有达到我最初的目的，即键里面重复的数组，可以不通过多余操作匹配到，上面不管怎么样都进行了处理，这不是懒人的想要的。

## 总结  

这是在写业务需求的时候做的一点总结，数组和对象的映射可能大家都在用。当遇到了不同key相同value的情况时，从懒出发不像重复罗列，就尝试了下。当然了，因为个人水平问题，肯定有更好的处理方式，欢迎一起讨论，抛砖引玉共同进步。此外现有成熟的库里loadsh也是可以到达目的，不过自己思考过之后再去看大神的作品理解会更深入一点。



