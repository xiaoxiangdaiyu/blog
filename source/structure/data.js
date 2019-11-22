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