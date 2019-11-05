---
title: 回顾数据结构体系
date: 2019-11-15
---

## 前言 
作为前端，随着职业的发展，自然会进阶到需要使用算法和数据结构的地步，例如开发相应的工具，或者需要考虑性能的特殊场景。另外就是作为程序员的基本要素，还是需要拾起这部分内容的。  

<!-- more -->

## 基本数据结构  

### 链表
用一组任意存储的单元来存储线性表的数据元素。一个对象存储着本身的值和下一个元素的地址。  就不适用太官方的话语了。  
通过节点指向下一个元素的数据结构，虽然是线性，但物理结构上并不体现该顺序，关联关系通过节点元素维护。  
所以缺点和优点都比较明显：  
    
    * 缺点： 遍历时相比于数组等物理线性，速度较慢
    * 优点：正是物理地址不相连，插入删除都比较灵活，直接改变指向就行了。  

链表在开发中也是经常用到的数据结构，React16的 Fiber Node连接起来形成的Fiber Tree, 就是个单链表结构。  

节点特点：
两个值，value和link 

列表功能：
1、查找
2、删除
3、移动
4、插入

#### 实现链表结构

```js
// 节点，维护两个值，一是当前值，另外就是其他位置
function Node(element) {
    this.element = element;   //当前节点的元素
    this.next = null;         //下一个节点链接
}

// 链表
function LList () {
    this.head = new Node( 'head' );     //头节点
    this.find = find;                   //查找节点
    this.insert = insert;               //插入节点
    this.remove = remove;               //删除节点
    this.findPrev = findPrev;           //查找前一个节点
    this.display = display;             //显示链表
} 
```

常见题目也是实现功能：
#### 查找所有节点，并列出当前值
实现思路就是


