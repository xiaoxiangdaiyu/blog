function getImg(src) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest()
        request.open('GET', src)
        request.responseType = 'blob'
        request.onload = function () {
            if (request.status == 200) {
                var imgRes = request.response;
                resolve(imgRes)
            } else {
                reject(Error('Image didn\'t load successfully; error code:' + request.statusText));

            }
        }
    })
}
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