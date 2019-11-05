(function (modules) {
    function webpackJsonpCallback(data) {
        // 结合runtime更好看出来，传入的参数是
        var chunkIds = data[0];
        var moreModules = data[1];
        var executeModules = data[2];
        var moduleId, chunkId, i = 0,
            resolves = [];
        // webpack会在installChunks中存储chunk的载入状态，据此判断chunk是否加载完毕
        for (; i < chunkIds.length; i++) {
            chunkId = chunkIds[i];
            if (Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
                resolves.push(installedChunks[chunkId][0])
            }
            installedChunks[chunkId] = 0
        }
        // 注意，这里会进行“注册”，将模块暂存入内存中
       // 将module chunk中第二个数组元素包含的 module 方法注册到 modules 对象里
        for (moduleId in moreModules) {
            if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
                modules[moduleId] = moreModules[moduleId]
            }
        }
        if (parentJsonpFunction) parentJsonpFunction(data);
        while (resolves.length) {
            resolves.shift()()
        }
        deferredModules.push.apply(deferredModules, executeModules || []);
        return checkDeferredModules()
    };

    function checkDeferredModules() {
        var result;
        for (var i = 0; i < deferredModules.length; i++) {
            var deferredModule = deferredModules[i];
            var fulfilled = true;
            // 第一个元素是模块id，后面是其所需的chunk
            for (var j = 1; j < deferredModule.length; j++) {
                var depId = deferredModule[j];
                // 这里会首先判断模块所需chunk是否已经加载完毕
                if (installedChunks[depId] !== 0) fulfilled = false;
            }
            // 只有模块所需的chunk都加载完毕，该模块才会被执行（__webpack_require__）
            if (fulfilled) {
                deferredModules.splice(i--, 1);
                result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
            }
        }
        return result;
    }

    var installedModules = {};
    var installedChunks = {
        "runtime": 0
    };
    var deferredModules = [];

    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports
        }
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = true;
        return module.exports
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function (exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            })
        }
    };
    __webpack_require__.r = function (exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: 'Module'
            })
        }
        Object.defineProperty(exports, '__esModule', {
            value: true
        })
    };
    __webpack_require__.t = function (value, mode) {
        if (mode & 1) value = __webpack_require__(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        var ns = Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, 'default', {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value != 'string')
            for (var key in value) __webpack_require__.d(ns, key, function (key) {
                return value[key]
            }.bind(null, key));
        return ns
    };
    __webpack_require__.n = function (module) {
        var getter = module && module.__esModule ? function getDefault() {
            return module['default']
        } : function getModuleExports() {
            return module
        };
        __webpack_require__.d(getter, 'a', getter);
        return getter
    };
    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property)
    };
    __webpack_require__.p = "";
    // 获取现有模块组
    var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || []; 
    var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
    jsonpArray.push = webpackJsonpCallback;
    jsonpArray = jsonpArray.slice();
    // 依次执行该函数。
    for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
    var parentJsonpFunction = oldJsonpFunction;
    checkDeferredModules()
})([]);


// 业务模块代码，将内容push到全局变量
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([
    // id
    ["Time"],
    // data
     {
        "./src/pages/Time.js": (function (module, exports) {
            eval("class test{\n    constructor() {\n      this.name=\"a\"\n    }   \n}\n\n//# sourceURL=webpack:///./src/pages/Time.js?")
        })
    },
    // 自动执行项目
    [
        ["./src/pages/Time.js", "runtime"]
    ]
]);