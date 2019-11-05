// node节点
function node(val){
    this.val = val
    this.next = null
}
function LinkList(){
    this.head = new Node('head');     //头节点
    this.find = find;                   //查找节点
    this.insert = insert;               //插入节点
    this.remove = remove;               //删除节点
    this.findPrev = findPrev;           //查找前一个节点
    this.display = display;             //显示链表
}

// 查找所有值并输出
// 迭代调用知道找到最后一个节点，即next为null
function printVlas(){   
    const arr = []
    // 找到当前第一个元素
    let head = LinkList.find(0)
    while(head){
        let {val,next} = head
        arr.push(val)
        head = next
    }
}
