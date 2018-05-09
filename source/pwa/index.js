function registerServiceWorker(){
    // 注册service worker
    return navigator.serviceWorker.register('./sw1.js').then(registration => {
        console.log('注册成功');
        // 返回
        return registration;
    })
    .catch(err => {
        console.error('注册失败', err);
    });
}
function execute() {
    // 允许之后执行
    registerServiceWorker().then(registration => {
        // 初次演示注释掉
        registration.showNotification('Hello World!');
    });
}
// 获取通知权限之后再执行
function getPermission(){
    return new Promise((resolve, reject) => {
        const permissionPromise = Notification.requestPermission(result => {
            resolve(result);
        });
    }).then(result => {
            if (result === 'granted') {
                execute();
            }
            else {
                console.log('no permission');
            }
        });
}
window.onload = function () {
    var myImage = document.querySelector('#root img'),
        src = './asset/sw.jpg';
    myImage.src = src;
    if (!('serviceWorker' in navigator)) {
        return;
    }
    if (!('PushManager' in window)) {
        return;
    }
    // 初次  
    // registerServiceWorker()
    // 通知权限
    getPermission()
}