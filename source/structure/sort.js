
// 执行排序方法
function execMethod(fn) {
    // 获取测试测试数据
    arr = [55, 11, 64, 73, 77, 201, 38, 51, 57, 97]
    console.log('origin-arr>>>', arr)
    return fn()
}
// 交换两项
function swapItem(arr, i, j) {
    let temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
} 
// 
/**
 *  冒泡排序,
 *  每次循环，以为是从前往后走，所以最大值肯定筛选出来。
 *  要想最小值，需要从最后开始遍历，其实没必要了。
 *  相邻前后交换位置，
 * */ 
function bubbleSort(){
    let len = arr.length
    // 这样写错误的原因呢？循环的时候只与i比，相互之间没有比较  
    for(i=0;i<len;i++){
        // 当前元素 n轮循环之后，后面几位是拍好序的，所以只关注前面即可。
        for(let j = 0;j<len-i-1;j++){
            if (arr[j+1] < arr[j]){
                swapItem(arr,j,j+1)
            }
        }
        console.log
    } 
    return arr   
} 

// 执行方案
execMethod(bubbleSort)



/**
 * 选择排序，也是多次遍历，实现在于获取最小位置下标，
 * 遍历完成之后，再交换
 * 而非相邻交换，效率略高
 * */ 

function selectSort(){
    let len = arr.length;
    for(var i = 1;i<len;i++){
        let minIndex = i
        for(var j = 0;j<i;j++){
            if (arr[minIndex]>arr[j] ) {
                minIndex = j
            }
        }
        // 只有不等才交换
        i !== minIndex && swapItem(minIndex,i)
    }
    return arr
}
   
// run
execMethod(selectSort)

// 其实前面有点插入排序的感觉。。。。。不过是交换方式不同罢了。
/** 
 * 插入排序
 * 原理在于认为第一项是有序，从首至尾，顺序插入。
 * 即每一项都与前n项对比，直到完成。
 * */ 
function insertionSort(){
    var len = arr.length;
    // 第一项已经是有序
    for(var i = 1;i<len;i++){
        var item = arr[i];
            target = i
        // 左侧从最大值开始与item比较，直到小于item出现
        for(var j = i-1;j>-1;j--){
            // 满足插入顺序,当前元素往后移动，给待排位元素留空
            if(arr[j]>item){
                target = j
                arr[j+1] = arr[j]
                // 查找到符合元素则终止
            }
            
        }
        // 插入对应元素,不用交互，因为位置上已经是可用元素
        arr[target] = item
    }
    return arr
}
execMethod(insertionSort)

/** 
 * 归并排序 可以分治法的体现，将大的数组拆分至最小单元，
 * 小单元排序之后，再合并
 * 合并时，分别对比就可。
 * */ 
function mergeSort(arrs= arr){
    // 判断终止条件
    if(arrs.length < 2){
        return arrs
    }
    let mid = Math.floor(arrs.length/2),
        left = arrs.slice(0,mid),
        right = arrs.slice(mid)
    return merge(mergeSort(left),mergeSort(right))
}
function merge(left,right){
    var temp = []
    // 对于2的元素比较最为清晰，进行排序的步骤，此时left分别已经是有序
    // 依次挨个对比，小的入栈，大的留下来，直到比完
    while(left.length && right.length){
        if(left[0] < right[0]){
            temp.push(left.shift())
        }else{
            temp.push(right.shift())
        }
    }
    // 剩下的，left肯定大于right
    // 顺序已经固定，依次插入即可
    while(left.length){
        temp.push(left.shift())
    }
    while (right.length) {
        temp.push(right.shift())
    }
    return temp
}
execMethod(mergeSort)



/** 
 * 相比于归并排序来说，快排并没有将数组实际分割，而是选择标准元素即主元
 * 将数组按大小进行分割。然后依次排序，直到最小数组
 * 循环的过程，使用left，right两个指针，从右至做寻找中元插入位置。
 * 
 *
*/
function quickSort(arr,start,end){
    var left = start,
        right = end
    // 已经交叉，则不再进行。    
    if (end - start < 1) {
        return;
    }
    // 保留初始值，即中元值，以首位元素为默认值。
    var target = arr[start]
    while (left< right){
        // 查找小于target的右侧位置,当前大于，则前一位肯定可以插入
        // 至于是否符合，则要继续迭代判断
        while(left < right && arr[right]>=target){
            right--;
        }
        // 此时arr[right] 小于target或者已经到底，既然如此则把其放到左侧。
        // 找到插入点,将target赋于当期那元素，因为中元已经保留，所以肯定先覆盖left
        arr[left] = arr[right]
        // 前方可能有大于target的元素，继续从左侧开始查找
        while(left<right && arr[left]<target){
            left++;   
        }
        // 此时left要么与right相等，相等了，则当前位置就是合适位置
        // 要么是大于target赋给 right是ok的。
        arr[right] = arr[left]
    }    
    // 此时left为中间位置
    arr[left] = target
    console.log('arr>>>', arr)
    quickSort(arr, start, left - 1);
    quickSort(arr, left + 1, end);
    return arr;
}
quickSort(arr,0,9)



/**
 * 二分搜索 
 * */ 

function binarySearch(item){
    var arr = [1,2,3,4,11,34,55,77,88,99,100]
    console.log('已排序数组>>',arr)
    var len = arr.length,
        left=0,
        right = len-1,
        midIndex 
    // 选中间，作为比较标准，判断是否到首尾 
    while(left<=right){
        // 中间位置选取
        midIndex = Math.floor((left+right) / 2)
        var midItem = arr[midIndex]
        if (midItem == item){
            console.log('最终位置》》', midItem)
            return minIndex
        }
        // 左边
        if(midItem > item){
            // 取之前元素
            right = midIndex -1    
        }
        if(midItem<item){
            left = left+1
        }
        console.log('中间位置》》', midItem)
    }
    console.log('最终位置》》', -1)   
    return -1  
} 