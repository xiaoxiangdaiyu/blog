---
title: 编写一个babel插件
date: 2018-06-1 08:00:29
tags:
---
## 前言 
对于前端开发而言，babel肯定是再熟悉不过了，工作中肯定会用到。除了用作转换es6和jsx的工具之外，个人感觉babel基于抽象语法树的插件机制，给我们提供了更多的可能。关于babel相关概念和插件文档，网上是有很多的，讲的挺不错的。详细的解析推荐官方的[babel插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-asts)。在开发插件之前，有些内容还是要了解一下的，已经熟悉的大佬们可以直接跳过。
<!-- more -->
## 抽象语法树（AST）

Babel 使用一个基于 ESTree 并修改过的 AST，它的内核说明文档可以在[这里](https://github. com/babel/babel/blob/master/doc/ast/spec. md)找到。
直接看实例应该更清晰：  

```js 
function square(n) {
  return n * n;
}
```
对应的AST对象(babel提供的对象格式)
```js
{
  //代码块类别，函数声明
  type: "FunctionDeclaration",
  //变量标识
  id: {
    type: "Identifier",
    //变量名称
    name: "square"
  },
  //参数
  params: [{
    type: "Identifier",
    name: "n"
  }],
  //函数体
  body: {
     //块语句
    type: "BlockStatement",
    body: [{
       //return 语句
      type: "ReturnStatement",
      argument: {
        //二元表达式
        type: "BinaryExpression",
        //操作符
        operator: "*",
        left: {
          type: "Identifier",
          name: "n"
        },
        right: {
          type: "Identifier",
          name: "n"
        }
      }
    }]
  }
}
```
大概就是上面这个层级关系，每一层都被称为节点（Node),一个完整AST对应的js对象可能会有很多节点，视具体情况而定。babel将每个节点都作为一个接口返回。其中包括的属性就如上面代码所示，例如type，start，end，loc等通用属性和具体type对应的私有属性。我们后面插件的处理也是根据不同的type来处理的。  
  
看到这个庞大的js对象，不要感到头疼，如果说让我们每次都自己去分析AST和按照babel的定义去记住不同类型，显然不现实。这种事情应该交给电脑来执行，我们可以利用[AST Explorer ](http://astexplorer.net/#/Z1exs6BWMq)来将目标代码转成语法树对象，结合[ AST node types](https://github.com/babel/babylon/blob/master/ast/spec.md#variabledeclarator)来查看具体属性。   

## Babel 的处理步骤
Babel 的三个主要处理步骤分别是： 解析（parse），转换（transform），生成（generate）,具体过程就不想详细描述了，直接看官方手册就好。  
需要注意的是，babel插件就是在转换过程中起作用的，即将解析完成的语法树对象按照自己的目的进行处理，然后再进行代码生成步骤。所以要深入了解转换相关的内容。  

代码生成步骤把最终（经过一系列转换之后）的 AST 转换成字符串形式的代码，同时还会创建源码映射（source maps），以便于调试。

代码生成的原理：深度优先遍历整个 AST，然后构建可以表示转换后代码的字符串。转换的时候是是进行递归的树形遍历。

## 转换 
### Visitor
转换的时候，是插件开始起作用的时候，但是如何进入到这个过程呢，babel给我们提供了一个Visitor的规范。我们可以通过Visitor来定义我们的访问逻辑。大概就是下面这个样子
```js
const MyVisitor = {
  //这里对应上面node的type，所有type为Identifier的节点都会进入该方法中
  Identifier() {
    console.log("Called!");
  }
};
//以该方法为例 
function square(n) {
  return n * n;
} 
//会调用四次，因为
//函数名square
//形参 n
//函数体中的两个n，都是Identifier
path.traverse(MyVisitor); 
//  所以输出四个
Called!
Called!
Called!
Called!
```
因为深度优先的遍历算法，到一个叶子节点之后，发现没有子孙节点，需要向上溯源才能回到上一级继续遍历下个子节点，所以每个节点都会被访问两次。  
如果不指定的话，调用都发生在进入节点时，当然也可以在退出时调用访问者方法。
```js   
const MyVisitor = {
  Identifier: {
    enter() {
      console.log("Entered!");
    },
    exit() {
      console.log("Exited!");
    }
  }
}; 
```
此外还有一些小技巧：  

可以在方法名用|来匹配多种不同的type，使用相同的处理函数。
```js
const MyVisitor = {
  "ExportNamedDeclaration|Flow"(path) {}
};
```
此外可以在访问者中使用别名(如babel-types定义)
例如Function是FunctionDeclaration，FunctionExpression，ArrowFunctionExpression，ObjectMethod和ObjectMethod的别名,可以用它来匹配上述所有类型的type  

```js  
const MyVisitor = {
  Function(path) {}
};
```
### Paths
AST 通常会有许多节点，那么节点直接如何相互关联呢？ 我们可以使用一个可操作和访问的巨大可变对象表示节点之间的关联关系，或者也可以用Paths（路径）来简化这件事情。Path 是表示两个节点之间连接的对象。直接看例子比较清晰一点。  

```js  

{
  type: "FunctionDeclaration",
  id: {
    type: "Identifier",
    name: "square"
  },
  ...
}


```

将子节点 Identifier 表示为一个路径（Path）的话，看起来是这样的：  

```js
{
  "parent": {
    "type": "FunctionDeclaration",
    "id": {...},
    ....
  },
  "node": {
    "type": "Identifier",
    "name": "square"
  }
}
```
当你通过一个 Identifier() 成员方法的访问者时，你实际上是在访问路径而非节点。 通过这种方式，你操作的就是节点的响应式表示（译注：即路径）而非节点本身。  

## 编写插件

前面都是些必备知识点，本文只是将一些相对重要一点的知识点提了一下。详细的还是要去看开发手册的。
个人而言开发插件的话应该有下面三个步骤：   
 
1. 分析源文件抽象语法树AST
2. 分析目标文件抽象语法树
3. 构建Visitor   
   3.1 确定访问条件  
   3.2 确定转换逻辑    
   
插件主要的就是3步骤，但是前两步是十分重要的。3.1和3.2分别依赖于1和2的结果。只有清晰了解AST结构之后，才能有的放矢，事半功倍。
举个例子，如下代码：    

```js 
var func = ()=>{
    console.log(this.b)
}; 
```
目的是将箭头函数转换成普通函数声明(这里仅仅是具体这种格式的转化，其他部分就先不涉及)。如下:  

```js  
var _this = this;
var func = function () {
    console.log(_this.b);
};
```

### 源文件语法树   
 
这里分析下这个简单的函数声明，按照上面定义分析，不过这里还是推荐[AST Explorer ](http://astexplorer.net/#/Z1exs6BWMq)可以清晰的看到我们的语法树。这里只截取有用信息：  

```js
        "init": {
              "type": "ArrowFunctionExpression",
              /*...其他信息....*/
              "id": null,
              //形参
              "params": [],
              "body": {
                //函数体,this部分
                "arguments": [
                        {
                          "type": "MemberExpression",
                          "object": {
                             //this 表达式
                            "type": "ThisExpression",
                          },
                          "property": {
                             //b属性
                            "type": "Identifier",
                            "name": "b"
                          }
                        }
                      ]
             }
        }
```
我们要转换的只是ArrowFunctionExpression即箭头函数和this表达式ThisExpression部分，其他暂时不动。  
那么我们的visitor里的函数名称就包括ArrowFunctionExpression和ThisExpression了。  
  
```js  
//visitor里面方法的key就对应我们要处理的node  type
const visitor = {
    //处理this表达式  
    ThisExpression(path){
        //将this转换成_this的形式
    },
    //处理箭头函数。
    ArrowFunctionExpression(path){
       //转换成普通的FunctionExpression
    }
}   
```
### 目标文件语法树   
  
同样的方法，语法树对象如下：  
语法树太长，我们就看一下变化的地方好了  
 
```js
    //转换之后的body由两个元素的数组，两个变量声明是统计关系
    "body": [
      //var _this = this;结构
      {
        "type": "VariableDeclaration",
        "kind": "var",
        "declarations": [
          {
            "type": "VariableDeclarator",
            //left为_this的标识
            "id": {
              "type": "Identifier",
              "name": "_this"
            },
            //right为this表达式
            "init": {
              "type": "ThisExpression"
              /***其他**/
            }
      },   
      // var func = function (b) {
      //      console.log(_this.b);
      //  };结构 只看关键的
      {
        "type": "VariableDeclaration",
        "kind": "var",
        "declarations": [
          {
            /*****省略*******/
            "arguments": [
                        {
                          "type": "MemberExpression",
                          //转换之后的_this.b
                          "object": {
                            "type": "Identifier",
                            "name": "_this"
                          },
                          "property": {
                            "type": "Identifier",
                            "name": "b"
                          }
                          ]
          }
      }
    ]
```
经过对比，确定我们的操作应该是将ArrowFunctionExpression替换为FunctionExpression，遇到有this表达式的，绑定一下this，并将其转换。 
进行替换增加等操作时就要用到path提供的api了：  
   
* replaceWith(targetObj) 替换  
* findParent() 查找满足条件的父节点  
* insertBefore 插入兄弟节点   
更多请查询文档，这里只列出我们用到的方法。
  
### 构造节点   
 
这里将这个操作单独拿出来，toFunctionExpression这个api的说明我始终没找到。。。。可能是我没找对地方[FunctionExpression](https://github.com/babel/babylon/blob/master/ast/spec.md#functiondeclaration)，没办法我去babel源码里找了一遍：    

```js
//@src  /babel/packages/babel-types/src/definitions/core.js
defineType("FunctionExpression", {
  inherits: "FunctionDeclaration",
  //....
}
//又找到 FunctionDeclaration
defineType("FunctionDeclaration", {
  //这里才看到参数: id,params,body..
  builder: ["id", "params", "body", "generator", "async"],
  visitor: ["id", "params", "body", "returnType", "typeParameters"]
  //....  
}

```
这样的话才知道入参，如果有清晰的文档，请大家不吝赐教。下面就简单了。
### 后来又专门找了一下，终于找到对应文档了[传送门](https://babeljs.io/docs/core-packages/babel-types/)  
   
### 完善Visitor
 
```js  
const Visitor = {
    //this表达式
    ThisExpression(path){
        //构建var _this = this
        let node = t.VariableDeclaration(
            'var',
            [
                t.VariableDeclarator(
                    t.Identifier('_this'),
                    t.Identifier('this')
                )
            ]
        ),
        //构建 _this标识符
        str = t.Identifier('_this'),
        //查找变量声明的父节点
        //这里只是针对例子的，真正转换需要考虑的情况很多
        parentPath = path.findParent((path) => path.isVariableDeclaration())
        //满足条件
        if(parentPath){
            //插入
            parentPath.insertBefore(node)
            path.replaceWith(
                str
            )
        }else{
            return
        }
    },
    //处理箭头函数。
    ArrowFunctionExpression(path){
        var node = path.node
        //构造一个t.FunctionExpression节点，将原有path替换掉即可
        path.replaceWith(t.FunctionExpression(
            node.id,
            node.params,
            node.body
          ))
    }
}     
```    

主体visitor至此算结束了，当然如果是插件的话   
 
```js   
//babel调用插件时会将babel-types作为参数传入 
export default function({ types: t }) {
  return {
    visitor:Visitor
  }
```  
在本地调试的话，可以分别引入babel-core和babel-types  

```js
var babel = require('babel-core');
var t = require('babel-types');
var code = `var func = ()=>{
    console.log(this.b)
  };`
const result = babel.transform(code, {
	plugins: [{
	  //前面的Visitor
		visitor: Visitor
	}]
});  
//输出转换之后的code
/**
 * var _this = this;
 * var func = function () {
 * console.log(_this.b);
 * }; 
 */
console.log(result.code);  
```     

### 更新说明
对于构造新的语法内容时，除了上面使用t.VariableDeclaration这种费劲的表达式之外可以借助babel-template实现。
用法参考
```js
const buildRequire = template(`
  var IMPORT_NAME = require(SOURCE);
`);

const ast = buildRequire({
  IMPORT_NAME: t.identifier("myModule"),
  SOURCE: t.stringLiteral("my-module"),
});
```
新版本可 使用replaceWithSourceString

```js
FunctionDeclaration(path) {
  path.replaceWithSourceString(`function add(a, b) {
    return a + b;
  }`);
}
```

## 结束语  
### 参考文章   
[Babel 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-replacing-a-node)   
[Babel for ES6? And Beyond!](https://www.h5jun.com/post/babel-for-es6-and-beyond.html)   

纸上得来终觉浅，原本也认为已经理解了babel的原理和插件机制，没想到连写个小demo都这么费劲。主要还是对相关api不熟悉，不知道如何去构建节点，熟练之后应该会好很多。此文是插件手册的一个简单总结，把自己实现的思路汇总了一下。抛砖引玉，共同进步，另外希望对有需要的同学略有帮助。[原文详见](https://github.com/xiaoxiangdaiyu/blog)




