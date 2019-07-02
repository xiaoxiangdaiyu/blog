---
title: 关于CORS 应该注意的几点
date: 2019-07-02
---
  
## 前言
对于跨域，随着w3c的CORS的出现，相比较于有些年头的jsonp，CORS以其简单安全，支持post的优势越来越收到大家的欢迎。具体如何CORS的原理和实现，[直接推荐阮老师的文章](http://www.ruanyifeng.com/blog/2016/04/cors.html),十分详细。本文主要关注CORS实现过程中的几个疑惑点。
<!-- more -->
## 预检请求
### 背景
浏览器将CORS请求分成两类：简单请求（simple request）和非简单请求（not-so-simple request)。
#### 简单请求
同时满足一下条件的即是简单请求：

1. 请求方法是以下三种方法之一：
HEAD、GET、POST
2. HTTP的头信息不超出以下几种字段
Accept
Accept-Language
Content-Language
Last-Event-ID
Content-Type：只限于三个值application/x-www-form、multipart/form-data、text/plain
#### 非简单请求
显然，不同时满足则为非简单请求(可以认为是复杂请求)。两者的差别在于复杂请求在与服务端交互时多了一次options的预检请求，毕竟复杂请求一般就是HTTP请求头信息超出限制或者method为put、delete等操作行为，处于安全考虑，需要服务端先行验证来决定是否给予相关权限。  

如下所示（示例来自阮老师文章）:

```js
var url = 'http://api.alice.com/cors';
var xhr = new XMLHttpRequest();
// PUT method为复杂请求，要预检
xhr.open('PUT', url, true);
xhr.setRequestHeader('X-Custom-Header', 'value');
xhr.send();
```  
非简单请求，浏览器自动发送otpios的预检请求，请求头如下：

```js
OPTIONS /cors HTTP/1.1
// 请求源
Origin: http://api.bob.com
// 必须字段，指明正式cors请求将会使用那些method
Access-Control-Request-Method: PUT
// 除简单头之外，额外的请求头
Access-Control-Request-Headers: X-Custom-Header
Host: api.alice.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

对于预检信息，服务端一般做了如下操作：

1、检查origin、Access-Control-Request-Method和Access-Control-Request-Headers等字段，确认是否允许跨域，如果允许跨域作出回应： 

```js
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2.0.61 (Unix)
// 允许的源 
Access-Control-Allow-Origin: http://api.bob.com
// 允许的请求方式
Access-Control-Allow-Methods: GET, POST, PUT
// 允许额外header
Access-Control-Allow-Headers: X-Custom-Header
Content-Type: text/html; charset=utf-8
Content-Encoding: gzip
Content-Length: 0
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain
```

如果不允许跨域，依然响应该请求，不过不携带CORS相关的信息。浏览器则会认为服务器不允许跨域，触发错误。

```js
// 常见的跨域错误
XMLHttpRequest cannot load http://api.alice.com.
Origin http://api.bob.com is not allowed by Access-Control-Allow-Origin.
```

到这里一个流程结束，不过我们要关注的是options 预检请求之后 code 返回的问题
### options 成功之后，返回code 200 还是 204

常规预检的就是对于options的请求直接返回code 200的响应，表示校验通过。
但是前两天发现有的返回为code204。两者之间的差别具体在哪呢。

#### 常见用法

1、针对特定接口支持CORS时，在代码里加判断对于options返回200

```java
// 随便找了段java代码 
if (req.getMethod().equals("OPTIONS")) {
     res.setStatus(200);
 }
```

2、如果整个域名都支持CORS，可以再nginx侧直接配置，此时常见的是返回204.

```shell
if ($request_method = 'OPTIONS') { 
    add_header Access-Control-Allow-Origin *; 
    add_header Access-Control-Allow-Methods GET,POST,PUT,DELETE,OPTIONS;
    #****省略...
    return 204; 
}
```
#### 总结
两者之间的差别，首先可以参考下204和200 对应的含义（下面内容摘自MDN）。
**200**
请求成功，成功的具体含义依据http method 的不同而有所差别。：
* GET: 资源已经被提取并在消息中文中传递
* POST: 描述动作结果的资源在消息体中传输

**204**
服务器成功处理了请求，但不需要返回任何实体内容，并且希望返回更新了的元信息。
客户端是浏览器的haul，用户浏览器应保留发送了该请求的页面，而不产生任何文档视图上的变化。由于204响应被禁止包含任何消息体，因此它始终以消息头后的第一个空行结尾。

简单总结，204返回表示请求成功，并且无消息体，优势在于节省网络请求。

#### 具体到options请求，选用哪一个。
贴切的来说，应该像其他options请求一样为预检optiosn请求返回相同的code状态码，相关规范不要求或者推荐其他内容。  
**fecth请求**
例如对于[Fetch 规范](https://fetch.spec.whatwg.org/) 要求CORS协议的status可以为200-209里面的任意值。  

```json
If a CORS check for request and response returns success 
and response’s status is an ok status, 
run these substeps.
```
如果response为一个okstatus就可以继续执行

```json
An ok status is any status in the range 200 to 299, inclusive.
```
并不要求具体哪一个值。
所以从fetch来看，两者均可选择。  
  
**HTTP 1.1**
对于http/1.1 规范来说，有一章节专门定义了各种响应code。对于[2开头的2-XXcode](https://tools.ietf.org/html/rfc7231#section-6.3),分别描述如下：

* **200**
请求成功，成功的具体含义依据http method 的不同而有所差别。
* GET: 资源已经被提取并在消息中文中传递
* POST: 描述动作结果的资源在消息体中传输
* OPTIONS:  communications options成功的表示
由上可知，对于options预检请求的响应，需要包含下面两种情况：
1、表明请求成功
2、描述通信选项（这里包括， Access-Control-Allow-Methods 和 Access-Control-Allow-Headers这些响应头）
看起来，上面就是200在http定义中的含义，显然满足，但是如果继续看204的含义，好像也可以满足需求。

**204**
服务器成功处理了请求，但不需要返回任何实体内容，并且希望返回更新了的元信息。
客户端是浏览器的话，用户浏览器应保留发送了该请求的页面，而不产生任何文档视图上的变化。由于204响应被禁止包含任何消息体，因此它始终以消息头后的第一个空行结尾。

#### 结论
首先两者都可以使用，对于200，从定义而言更符合场景和定义。但是204无消息体，优势在于节省网络请求。  
至于用哪个，大家自行做下判断。
  

### 跨域 读取cookie
作为常见的场景，cookie一般会存放一些，鉴权会话等信息。对于CORS跨域，默认的是不包含cookie的。

```js
A cross-origin request by default does not bring any credentials (cookies or HTTP authentication)
```
如果要操作cookie需要分别从服务端和客户端两个场景来看。  

#### 客户端 request 携带cookie

request如果要携带cookie，需要特定参数指明。可能看到过这个参数为credentials或者withCredentials，什么时候用两者呢。主要跟请求的实现有关：

1. **Fetch 使用credentials**
    直接使用原生Fetch的话，需要设置credentials。  
    
    credentials 是Request接口的只读属性，用于表示用户代理是否应该在跨域请求的情况下从其他域发送cookies。这与XHR的withCredentials 标志相似，不同的是有三个可选值（后者是两个）：  
    
* omit: 从不发送cookies.
* same-origin: 只有当URL与响应脚本同源才发送 cookies、 HTTP Basic authentication 等验证信息.(浏览器默认值,在旧版本浏览器，例如safari 11依旧是omit，safari 12已更改)
* include: 不论是不是跨域的请求,总是发送请求资源域在本地的 cookies、 HTTP Basic authentication 等验证信息.

CORS跨域的时候，只需要如下设置：  

```js
fetch('http://another.com', {
  credentials: "include"
});
```
2.   **XHR 使用withCredentials**

基于XMLHttpRequest实现的请求使用withCredentials来允许携带cookie。  
该属性为boolean类型，所以只有true/false两个取值，默认为false。  
这样也很好理解，默认不携带是处于安全考虑。  
使用如下

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://example.com/', true);
xhr.withCredentials = true;
xhr.send(null);
```

适用框架：jquery的ajax，axios等。

#### 服务端 Access-Control-Allow-Credentials  

当客户端设置了允许携带cookie之后，并不能完成该操作，毕竟是跨域，服务端也需要做响应设置，否则浏览器拿不到正确响应。

```js
Access-Control-Allow-Credentials:true
```
看MDN 的解释：  
 
```js

The Access-Control-Allow-Credentials response header tells browsers whether to expose the response to frontend JavaScript code when the request's credentials mode (Request.credentials) is "include".  
```

当 credentials为include的时候，通知浏览器是否将响应暴露给前端jscode，如果为false，js不能读取响应自然请求报错。
只有Access-Control-Allow-Credentials为true时，才会将响应暴露给客户端。
当作为预检请求响应头时，表明该实际请求(即后面的真正请求)是否可以使用credentials。  
   
不过对于简单请求，因为没有预检，如果服务端没有正确响应，浏览器会忽略该属性，并不会直接报错。  
需要与XMLHttpRequest.withCredentials属性或者Fetch 的credentials 配合使用。   


#### 注意
如果要发送Cookie，Access-Control-Allow-Origin就不能设为星号，必须指定明确的、与请求网页一致的域名。  
同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传。  
且（跨源）原网页代码中的document.cookie也无法读取服务器域名下的Cookie。   

毕竟cookie是有path来保证封闭性的，如果可以随便读取不管从安全还是性能上都是一种隐患。  

### 多域名跨域

对于多域名跨域，方法比较多。  

#### 1、Access-Control-Allow-Origin：*  
允许任意域名跨域，显然支持多域名。不过从安全性和cookie的使用的角度来看并不推荐。  
#### 2、动态匹配域名
这种实现方式比较多，原理就是声明允许的多域名配置，可以是数组或者是正则，根据当前请求的域名，来判断是否在适用返回内，在的话则设置Access-Control-Allow-Origin为当前域名。

具体实现这里就不写了。  

### 结束语
#### 参考文章
[http://www.ruanyifeng.com/blog/2016/04/cors.html](http://www.ruanyifeng.com/blog/2016/04/cors.html)   
[https://fetch.spec.whatwg.org/#cors-protocol-and-credentials](https://fetch.spec.whatwg.org/#cors-protocol-and-credentials)   
[http://www.yunweipai.com/archives/9381.html](http://www.yunweipai.com/archives/9381.html)   
以上是在工作中偶然发现的几点疑惑，解决之后深究了下具体原理。希望能对其他同学有所帮助，抛砖引玉，一起努力。


