---
title: 带着问题看redux源码
date: 2019-05-21
---

## 前言
作为前端状态管理器，这个比较跨时代的工具库redux有很多实现和思想值得我们思考。在深入源码之前，我们可以相关注下一些常见问题，这样带着问题去看实现，也能更加清晰的了解。  
<!-- more -->
### 常见问题
大概看了下主要有这么几个：  

1. redux三大原则  
   这个可以直接参考[官方文档](http://cn.redux.js.org/docs/introduction/ThreePrinciples.html)
2. redux 的优缺点。 关于优缺点，太主观了大家见仁见智。
3. redux中间件相关，洋葱模型是什么，常见中间件。


### 背景
有关acton，reducer相关的部分可以看[我前面的文章](https://juejin.im/post/5b208ef06fb9a01e615ed8cb)。我们主要关注针对store和中间件相关的部分来解读。

## store的创建
作为维护和管理数据的部分，store在redux中的作用十分重要。在action发出指令，reduxer进行数据更新之后，监听数据变化和同步数据更新的操作都要借助store来实现。  

### createStore 输入和输出
首先看下createStore的使用,即常见的就是接受经过[combineReducers处理之后的reducer](https://juejin.im/post/5b208ef06fb9a01e615ed8cb#heading-8)和初始的state

```js
import reducer from './reducers'
const store = createStore(reducer,initialState)
```
此外还可以接受第三个参数enhancer(增强器,一般就是applyMiddleware)

```js

/**
 * 创建管理state 树的Redux store
 * 应用中只能存在一个store，为了区分不同action对应的reducer，
 * 可以通过combineReducers来关联不同的reducer
 * @param {Function} reducer   combineReducers关联之后的reducer
 * @param {Object} preloadedState 初始state
 * @param {Function} enhancer 可以增强store功能的函数，例如中间件等。唯一适合
 * @returns 返回一个Store 以维护state和监听变化  
 */
export default function createStore(reducer, preloadedState, enhancer) {
  // 如果第二个参数为func，redux认为忽略了初始state，而是
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    // enhancer增强剂，即利用中间件等来增强redux能力
    enhancer = preloadedState
    preloadedState = undefined
  }
  // 返回具有dispatch等属性的对象 即store
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
 } 
```
按照一般的执行顺序，我们先看下对于参数的处理(平时大家也是一样，一个函数，执行之前尽量判断入参是否符合预期，避免直接处理造成的错误)
### 入参处理
对于三个参数，后两个是非必填的，但如果第二个参数是function，reduxe认为其实encher，不然初始状态是个函数不符合redux的预期，只能这样处理了。   

```js
// 如果第二个参数为func，redux认为忽略了初始state，而是
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    // enhancer增强剂，即利用中间件等来增强redux能力
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    // 对于存在的enhancer,高阶函数函数的用法，
    // 接受createStore返回一个增加功能之后的函数，然后再传入相关reducer得到store。
    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  // 一切符合预期，没有 enhancer，那么初始赋值
  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  // 监听队列
  let nextListeners = currentListeners
  // dispatch标识
  let isDispatching = false
  
  // 初始状态更新之后，声明init状态完成。
  dispatch({ type: ActionTypes.INIT })

```


### dispatch的实现
dispatch的作用就是根据action，执行对应reducer以更新state。并执行监听队列。  
下面就来看dispatch的用法和实现。
常见使用：
```js
// redux要求 参数必须为纯对象
dispatch({ type: ActionTypes.INIT })
```
那么对于纯对象，redux做了些什么呢  

```js
 /**
   * 通知方法，参数为纯的js对象，标明更新内容
   * @param {Object} action 
   */
  function dispatch(action) {
    // 是否满足纯净对象
    if (!isPlainObject(action)) {
      throw new Error(
        '省略'
      )
    }
    // 必须的type是否存在 
    if (typeof action.type === 'undefined') {
      throw new Error(
        '省略'
      )
    }
    // 判断是否处于某个action的dispatch中，大家一起dispatch可能死循环
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      // 开始dispatch，加锁，标明状态
      isDispatching = true
      // 将当前状态和更新action，传给当前reducer处理
      // 这里可以回想下我们reducer中的两个参数，state和action 对应的是什么
      /**
       * const todos = (state = [], action) => {
       */
      currentState = currentReducer(currentState, action)
    } finally {
      // 有异常，锁置为false，不影响别的dispatch
      isDispatching = false
    }
    // 执行dispatch，并且更新当前监听队列为 最新队列
    const listeners = (currentListeners = nextListeners)
    // 依次执行，监听器
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }
```

createStore初始化完成之后会执行dispatch({ type: ActionTypes.INIT })，此时执行初始化操作。

我们要关注下currentState的计算，  
将currentState，action传给reducer处理，然后更新currentState。

针对初始化来说currentState其实就是initState：  

```js
// 初始化状态
let currentState = preloadedState
/****省略***/
// 这里可以回想下我们reducer中的两个参数，state和action对应的值
currentState = currentReducer(currentState, action)
``` 

reducer示例：

```js
const todos = (state = [], action) => {
switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ]
    }
```

### getSate实现  
getState就是获得store的state。这个比较简单。当结合react-redux使用时，其会帮我们进行操作。我们就不用自行调用这个方法了，所以不要疑惑从哪里获取的state。  

```js
/**
   * 返回应用当前状态
   * 不过需要看下当前是否有更新正在进行，是的话则提示
   */
  function getState() {
    // 判断是否isDispatching 中
    if (isDispatching) {
      throw new Error('省略')
    }
    return currentState
  }
```

### subscribe
subscribe是比较重要的一个方法，用来供我们监听状态的变化，以执行相关操作。  
例如react-redux中的handleChange 会对是否pure组件及state进行对比，以提升渲染效率。   

**示例：**

```js
 this.unsubscribe = this.store.subscribe(this.handleChange.bind(this))
```

**实现：**
返回的是一个函数，可以进行unsubscribe操作。

```js
/** 
   * 订阅通知
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }

    if (isDispatching) {
      throw new Error(
        '省略'
      )
    }
    // 是否已经监听过
    let isSubscribed = true
    // 监听队列是否相同，区分开，操作nextListeners
    ensureCanMutateNextListeners()
    // 新增监听事件
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          '省略'
        )
      }
      // 注册完成，可以进行取消操作
      isSubscribed = false
      // 保持事件队列 同步
      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      // 删除监听事件
      nextListeners.splice(index, 1)
    }
  }

```

### replaceReducer
这个开发比较少用，用于热更新

```js
// 用于reducer的热替换，开发中一般不会直接使用
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    // 更新值之后，进行dispatch。
    dispatch({ type: ActionTypes.REPLACE })
  }
```
 到这里createStore已经解析完成了，大家应该了解该方法到底做了些什么操作吧。  
 简单概括一下就是：接收reducer和initState，返回一个store 对象。该对象提供了监听、分发等功能，以实现数据的更新。

## 实际使用中的问题
经过上面的解读之后,对于redux的常规应用应该有所了解了。不过实际使用中可能会遇到些问题。  
例如action要求是纯对象，而我们获取数据一般是异步的，这就需要借助redux-thunk这个中间件了。  
actionCreater返回一个函数。如下：  

```js
export function func1() {
  return dispatch => {
      dispatch({
      type:'test',
      data:'a'
      })
  }
}
```

在了解如何实现之前，需要先看下redux中间件的原理。
因为reducer更多的关注的是数据的操作，对于一些公共的方法，需要抽离出来，不过这些方法在何时使用呢，redux为我们提供了中间件来满足需求。
  

## redux中间件原理
redux 借鉴了 Koa里 middleware 的思想，即鼎鼎大名的洋葱模型。
<img src='/img/redux/middleware.jpg'/>

不过这里请求对应的是dispatch的过程。  

每次dispatch的过程中，都要依次将中间件执行一遍。  
遇到阻塞或者操作完成，执行下个中间件，直到执行完成，以便我们事先日志，监控、异常上报等功能。  
那么redux 又是如何支持中间件的呢。这就离不开applyMiddleware了。  
这里前面的
 
### applyMiddleware实现思路

实现思想比较简单,通过科里化和compose，为符合规范的中间件分配访问dispatch和store的途径，以便在不同阶段来自定义数据更新。  
例如异步操作，返回的不是对象，那么就执行返回的函数，然后调用下一个中间件。等异步请求结束，再次dispatch 对应的action。   

```js
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }
    // 赋予每个中间件访问store的能力。
    const middlewareAPI = {
      getState: store.getState,
      // 箭头函数保存dispatch，保证其的同步更新
      dispatch: (...args) => dispatch(...args)
    }
    // 串联中间件，并赋予每个中间件访问dispatch的能力。
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    // 关联dispatch与中间件，组合调用之后得到类似下面的新对象
    // dispatch = f1(f2(f3(store.dispatch))));
    dispatch = compose(...chain)(store.dispatch)
    

    return {
      ...store,
      dispatch
    }
  }
}
```

这样执行之后返回的，对象就是增强之后的store了。
### compose的实现
redux中compose是柯里化函数的一个示例，目的是将函数串联起来。 
 
```js
/**
 * 函数组合，科里化的串联
 */
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```


### 结合redux-thunk示例  
redux-thunk源码，实现也很优雅，对于返回的function，将dispatch等参数传递进去，然后执行，等待回调异步完成再dispatch。对于正常对象则进行下一步。

```js
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    // 每次dispatch的时候都会进行判断，如果是个函数，那就执行函数，不再进行下一步吧，这样就避免了，函数不满足action要求的问题
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```
那么实际使用时,在createStore时加入该中间件即可：  

```js
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
const store = createStore(
  reducer,
  applyMiddleware({
  ...middleware,
  thunk})
)
```

那么到这里对于redux的中间件 也就是问题2，我想大家也比较清楚了。  
对于常见中间件可以参考

## 结束语
### 参考文章  
[redux中文文档](http://cn.redux.js.org/docs/recipes/ServerRendering.html)   
[深入React技术栈](http://product.dangdang.com/24135483.html)  

加上[重读redux源码一](https://juejin.im/post/5b208ef06fb9a01e615ed8cb#heading-8)和[带着问题看 react-redux 源码实现](https://juejin.im/post/5ce25a76e51d4510835e01f3)总算将redux及react-redux重读了一遍。可能有人会说道这些源码，看完也会忘，有这个必要吗。我感觉分情况来看，如果我们只是使用，那么看官方文档就可以了，当遇到某些疑问好像找不到贴切解释的时候，不放一看。  
此外也是学习大佬们的设计思路和实现方式，有的放矢才能开卷有益。  









