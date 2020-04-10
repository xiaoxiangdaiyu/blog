---
title: 算法基础时间复杂度
date: 
---

## 为什么引入复杂度分析
避免不同机器环境和样本数据带来的偏差。

## 如何标识复杂度
复杂度即程序运算的资源消耗，分为两类：一是时间消耗，二是空间消耗

以每一段代码作为一个执行单元时间，其实无论语句长短，对于cpu来说差距都不大，所以可以看成1unit_time。 自然下面的总计也就是(2n+2)*unit_time，n足够大时，常数可

```js
function cal(n) {
    let sum = 0; // 1 unit_time
    let i = 0; // 1 unit_time
    for(; i <= n; i++) { // n unit_time
        sum += i; // n unit_time
    }
    return sum
}
```


