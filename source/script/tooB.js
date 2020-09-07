/**
 * 实现一个单例 
 * es5
 * es6
 * */ 
// 单例的时候调用当然不能通过new来进行了， 只能通过getInstance的方法
function singleton(){
    // 初始为null 
    this.instance = null
    // 不管怎么变都是1 
    this.name = 1 
}
singleton.getInstance = function(){
    if(!this.instance){
        this.instance = new singleton()
        return this.instance
    }
    return this.instance
}
singleton.prototype.addName = function(){
    this.name++ 
}
class singleton{
    constructor(){
        this.instance = null
        this.name = 1
    }
    static getInstance(){
        if(!this.instance){
            this.instance = new singleton()
            return this.instance
        }
        return this.instance
    }
    addName(){
        this.name++
    }
}
function CreateSingleton(){
    this.name = 1
}
CreateSingleton.prototype.addName = function () {
    this.name++
}
// 上面的安全性和隔离性做的都不够，显然直接通过new 的话也没办法限制了，这种题天然是为闭包准备的
var singleton = (function(){
    // 创建变量
    var instance = null
    return function(){
        // new 的时候判断就行了
        if(!instance){
           instance =  new CreateSingleton()
        }
        return instance
    }
   
})()
// test
var item1 = new singleton()
item1.addName()
var item2 = new singleton()
console.log(item2.name)

// 二维数组查找
/** 
 * 在一个二维数组中（每个一维数组的长度相同），每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。请完成一个函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。
例如：下面的二维数组就是每行、每列都递增排序。如果在这个数组中查找数字7，则返回true；如果查找数字5，由于数组不含有该数字，则返回false。
*/
function checkInArray(arr,num){
    // 数组判空
    var rowLength = arr.length || 0
    var colLength = arr[0].length || 0
    console.log('rowLength', rowLength)
    if(!rowLength || !colLength){
        return false
    }
    // 行数
    var rows = 0
    // 列数
    var cols = colLength - 1
    // 循环查找
    while(rows<rowLength && cols>=0){
        var temp_val = arr[rows][cols]
        if(temp_val == num){
            return true
        }
        // 小于目标值，行数+1
        if(temp_val < num){
            rows++
        }else{
            // 大于目标值，列数-1
            cols--
        }
    }
    return false
}

// 替换空格

function replaceSpace(str){
    return str.replace(/\s/g,'%2')
}
function replaceSpace(str) {
    return str.split(' ').join('%2')
}
// 其实可以体现的算法是，复制移动的高效， 相比于从头开始移动，后面的元素重复移动，
// 要优化这一部分效率就是从后开始移动，两个指针，分别对应新旧两个数组，遇到空格，走的情况不一致即可。
function replaceSpace(str) {
    // 空格总数
    var spaceCount = 0
    console.log(spaceCount)
    for(var i=0;i<str.length;i++){
        var it = str[i]
        if (it == ' ') {
            spaceCount++
        }
    }
    var newArr = []
    var oldTag = str.length-1
    var newTag = oldTag + spaceCount
    console.log(newTag)
    for(var i = oldTag;i>=0;i--){
        var it = str[i]
        // 空格，计数器分别改变
        // 使用unshift就取巧了，不用考虑位置了。
        /* if(it == ' '){
            
            // newArr.unshift('%2') 
        }else{
            newArr.unshift(it) 
        } */
        if (it == ' ') {
            newArr[newTag] = '2'
            newArr[newTag-1] = '&'
            newTag = newTag -2
            // newArr.unshift('%2') 
        } else {
            newArr[newTag] = it
            newTag--
        } 
    }
    return newArr.join('')
}
replaceSpace('we are the world')


function inOrdeArrs(arr1,arr2){
    var len1  = arr1.length
    var len2 = arr2.length
    var total = len1+len2-1
    var arr = []
    for(var i = total;i>=0;i--){
        var it1 = arr1[len1-1]
        var it2 = arr2[len2-1]
        if(it1>it2){
            arr[i] = it1
            len1--
        }else{
            arr[i] = it2
            len2--
        }
    }
    console.log(arr)
}
inOrdeArrs([2,4,8],[1,5,9])



// 遍历链表肯定是顺序的倒序输出就是后进先出，这就是栈了。
// js数组可以快速实现栈，即shift
function reverseListNode(head){
    console.log('in')
    var stack = []
    while(head){
        var val = head.val
        stack.push(val)
        head = head.next
    }
    // 遍历结束，倒序打印
    while(stack.length){
        console.log(stack.pop())
    }
}
var head = {
    val:2,
    next:head2
}
var head2 = {
    val: 1,
    next: null
}
reverseListNode(head)


// 重构二叉树，根据先序遍历和中序遍历的结果，可以推断出
/* 输入某二叉树的前序遍历和中序遍历的结果，请重建出该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字。
 * 例如输入前序遍历序列{1,2,4,7,3,5,6,8}和中序遍历序列{4,7,2,1,5,3,8,6}，则重建二叉树并返回。
 */
// 思路根据前序遍历可以确定根节点，根据这个根节点可以判断中序里面左右子树，这样使用分治，分别对左右子树求解，直到最后即可。

function getTree(pre, mid) {
    var prelength = pre.lengt
    //数组为空，说明已经到最后,直接返回null
    if (!pre.length || !mid.length) {
        return null
    }
    // 先序根节点是明确的
    var head = pre[0]
    // 获取跟节点的位置
    var index = head.indexOf(mid)
    // 左右节点拆分
    var leftMid = mid.slice(0, index)
    var rightMid = mid.slice(index + 1)
    var leftPre = pre.slice(1, index)
    var rightPre = pre.slice(lindex + 1)
    var treeNode = {
        val: head,
        left: getTree(leftPre, leftMid+1),
        right: getTree(rightPre, rightMid)
    }
    return treeNode
}


/**
 * 两个栈实现队列
 * 先进后出的特性，变更为先进先出，
 * 常规思路既然只能先进后出的取，还是有序的，那么对外暴露之前，
 * 在另一个栈肯定是用来适配的，按顺序出栈到另一个栈，那么其顺序就是符合要求的
 * 也就是一个栈存另一个栈出，假如有其他情况
 * */ 

var queue = {
    stack1:[],
    stack2: [],
    add:function (it){
        this.stack1.push(it)
    },
    delete:function(){
        var {stack1,stack2} = this
        // stack2 就是出队列的备份，出就从这里，假如没有从stack1那里调出
        if(stack2.length){
            return stack2.pop()
        }else{
            while(stack1.length){
                var it = stack1.pop()
                stack2.push(it)
            }
            return stack2.pop()
        }
    }
 }

queue.add(1)
queue.add(2)
queue.add(3)
queue.delete()


/**
 * 两个队列实现栈，上面给了思路，利用空间来对外操作
 * 每次队列出列的都是队首，那么两个队列，另一个就用来存出队的元素
 * 这样的话就是那里有值push进哪里，出栈的时候遍历有值的，另一个纯空间
 */
function stack(){
    console.log('in this')
    this.queue1 = []
    this.queue2 = []
}
stack.prototype.add = function(it){
    var {queue1,queue2} = this
    // 元素只加入有值的队列，取值的时候统一操作
    if(!queue2.length){
        queue1.push(it)
    }else if(!queue1.length){
        queue2.push(it)
    }
}
stack.prototype.delete = function(){
    
    var {queue1,queue2} = this
    if(queue1.length){
        while(queue1.length > 1){
            var it = queue1.shift()
            console.log(it)
            queue2.push(it)
        }
        console.log(queue1)
        // 最后一个即为出栈元素
        return queue1.shift()
    }else{
        while (queue2.length >1) {
            var it = queue2.shift()
            queue1.push(it)
        }
        // 最后一个即为出栈元素
        return queue2.shift() 
    }
}
var stack1 = new stack()
stack1.add(1)
stack1.add(2)
stack1.delete()


// 快速排序
// 所谓快速就是以标杆对比，其左右均为小于或大于其的数值，然后再二分处理

function position(arr,start,end){
    if(start >= end){
        return arr
    }
    // 保证还有排序空间
    if(end > start){

        var tag = arr[start]
        var i = left
        var j = right
        
        // 两者不相等
        while(i<j){
            while (i <j && arr[j]<tag){
                j--
            }
            while (i <j && arr[i]>tag ){
                i++
            }
            // 遇到不符合情况，两者交换
            if(i<j){
                var temp = arr[i]
                arr[i] = arr[j]
                arr[j] = temp
            }
        }
        // 找当前下标即为i，将该位置置为base，脱离排列
        arr[left] = arr[i]
        arr[i] = tag
        // 交换完成后，左右分治
        position(arr,left,i-1)
        position()
        return arr
    }
}


/**
 * 旋转数组的特点在于可以分为两个有序数组，因此可以二分查找
 * 逐步缩小范围直到符合目标内容
 */
function getMinMum(arr){
    var len = arr.length
    // 数组为空
    if(!len){
        return null
    }
    var left =0 
    var right = len-1
    if(arr[left]<arr[right]){
        return arr[left]
    }
    while(left < right-1){
        var mid = left+Math.floor((right-left) / 2)
        var midVal = arr[mid]
        // 大于末尾值，说明反转在右边
        if (midVal >= arr[right]) {
            left = mid
        }else if(midVal<arr[left]){
            console.log('in ', midVal)
            right = mid
        }
    }
    return arr[right]
}
getMinMum([5, 6, 1, 2, 3, 4])
/**
 * 斐波那契存在效率和质量问题 
 * */
function Faboncci(num){
    if(num == 0 || num ==1 ){
        return 1
    }
    return Faboncci(num-2)+Faboncci(num-1)
}
/** 
 * 优化的话就是重复计算的部分不再计算
 * 例如f(7)的时候，f(5) f(6)完全不用计算，使用一个变量保存起来。
 * 例如 totals = {0:1}直接遍历即可。
 * totals[num] || totals[num-2+ totals[num-1] 
*/
function f() {
    var totals = { 0: 1, 1: 1 }
    return function (num) {
        if (!totals[num]) {
            console.log()
            val = totals[num - 2] + totals[num - 1]
            totals[num] = val
        }
        return totals[num]
    }
}
var F = (function(num){
    var totals = { 0: 1, 1: 1 }
    return function (num) {
        if (!totals[num]) {
            var f0 = 1
            var f2 = 1
            var fn = 0
            for(var i = 2;i<=num;i++){
                fn = f0+f2
                f0 = f2
                f2=fn
            }
            totals[num] = fn
        }
        return totals[num]
    }

})();
F(2)


/**
 * 二进制中1的个数，一般遇到查找1或者0的个数这种，就往位运算去想吧。
 * 与，或，与或，最常见了。 &,|,
 * 这个就是利用了，1&0 = 0 1&1=1的特性。使用001 判断最低位，然后依次左移，判断上一位
 * 直到32位，即这个数不存在。
 *  优化的做法就是，不固定与1，2进行与，二是与n-1 进行对比，这样
 * 110 & 101 = 100，说明前面还有1，那就再进行一次： 直到没有1了：
 *  100&011 = 0  ，说明只有两个1 
 */
function numberOf1(num){
    // 每一位进行对比，直到32位比完
    var i = 0
    var tag = 1
    while(tag){
        if(tag & num){
            i++
        }
        // 左移为 010 这样来判断第二位是不是1
        tag = tag<<1
    }
    console.log(i)
}
numberOf1(6)


/**
 * 改进做法就是这里了，看下有几位  
 **/
function numberOf1(num) {
    // 每次与num-1 进行与，相当于最低位位的1变为0，前面的不变，
    // 这样看下来，可以进行几次，那么就是有几个1了。
    var i = 0
    while (num) {
        ++ i
        num = num & num - 1
    }
    console.log(i)
}
numberOf1(6)



function is2Expernt(num){
    console.log((num & (num - 1)) ? false : true) 
} 
is2Expernt(2)
is2Expernt(3)
is2Expernt(8)
is2Expernt(6)


function needChange(m,n){
    // 计算不一样位数的总量
    var temp = m ^ n
    var i =0 
    while(temp){
        ++i
        temp = temp & temp-1
    }
    console.log(i)
}
needChange(10,13)


function power(base,exponent){
    // 0 次方，或者0为底数，均为自身
    if(!base && exponent<0){
        return 0
    }
    var absExpoent = exponent
    // 无论直接修改原值，都需要一个标识，所以这里这样处理
    if(exponent < 0){
        absExpoent = exponent  
    }   
    var res = getPower(base, absExpoent)
    if(exponent<0){
        res = 1/ res
    }
    console.log(res)
}
function getPower(base, exponent) {
    if (exponent == 0) {
        return 1
    }
    if (exponent == 1) {
        return base
    }
    // 左移 除以2
    var res = getPower(base, exponent >> 1);
    // 两者之积即为res
    res= res * res
    if (exponent & 1) {
        // 大于1说明最后一位为1，为奇数
        res = res * base
    }
    return res
}
power(2,3)


// 提效的点在于，减少运算次数。例如4次数，可以是 2次数 ✖️ 2次方， 如果是奇数，再乘以罢了
function getPower(base, exponent) {
    if (exponent == 0) {
        return 1
    }
    if(exponent == 1){
        return base
    }
    // 左移 除以2
    var res = getPower(base,exponent>>1);
    if(exponent & 1){
        // 大于1说明最后一位为1，为奇数
        res= res*base
    }
    return res
}

// 最大n位数显然是每一位都是9，而且注意位数不要超过最大数。
// 暴力点的方式是遍历,算出最大值，然后遍历打印。这里的问题是把大数给忽略了。
function printMaxN(n){
    if(!n || n > 32){
        return false
    }
    var maxNum = 0
    for(var i = n;i>0;i--){
        maxNum += 9*Math.pow(10,i-1)
    }
    console.log(maxNum)
    // for(var i=1;i<=maxNum;i++){
    //     console.log(i)
    // }
}
printMaxN(3)
/**
 * 字符串存储的时候，使用n+1的长度存储，这样以便于判断是否加到尽头了，毕竟我们读不到最大的数值。
 * 就把运算拉低到十位数以内了，如果大于10有进位，则标记为1
 * 否则就是直接加出来的结果了。
 */
function printMaxN(n) {
    if (!n) {
        return false
    }
    var strs = ''
    var length = n+1 
    while (!isOverFlow(strs, length)){
        console.log(strs)
    }
    for (var i = n; i > 0; i--) {
        maxNum += 9 * Math.pow(10, i - 1)
    }
    console.log(maxNum)
    // for(var i=1;i<=maxNum;i++){
    //     console.log(i)
    // }
}
function isOverFlow(str,len)(){}