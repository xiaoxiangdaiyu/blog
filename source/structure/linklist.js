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

// 删除链表节点，删除分为几种情况 一般是给定头部节点
/** 
 * 首节点
 * 中间节点
 * 尾节点
 */
function remove(head,node){
    // 头节点
    if (node.next) {
        // 中间节点,将next节点覆盖当前节点
        node.val = node.next.val;
        node.next = node.next.next;
    } else if (head.value = node.value) {
        // 节点置为null，头部节点也为null,该节点被null覆盖
        node = null;
        head = null;
    }else{
        // 尾部节点，且非头，则需要遍历到最后一个，next指向null
        // 从头遍历
        node = head;
        // 最后一个之前，当前节点都被next覆盖。
        while (node.next.next) {
            node = node.next;
        }
        // 没有next指向，即删除尾节点
        node.next = null;
        node = null;
    }
}