import { isNumber } from "util";

// 数据准备
/** 
 * 输入 ： [1,null,2,3]
 * 输出：1,2,3
*/

/** 
 * 二叉树遍历
 * 中序遍历，即先左边再右边,需要root的
*/
// 递归版本确实易懂，不过性能不好
function inorderTraversal(root,arr){
    // 存在根节点
    if(root){
        inorderTraversal(root.left,arr)
        array.push(root.val)
        inorderTraversal(root.right,arr)

    }
    return array;   
}
var 
// 迭代版本
/**
 * 迭代需要判断结束条件和执行顺序
 * 使用栈来存放当前节点遍历，直到栈已空
 * 因为是深度优先遍历，后进先出，所以用栈
 * 思路1、将左子节点入栈，直到叶子节点
 * 2、取出栈内节点，加入访问标识，然后查询右子节点
 * 3、不存在右边节点，则向上访问父节点重复1、2
*/
function inorderTraversal(root) {
    // 存放遍历顺序
    var arr = [],
        // 存放节点队列
        stack = [],
        item = root
        
    // 节点存在，或者栈内有节点 
    while(item || stack.length){
        // 左子节点入队列进行入栈操作,直到叶子节点
        // 没有左子节点，则进行下一步,查询下个节点
        if(item){
            stack.push(item)
            item = item.left
        }
        // 开始访问已入栈节点
        item = stack.pop()
        // 压入访问记录
        arr.push(item.val)
        // 查找又子节点
        item = item.right
    }    
    return array;
}
// 先序遍历
// 入栈的时候遍历就可以可，
function firstTravel(){
    // 遍历结果
    var result = [],
        // 遍历栈
        stack = [],
        node = root
    // 根节点存在 或者栈内节点存在，继续遍历   
    while(node || stack.length ){  
        // 左子节点入栈
        while(node.left){
            stack.push(node)
            // 加入遍历队列
            result.push(node.value)
            node = node.left 
        } 
        // 节点出栈，查找右子节点
        node = stack.pop()
        // 遍历右节点
        node = node.right
    }  

}
// 后序遍历
// 还是左节点先入栈，出栈的时候查询是否存在右节点，且该节点是否被访问过。
// 因为右节点存在子节点的话，该节点会被遍历两次
function lastTravel() {
    // 遍历结果
    var result = [],
        // 遍历栈
        stack = [],
        // 标记子节点是否被访问
        last = null,
        node = root
    // 根节点存在 或者栈内节点存在，继续遍历   
    while (node || stack.length) {
        // 左子节点入栈
        while (node.left) {
            stack.push(node)
            node = node.left
        }
        // 判断子节点 父节点是否有右节点，有的话继续遍历
        var traget = stack[stack.length-1]
        // 存在右子节点，且未遍历过
        if (traget.right && last !== traget.right){
            // 遍历右节点
            node = node.right    
        }else{
            // 节点出栈，查找右子节点
            node = stack.pop()
            // 接入队列
            result.push(node.value)
            // 标记遍历对象，以免二次遍历
            last = node
            // 终止条件
            node= null
        }
    }
}


/** 
 * 1+2+3+...+n，要求不能使用乘除法、for、while、if、else、switch、case等关键字及条件判断语句（A?B:C）。
 * 不能使用迭代判断，只能是递归，而if else 则只能使用 && 
 * 思路1、递归相加，知道n为0 
 * 思路2、位运算，通过 n(n+1)/2 = (n方+n)/2 先求 n方+n 按位与 实现除的效果。
*/
function Sum_Solution(n){
    return n && (n+Sum_Solution(n-1))
}
function Sum_Solution(n){
    //二进制右移b位（去掉末b位），相当于a除以2的b次方（取整）
    return (Math.pow(n,2)+n) >> 1
}


/**
 * 写一个函数，求两个整数之和，要求在函数体内不得使用+、-、*、/四则运算符号。
 * 思路就是 进行位运算 替代常规加减，将+的结果可以分开看，每位相加，然后将进位和不进位内容相加
 * 那么对照着就能看到
 * 二进制异或操作和不进位相加得到的结果相同(1^1=0 0^1=1 0^0=0)
 *  二进制与操作后左移和进位结果相同（1&1=1 1&0=0 0&0=0）
 * 
*/

function add(num1,num2){
    if(num2 == 0){
        return num1
    }
    // 递归加下去，直到最终结果得到
    return add(num1 ^ num2, (num1 & num2) << 1)
}
// 非递归
function add(num1,num2){
    while(num2!=0){
        // 非进位
        var res = num1 ^ num2;
        num2 = (num1 & num2)>>1;
        num1 = res
    }
    return res
}


// 判断是否为整数
function isOdd(num){
    if (Number(num)){
        return num % 2 == 0
    } 
}
// 位运算
function isOdd(num) {
    if (Number(num)) {
        return num&1 != 0
    }
}

// 给定一个整数，判断是不是2的整数次幂
// 例如4、8等，分析特性，
// 二进制 只有一个1开头 100、1000，自己减去1 之后 均为011、0111 这样 进行与操作之后，均为0 
function check(num){
    return num & (num-1) == 0
}
// 常规做法
// 2/2 = 1 2%2 = 0  如果除结果不为0 ，深入下去，判断。
// 迭代判断直到最后，看是否整除
function check(num) {
    if (num != 1) {
        while (num != 1) {
            if (num % 2 == 0) {
                num = num / 2;
            } else {
                return false;
            }

        }
        return true;
    } else {
        return false;
    }
}

// 常规做法，转为二进制，记录1的个数
function get1(num){
    if(Number(num)){
        var res = [],
            count = 0
            res1 = num,
            res2 = 0
        while (res1 > 0){
            // 取余数
            res2 = res1 % 2
            // 取除数结果
            res1 = parseInt(res1/2) 
            
            res.push(res2)
            if(res2 == 1){
                count++
            }
        }
        console.log('二进制表示>>>',res.reverse().toString())
        console.log('1个数>>', count)
    }
}

// 与1 与 可以获取最后一位的值
// 然后右移运算，每次右移之后，最后一位就忽略了，获取上一位的值，直到为0。
function get1(num){
    var count = 0
    while (num != 0) {
        count += num & 1
        // 带符号右移，符号位也可能是一
        num >>= 1
    }
    console.log(count)
    return count
}


/**
 * 在其他数都出现两次的数组中找到只出现一次的那个数
 * 思路1，遍历数组，存储出现次数
 * 思路2，数字与本身异或结果为0，那么出现两次的都可以被过滤掉，只剩下单次的值
 */

 function get1Num(arr){
    var counts = [] 
    arr.forEach(item => {
        // 不存在则入栈
        var index = counts.indexOf(item)
        if (index<0){
            counts.push(item)
        }else{
            // 存在则删除该元素
            // 截取直接元素获取切片
            // counts.slice(index,1)
            // splice 裁剪原数组
            counts.splice(index,1)
        }
    })
    console.log(counts)
    return counts[0]
 }

//  异或做法
function get1Num(arr) {
    if(!arr instanceof Array){
        return '输入数组'
    }
    var counts = 0
    arr.forEach(item => {
        counts = counts ^ item
    })
    console.log(counts)
    return counts[0]
}


/**
 * 在其他数都出现两次的数组中找到只出现一次的那两个数
 * 有两个数 只出现一次
 * 思路1 依然可用
 * 思路2 思路是这样的，对于两个单次的数，要是能按规律分别分到两个数组里，就满足目的了
 * 所以整体进行一次异或，获取异或后的值，因为异或的原理，不同的数肯定存在1的位，按这一位是否为1将数组分类。
 * 出现两次的相同值肯定在一起，单次的值肯定分开，这样达到目的了，分别异或就可以了
 * 题目变形：给你1-1000个连续自然数,然后从中随机去掉两个,再打乱顺序,要求只遍历一次,求出被去掉数
 * 将连续自然数跟打乱之后的合并就是 单次多次的问题了。
 * 右移就是降低一个进制即 除以2，取整，例如3 右移一位为1 。
 * 左移即乘以2 例如 1=》2 
 * 这里回顾下js的取整方法： 
 * Math.ceil() 向上取整，即进一位，ceil 有天花板的意思，很好理解了
 * Math.floor() 向下取整，floor有地板的意思
 * Math.round() 四舍五入，round有圆环的意思，专指四舍五入
 * parseInt() 这个同floor
 * parseInt(2.2) // 2
 * Math.floor(2.2) //2
 * Math.ceil(2.2) // 3
 * Math.round(2.2) // 2
 **/

function getTwo(arr){
    var val=0,
    //  位置记录
        position = 0,
        // res1
        result1 = 0,
        result2 = 0
   // 获取异或值     
   arr.forEach(item => {
            val = val ^ item
        }) 
    // 获取第k位为1的值
    while((val & 1 == 0 )&& val <64){
        // 右移
        val = val >> 1
        position++
    }
    arr.forEach(item => {
        // 第k位为0 
        if((item >> position & 1) == 1){
            result1 ^= item
        }else{
            result2 ^= item
        }
    })
    console.log('x,y>>',result1,result2)
}



/**
 * 把只包含质因子2、3和5的数称作丑数（Ugly Number）。
 * 例如6、8都是丑数，但14不是，因为它包含质因子7。
 * 习惯上我们把1当做是第一个丑数。求按从小到大的顺序的第N个丑数。
 *  思路：
 * 首先查找丑数规律： 丑数只能被2、3、5整除，说明第n个丑数只能是0 - n-1中某个丑数✖️2、✖️3、✖️5的结果。
 * 而且，这个数即第0 - n-1个丑数✖️2、✖️3、✖️5的结果中比第n-1个丑数大的最小值。结果可能有很多，需要排序。
 * 按照上面的规律，我们可以依次求出第0 - n个丑数。
 * 
 * 基本思路：
 * 0-n-1 的丑数队列，因为已知因为第一个丑数知道，所以可以一直推下去。
 * 然后分别*2 *3，* 5 ，比较大于n-1 丑数最小值
 * 可以优化：
 * 有些值，确实很小，没必要每次都乘，记录下本次，*2 * 3 * 5 刚好大于n-1 丑数的值即可，下次从其开始循环。
 * 
 */
  
 function getUglyNumber(n){
    //  记录位置标识
    var i = j = k = 0,
        // 初始数组就是1
        arr = [1]
    // 0 直接返回    
    if(n == 0){
        return arr[0]
    }
    // 获取丑数队列
    while(arr.length <= n){
        // next 丑数
        arr.push(Math.min(arr[i]*2,arr[j]*3,arr[k]*5))
        var currentItem = arr[arr.length - 1]
        // 获取下次下标 n-1
        while (arr[i] * 2 <= currentItem){
            i++
        }
        while (arr[j] * 3 <= currentItem) {
            j++
        }
        while (arr[k] * 5 <= currentItem) {
            k++
        }
    }
    console.log(arr[n])
    return arr[n]
 }



 /**
  * 数值的整数次方
  * 给定一个double类型的浮点数base和int类型的整数exponent。求base的exponent次方。
  * 这道题逻辑上很简单，但很容易出错。
  * 关键是要考虑全面，考虑到所有情况。
  * exponent 是正，负，0的情况
  * base为0的情况
  * Math.abs（） absolute value 就是绝对值的意思，防抱死也有点意味，绝对可用
  * */  
function getPow(base, exponent){
    if (exponent !== +exponent){
        throw Error('必须为数字')
    }
    if (exponent == 0){
        return 1
    }
    if(exponent > 1){
        var result = base
        for(var i =1;i<exponent;i++){
            result *= base
        }
        return result
    }
    var num = Math.abs(exponent)
    for (var i = 1; i < exponent; i++) {
        result *= base
    }
    return result?1/result:false
} 


/**
 * 求出1~13的整数中1出现的次数,并算出100~1300的整数中1出现的次数？
 * 为此他特别数了一下1~13中包含1的数字有1、10、11、12、13因此共出现6次,但是对于后面问题他就没辙了。
 * ACMer希望你们帮帮他,并把问题更加普遍化,可以很快的求出任意非负整数区间中1出现的次数（从1到n中1出现的次数）。
 */
/**
 * 既然计算位数，11可以算为两次，就要逐位分析，先从两位来判断
 * 分别计算，个位为1和十位为1 的情况，两者相加即为结果。
 * 需要判断数字，0、1、2关系有所不同，主要体现在对其后位数的限制
 * 0的话，后面位数可以不考虑，因为当前位不会位一，后面多大都不存在组合可能
 * 1的话，后面位数的大小要考虑，因为有部分值不能取到，例如13，那么14、15的情况不能取到，只能是3+1 ，有0
 * 2的话，就所有情况都满足了，完全根据前面值的决定，例如22，那么可以有(2+1)+(0+1)*10 = 13
 * 即下面这个情况：abcde，分析百位数字c
 * c = 0 : 有 ab*100 种情况
 * c = 1 : 有 ab*100 + de + 1 种情况
 * c > 2 : 有 (ab+1) * 100 种情况
 * 举个例子：
 * 210 
 * 个位为1： 21
 * 十位为1： 2*10+1
 * 百位为1： (0+1)*100
 * */ 
function getTotalNum(n){
    let count = 0;
    let i = 1;
    let high = low = current = level = 0;
    let length = n.toString().length;
    while (i <= length) {
        level = Math.pow(10, i - 1); //第i位数位于什么量级 1 10 100 ...
        high = parseInt(n / (level * 10));
        low = n % level;
        current = parseInt(n / level) % 10;
        if (current === 0) {
            count += (high * level);
        } else if (current === 1) {
            count += (high * level + low + 1);
        } else {
            count += ((high + 1) * level);
        }
        i++;
    }
    return count;
} 


// 自己实现
function getTotal(n) {
    var current = heigh = low = level = 0
    // 位数下标
    var i = 0
    // 数字位数
    var len = n.toString().length
    // 总数
    var total = 0
    for (i; i < len; i++) {
        level = Math.pow(10, i)
        // 注意这里获取当前位置的value
        heigh = Math.floor(n / (10 * level)) % 10
        current = n % (10 * level)
        low = n % (level)
        if (current == 0) {
            total += heigh * level
        } else if (current == 1) {
            total += heigh * level + low + 1
        } else {
            total += (heigh + 1) * level
        }
    }
    return total
}