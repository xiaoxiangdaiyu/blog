---
title: 前端解读控制反转(IOC)
date: 2018-10-19
---
  
## 前言
随着前端承担的职责越来越重，前端应用向着复杂化、规模化的方向发展。大型项目模块化是一种趋势，不可避免模块之间要相互依赖，此外还有很多第三方包。这样的话如何去管理这些繁杂的文件，是一个不可避免的话题。此时作为一种已经被实践证明过的思想模式一直得到大家的青睐，这就是控制反转(IOC)。
<!-- more -->
## IOC定义
先看一下维基百科上的定义：  
控制反转（Inversion of Control，缩写为IoC），是面向对象编程中的一种设计原则，可以用来减低计算机代码之间的耦合度。其中最常见的方式叫做依赖注入（Dependency Injection，简称DI），还有一种方式叫“依赖查找”（Dependency Lookup）。通过控制反转，对象在被创建的时候，由一个调控系统内所有对象的外界实体，将其所依赖的对象的引用传递给它。也可以说，依赖被注入到对象中。 

### 原则 

1. 高层模块不应该依赖低层模块。两个都应该依赖抽象 
2. 抽象不应该依赖具体实现
3. 面向接口编程，而非面向实现编程

针对前端来说，接口的概念不那么清晰明了，不像强类型语言。
概念是比较枯燥的，下面结合例子来看一下可能更好理解一点。  

### 目的
根据概念可以看到最主要的目的就是降低耦合，提高扩展性。在深究之前，我们先看下代码耦合
  
#### 代码耦合  
所谓耦合，可以如下图显示：
<img src='https://user-gold-cdn.xitu.io/2018/10/24/166a60f1cb4bdc20?w=808&h=580&f=png&s=32302'/>
比较清晰明了，代码相互之间的联系太直接：
假如obj2报错，那么整个系统也都报错了。  
所以我们的目的就是降低二者之间的耦合度，   
结合图来说比较清晰，  
如果两者不这么直接的发生关系，那么相互影响的概率就小了那么多了。  

另外，这是比较少的模块，常规项目里显然不仅仅是只有这么少，想象一下多个模块的场景：
<img src='https://user-gold-cdn.xitu.io/2018/10/24/166a60f1ca073f1e?w=1158&h=868&f=png&s=112204' />
这里除了耦合之外，不同齿轮之间的依赖关系也是个头疼的问题，迭代个几个版本之后发现，这是什么东西，一动就有bug。。。。

所以IOC就是来解决上述问题的。
其常见方式是依赖注入和依赖查找。在js领域里面最出名的就是angular中大量使用了依赖注入。文字比较苍白，我们可以通过例子来看看。


#### 实例 

就从nba来说，有那么一些球星，我们想知道他所属的球队，那么可能就像下面这个情况:

```js
//球队信息
class RTeam {
    constructor(){
        this.name = '火箭'
    }
}
// 球员信息
class Player{
    constructor(){
        this.team = new Team()
    }
    info(){
        console.log(this.team.name)
    }
}
// 球员ym
let ym = new Player()
ym.info() // ‘火箭’

```

看起来挺好的，球员player依赖于某个球队RTeam 
当调用的时候主动去加载球队即可。此时的控制权在player这里。

假如这个时候,球员发生交易了，球队信息更换了，转换到team2了。  
这时候我们就需要去修改player里的代码了，因为球员那里直接写死了对RTeam的依赖，这种可扩展性是很差的。
这不是我们所想要的，需要重新思考下依赖关系处理了。    
球员和球队之间非得这么直接粗暴的发生联系吗，  
一个球员对应一个球队的话，未来会发生变化的可能性太大了，毕竟不止一个球队。    
如果两者之间不直接发生联系，中间就需要一个中间模块来负责两者关系的处理  
球员不关注球队从哪来，只要给到我就行了。  
这样控制权就不是直接落在player这里了，这正是IOC的设计思路。

### 依据IOC 改进
参照IOC的几条原则，我们进行下改进。

1. 高层模块不应该依赖低层模块。两个都应该依赖抽象 
    这里player是高层模块，直接依赖了球队这个低级模块。所以我们将两者解耦，player不再直接依赖于该team这个class  
    
2. 抽象不应该依赖具体实现，具体实现应该依赖抽象  
    具体到这里来看我们的player模块不应该直接依赖具体team，而是通过构造函数将抽象的teaminfo实例传递进去，这样就解耦具体实现。
           
直接看代码比较清楚：  
    
```js
// 球队信息不依赖具体实现
// 面向接口即面向抽象编程
class TeamInfo {
    constructor(name) {
        this.name = name
    }
}
class Player {
    // 此处的参数，是teamInfo的一个实例，不直接依赖具体的实例
    // 面向抽象
    constructor(team) {
        this.team = team
    }
    info() {
        console.log(this.team.name)
    }
}
// 将依赖关系放到此处来管理，控制权也放到此处
// Player和TeamInfo之间不再有直接依赖
// 原本直接掌握teaminfo控制权的player不再直接依赖
// 将依赖控制，落在此处(第三方模块专门管理)即为控制反转
var ym = new Player(new TeamInfo('火箭'))
ym.info()
var kobe = new Player(new TeamInfo('湖人'))
kobe.info()
```  

这里发现，TeamInfo和Player之间已经没有直接关联了，依赖关系统一放到getTeamInfo中。  
所谓控制反转就如何上面一样，将依赖的控制权由player转移到其他地方即我们专门的依赖管理来做了。
这样再增加一个team3，改动也不大，复用就行了。
其中之间的关系，如下面这个图：
<img src='https://user-gold-cdn.xitu.io/2018/10/24/166a60f1c7e53fff?w=1274&h=860&f=png&s=64137'/>
彼此不直接发生联系，依赖关系统一在中间模块来管理，更加清晰。

### 实现
上面其实就是最简单的IOC实现了，基于IOC的编程思想，主要有两种实现方式：依赖注入和依赖查找。依赖查不太常用，常见的是依赖注入。    

#### 依赖注入 
在js中常见的就是依赖注入。从名字上理解，所谓依赖注入，即组件之间的依赖关系由容器在运行期决定，形象的来说，即由容器动态的将某种依赖关系注入到组件之中。

在RequireJS/AMD的模块加载器的实现就是基于依赖注入来的，还有大名鼎鼎的angular，其实现也使用了大量的依赖注入。
### 结束语

关于控制反转，一句话总结：控制反转这里控制权从使用者本身转移到第三方容器上，而非是转移到被调用者上，这里需要明确不要疑惑。控制反转是一种思想，依赖注入是一种设计模式。
可能听起来比较抽象，其实我们平时开发中见到和用到的也是蛮多的，可能原来没有对应起来罢了。
至于依赖注入，前端领域用到的就更多了，[下面我将结合自身实践翻译一篇个人认为很好的文章Dependency-injection-in-JavaScript](https://juejin.im/post/5bd177806fb9a05d30179925)，来进一步深入依赖注入。
至此，个人见解分享完毕，抛砖引玉，希望共同学习进步。
