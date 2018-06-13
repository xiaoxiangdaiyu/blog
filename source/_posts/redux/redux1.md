---
title: 重读redux(一)
date: 2018-06-13
---

## 前言  
对于react技术栈的前端同学来说，redux应该是相对熟悉的。其代码之精简和设计之巧妙，一直为大家所推崇。此外redux的注释简直完美，阅读起来比较省事。原本也是强行读了通源码，现在也忘得差不多了。因为最近打算对redux进行些操作，所以又开始重读了redux，收益匪浅。
<!--more-->
关于redux的基本概念，这里就不再详细描述了。可以参考[Redux 中文文档](http://www.redux.org.cn/)。
## 阅读源码感受  
有很多大牛已经提供了很多阅读经验。   
个人感觉一开始就强行读源码是不可取的，就像我当初读的第一遍redux，只能说食之无味，现在全忘了。   
 
应该是对其基础用法比较熟练之后，有问题或者有兴趣时再读比较好，结合文档或者实例，完整的流程走一走。   
  
此外直接源码仓库clone下来，本地跑一跑，实在看不懂的断点跟进去。  
   
对于不理解的地方，可能是某些方法不太熟悉，这时候多去找找其具体用法和目的   
 
实在不明白的可以结合网上已有的源码实例，和别人的思路对比一下，看自己哪里理解有偏差。     

一句话，希望读过之后对自己有启发，更深入的理解和学习，而非只是说起来读过而已。

redux 提供了如下方法：  

```js  
export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose
}
```
下面的文章就是按照Redux 中文文档例子的顺序，来分别看下各方法的实现。  

## action和actionCreater  
### 定义和概念
action 本质上是 JavaScript 普通对象 
在 Redux 中的 actionCreater就是生成 action 的方法
```js  
//addTodo 就是actionCreater
function addTodo(text) {
  //return的对象即为action
  return {
    type: ADD_TODO,
    text
  }
}
```
在 传统的 Flux 实现中，当调用 action 创建函数时  
一般会触发一个 dispatch  
Redux 中只需把 action 创建函数的结果传给 dispatch() 方法即可发起一次 dispatch 过程。
```js
dispatch(addTodo(text))
//或者 
const boundAddTodo = text => dispatch(addTodo(text))
```
当然实际使用的时候，一般情况下（这里指的是简单的同步actionCreater）我们不需要每次都手动dispatch，  
react-redux 提供的 connect() 会帮我们来做这个事情。  
  
里面通过bindActionCreators() 可以自动把多个 action 创建函数 绑定到 dispatch() 方法上。    

这里先不涉及connect，我们一起看看bindActionCreators如何实现的。  

在看之前，我们可以大胆的猜一下，如果是我们要提供一个warper，将两个方法绑定在一起会怎么做：  
 
```js  
function a (){
   /*.....*/  
};
function b(f){
  /*.....*/ 
  return f()
}
```    
b里面调用a（先不考虑其他），通过一个c来绑定一下

```js
function c(){
    return ()=> b(a)
}
```
应该就是这么个样子，那么看一下具体实现
## bindActionCreators()    
先看源码：  

```js
// 绑定单个actionCreator
function bindActionCreator(actionCreator, dispatch) {
  //将方法dispatch中，避免了action创建手动调用。
  return (...args) => dispatch(actionCreator(...args))
}
export default function bindActionCreators(actionCreators, dispatch) {
   // function 说明是单个的actionCreator 直接调用bindActionCreator
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }
   // 校验，否则抛错
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(`错误提示`)
  }
  //获取keys数组，以便遍历
  var keys = Object.keys(actionCreators)
  var boundActionCreators = {}
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var actionCreator = actionCreators[key]
    //依次进行校验绑定操作
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  //返回
  return boundActionCreators
}
```
该方法分为两部分
#### 首先是 bindActionCreator   
对单个ActionCreator方法封装  

```js
   function bindActionCreator(actionCreator, dispatch) {
  //将方法dispatch中，避免了action创建手动调用。
  return (...args) => dispatch(actionCreator(...args))
  } 
```
bindActionCreators的actionCreators期望是个对象,即actionCreator，  
 可以想到下面肯定是对该对象进行属性遍历，依次调用bindActionCreator    
 
#### 下面bindActionCreators的动作就是处理该对象  

* typeof actionCreators === 'function'  
  单独的方法，直接调用 bindActionCreator结束  
* 如果不是对象或者为null，那么抛错
* 对于对象，根据key进行遍历，获取包装之后的 boundActionCreators 然后返回   

```js  
  // function 说明是单个的actionCreator 直接调用bindActionCreator
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }
   // 校验，否则抛错
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(`错误提示`)
  }
  //获取keys数组，以便遍历
  var keys = Object.keys(actionCreators)
  var boundActionCreators = {}
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var actionCreator = actionCreators[key]
    //依次进行校验绑定操作
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }  
```
这样我们获得了绑定之后的 actionCreators，无需手动调用dispatch（同步的简单情况下）    


   
## reducer  
action 只是描述了有事发生及提供源数据，具体如何做就需要reducer来处理（详细介绍就略过了）。  
在 Redux 应用中，所有的 state 都被保存在一个单一对象中  

当reducer处理多个atcion时，显得比较冗长，需要拆分，如下这样：  
  
```js  
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      })
    case ADD_TODO:
      return Object.assign({}, state, {
        todos: [
          ...state.todos,
          {
            text: action.text,
            completed: false
          }
        ]
      })
    case TOGGLE_TODO:
      return Object.assign({}, state, {
        todos: state.todos.map((todo, index) => {
          if (index === action.index) {
            return Object.assign({}, todo, {
              completed: !todo.completed
            })
          }
          return todo
        })
      })
    default:
      return state
  }
}  
```
需要拆分的时候，每个reducer只处理相关部分的state相比于全部state应该更好，
例如:

```js
//reducer1 中 
 function reducer1(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return state.reducer1.a 
      //相比较state只是state.reducer1，显然好一点
      return state.a
 }
```

每个 reducer 只负责管理全局 state 中它负责的一部分。  
每个 reducer 的 state 参数都不同，分别对应它管理的那部分 state 数据  

这样需要在主函数里，分别对子reducer的入参进行管理，可以如下面这样：  

```js
function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```
当然redux提供了combineReducers()方法

```js
import { combineReducers } from 'redux'

const todoApp = combineReducers({
  visibilityFilter,
  todos
})
```
那么我们来看下combineReducers是如何来实现的 

## combineReducers    
  
还是把完整的代码放上来  

```js 
export default function combineReducers(reducers) {
  // 获取reducer的key 不作处理的话是子reducer的方法名
  var reducerKeys = Object.keys(reducers)

  var finalReducers = {}
  // 遍历 构造finalReducers即总的reducer
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i]
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  var finalReducerKeys = Object.keys(finalReducers)

  var sanityError
  try {
    // 规范校验
    assertReducerSanity(finalReducers)
  } catch (e) {
    sanityError = e
  }

  return function combination(state = {}, action) {
    if (sanityError) {
      throw sanityError
    }
    // 警报信息 
    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action)
      if (warningMessage) {
        warning(warningMessage)
      }
    }
    /**
     * 当有action改变时，
     * 遍历finalReducers，执行reducer并赋值给nextState，
     * 通过对应key的state是否改变决定返回当前或者nextState
     * */
    // state改变与否的flag 
    var hasChanged = false
    var nextState = {}
    // 依次处理
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i]
      var reducer = finalReducers[key]
      // 获取对应key的state属性
      var previousStateForKey = state[key]
      // 目的之一，只处理对应key数据
      var nextStateForKey = reducer(previousStateForKey, action)
      // 不能返回undefined，否则抛错
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      // 新状态赋给 nextState对象
      nextState[key] = nextStateForKey
      // 是否改变处理 
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // 视情况返回state
    return hasChanged ? nextState : state
  }
}
```
#### 入参  
首先看一下入参：reducers    
 
* 即需要合并处理的子reducer对象集合。
* 可以通过import * as reducers来获取 
* tips：  
reducer应该对default情况也进行处理， 当state是undefined或者未定义的action时，也不能返回undefined。
返回的是一个总reducer，可以调用每个传入方法，并且分别传入相应的state属性。  
#### 遍历reducers 
既然是个对象集合，肯定要遍历对象，所以前几步就是这么个操作。
  
```js
// 获取reducer key  目的在于每个子方法处理对应key的state
  var reducerKeys = Object.keys(reducers)

  var finalReducers = {}
  // 遍历 构造finalReducers即总的reducer
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i]
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
//获取finalReducers 供下面遍历调用  
var finalReducerKeys = Object.keys(finalReducers)
```
然后是规范校验，作为一个框架这是必须的，可以略过  
#### combination  
返回一个function  
* 当action被dispatch进来时，该方法主要是分发不同state到对应reducer处理，并返回最新state  
  
* 先是标识变量：
```js  
    // state改变与否的flag 
    var hasChanged = false
    var nextState = {}  
```
* 进行遍历finalReducers
   保存原来的previousStateForKey  
   
* 然后分发对应属性给相应reducer进行处理获取nextStateForKey  
   
  先对nextStateForKey 做个校验，因为reducer要求做兼容的，所以不允许undefined的出现，出现就抛错。    
  
  正常的话就nextStateForKey把赋给nextState对应的key  

* 前后两个state做个比较看是否相等，相等的话hasChanged置为true 
遍历结束之后就获得了一个新的state即nextState

```js  
for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i]
      var reducer = finalReducers[key]
      // 获取对应key的state属性
      var previousStateForKey = state[key]
      // 目的之一，只处理对应key数据
      var nextStateForKey = reducer(previousStateForKey, action)
      // 不能返回undefined，否则抛错
      if (typeof nextStateForKey === 'undefined') {
         //.....
      }
      // 新状态赋给 nextState对象
      nextState[key] = nextStateForKey
      // 是否改变处理 
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
```
根据hasChanged来决定返回新旧state。 
 
```js
// 视情况返回state
    return hasChanged ? nextState : state
```    
到这里combineReducers就结束了。
## 结束语  
这次先分享一半，还是有点多的，剩下的下次再记录一下。抛砖引玉，提升自己，共同学习吧。[更多请移步博客](https://github.com/xiaoxiangdaiyu/blog)
#### 参考文章  
[Redux 中文文档](http://www.redux.org.cn/)





