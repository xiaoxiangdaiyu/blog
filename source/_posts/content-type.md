---
title: http Content-Type 知多少
date: 2019-04-15
---
  
## 前言
作为前端开发，工作中少不了与接口请求打交道。对于常见的content-type，也能说上来几个，感觉还算了解。直到有一天，我要在查看google的批量接口合并时发现Content-Type: multipart/mixed以及Content-Type: application/http时，有点措手不及。赶紧深入研究下Content-Type相关内容来弥补下自己的不足，从前端的角度来看看Content-Type。
<!-- more -->
## Content-Type
Content-Type:实体头部用于指示资源的MIME类型。如果未指定 ContentType，默认为text/html
有两种场景：
在请求中 (如POST 或 PUT)，客户端告诉服务器实际发送的数据类型。

在响应中，Content-Type标头告诉客户端实际返回的内容的内容类型。浏览器会在某些情况下进行MIME查找，并不一定遵循此标题的值; 为了防止这种行为，可以将标题 X-Content-Type-Options 设置为 nosniff。

简而言之就是标识资源或者所需资源的MIME类型。  

句法如下：

```bash
Content-Type: text/html; charset=utf-8
Content-Type: multipart/form-data; boundary=something
```
参数一般media-type、charset、boundary三种。
我们的关注点在于media-type的取值以及其适用场景。

### media-type
更多的是作为MIME type( Multipurpose Internet Mail Extensions)出现，即多用途Internet邮件扩展。  
其目的是用一种标准化的方式来标识文档的性质和格式。   
浏览器通常使用MIME类型（而不是文件扩展名）来确定如何处理文档；  
因此服务器设置正确以将正确的MIME类型附加到响应对象的头部是非常重要的。  

#### 结构

MIME 组成结构如下：
由类型与子类型两个字符串中间用'/'分隔而组成。不允许空格存在。对大小写不敏感，但传统都是小写。
允许额外参数，如后面所示：

```js
type/subtype;parameter=value
```
其中：

* type对应通用类目，例如：text/video等。
* subtype对应准确的子类，例如text下面细分为plain(纯文本)、html(html源码)、calendar（.ics）文件等。
* parameter可选一般是charset或者bundaary等。

### Types
类目包括两种类型：独立类型和Multipart类型。
#### 独立类型
独立类型指只代表一个单独的文件或者媒体的类型，表明了对文件的分类。
常见类型和实例如下：

* text
  文本数据包括一些人类可读的内容或者源码。例如：text/plain, text/csv, text/html.
* application
  数据为二进制的一种，例如application/octet-stream,application/pdf,application/pkcs8,application/zip.  
* audio
  音频或者音乐数据，例如audio/mpeg, audio/vorbis
* video
  视频数据或者文件，例如video/mp4
* image
  图像或图形数据，包括位图和矢量静止图像以及静止图像格式的动画版本。例如image/gif, image/png, image/jpeg, image/bmp, image/webp, image/x-icon
  
#### Multipart类型
Multipart类型指明被分为几部分的一种文档的类目，且经常有不同的MIME类型。也可以用来表示属于相同事物的多个且独立的文件，这些独立的文件构成一个复杂的文档。在电子邮件场景中常见。  
有两种Multipart类型：message和multipart。

* message
  一个包括其他信息的消息，常用于下面的场景，例如指明一个邮件包含转发信息或者在多种信息的情况下，允许以chunk的形式发送数据量很大的信息。包括message/rfc822和message/partial
* multipart  
  由多个不同MIME类型组件构成的数据，例如 multipart/form-data(使用FormData API生成的数据) 
  
看完了基本定义，下面看看常见的类型及使用场景。
  
### 常见类型及使用场景
#### 静态资源、图片、媒体类
对于静态资源、图片和媒体类，也就是text、image、video等比较清晰明了，不再详细描述。
#### application类
* **application/json**  

  随着json这种轻量级的数据交互格式的流行，特别是和脚本交互的便利，使得在前后接口中，越来越多采用json格式。对于http协议来说，最终传输的还是字符。这里不再多进行描述。  
  
* **application/x-www-form-urlencoded**
  作为表单提交中默认的类型，其表明数据以标准的编码格式被编码为键值对。
  数据被编码成以 '&' 分隔的键-值对, 同时以 '=' 分隔键和值. 非字母或数字的字符会被 percent-encoding: 这也就是为什么这种类型不支持二进制数据的原因 (应使用 multipart/form-data 代替).   
   我们以新浪为例，可以看到其请求报文(formdata那里选择，view source可以看得比较清楚)：   
<img src='https://user-gold-cdn.xitu.io/2019/4/14/16a1c6f743d8b587?w=1600&h=468&f=jpeg&s=128274'/>  

* **multipart/form-data**
  这里为了对比，就也放到这里来说了。  
  一般用于涉及文件的表单提交，用于post请求，其格式如下：  
  
  ```json
  Content-Type: multipart/form-data; boundary=aBoundaryString
  ```  
  其中boundary指明了请求体中每部分的分割符(对于multipart的类目，都会存在该字段，以区分请求体中数据的分割)，其请求体中则是对应表单每部分的内容。每部分都会有自己的请求体和相关内容。  
例如如下的文档结构：  
  
```html
  <form action="http://localhost:8000/" method="post" enctype="multipart/form-data">
  <input type="text" name="myTextField">
  <input type="checkbox" name="myCheckBox">Check</input>
  <input type="file" name="myFile">
  <button>Send the file</button>
</form>
```   

其请求信息如下：  

```js
POST / HTTP/1.1
Host: localhost:8000
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
Upgrade-Insecure-Requests: 1
// 以 ---------------------------8721656041911415653955004498 作为分割符
Content-Type: multipart/form-data; boundary=---------------------------8721656041911415653955004498
Content-Length: 465

-----------------------------8721656041911415653955004498
// 分段一 文本相关信息
Content-Disposition: form-data; name="myTextField"
// 对应value
Test
-----------------------------8721656041911415653955004498
// checkbox
Content-Disposition: form-data; name="myCheckBox"

on
-----------------------------8721656041911415653955004498
// 文件
Content-Disposition: form-data; name="myFile"; filename="test.txt"
Content-Type: text/plain

Simple file.
-----------------------------8721656041911415653955004498--
```

* **application/javascript application/x-javascript text/javascript**   
  对于js文件，常见MIME类型为text/javascript，但是前两种应该会有见到过。三者之间多少还是有点区别的。  
  传统的js程序对应的MIME类型为text/javascript，其他的还有"application/x-javascript"（x前缀表示这是实验性类型）， 因为text/javascript是最常见的类型，所以RFC4329定义了“text/javascript”。不过，js文件实际上并不是真正的文本类型，因此推出了application/javascript类型，不过现行的支持性并不好，所以常常会用application/x-javascript来代替。   
  
* **application/zip application/gzip**   
   zip 对应zip压缩文件，gzip是若干种文件压缩程序的简称，通常指GNU计划的实现，此处的gzip代表GNU zip。

* **application/http**  
   这一种大家可能就不常见了，从类型可以知道，是http请求，但具体用途还是要翻下[规范](https://www.iana.org/assignments/media-types/application/http)才能找到的。  
   此类型包含的http请求包含在binary消息体中，在邮件协议传输中需要指明Content-Transfer-Encoding。   
   在批量处理请求时会遇到，其表现如下：  

```js
--batch_0123456789
Content-Type: application/http
Content-ID: 
// 必须的字段，表明传送内容的编码格式 即二进制流
Content-Transfer-Encoding: binary

POST https://www.googleapis.com/analytics/v3/management/accounts/XXXXXX/webproperties/UA-XXXXXX-1/customDimensions
Content-Type: application/json
Content-Length: 68

{
 "name": "Campaign Group",
 "scope": "SESSION",
 "active": true
} 
```    
    
#### multipart类型
正如上文所述，multipart一般对应单个消息头对应多个消息体。
常见语法如下:

```js
Content-Type: multipart/mixed; boundary=gc0p4Jq0M2Yt08jU534c0p
```  

其中boundary字段是必须的，用于区分消息体中的数据边界，一般是两个'-'的格式作为该端的开头，例如：

```js
--gc0p4Jq0M2Yt08jU534c0p
```


我们主要关注的也就是下面几种：  

* **multipart/form-data**
  见上面application部分。下面这几部分可能不是那么常见，不过还是可以了解一下，以免遇到的时候懵逼。  
  
* **multipart/mixed**    
  该类型用于，消息体由多个独立的部分组成且想连续的展示。并且子数据类型有任一种无法被识别(此处指被浏览器直接识别的类型，例如text等)的类型时，都应该为mixed。  
概括而言就是该邮件有二进制内容，非可以直接识别的内容  
  
例如：

```js
POST /batch/farm/v1 HTTP/1.1
Authorization: Bearer your_auth_token
Host: www.googleapis.com
Content-Type: multipart/mixed; boundary=batch_foobarbaz
Content-Length: total_content_length

--batch_foobarbaz
// 子内容为http请求 不过是boundary编码过的
Content-Type: application/http
Content-ID: <item1:12930812@barnyard.example.com>

GET /farm/v1/animals/pony

--batch_foobarbaz
Content-Type: application/http
Content-ID: <item2:12930812@barnyard.example.com>

PUT /farm/v1/animals/sheep
Content-Type: application/json
Content-Length: part_content_length
If-Match: "etag/sheep"

{
  "animalName": "sheep",
  "animalAge": "5"
  "peltColor": "green",
}

--batch_foobarbaz
Content-Type: application/http
Content-ID: <item3:12930812@barnyard.example.com>

GET /farm/v1/animals
If-None-Match: "etag/animals"

--batch_foobarbaz--
```
这里消息体中的内容就是http请求，在google批量接口协议中用使用。
   
* **multipart/alternative**   
  该类型与mixed的语法相同，但语义不同。其表明，消息体中的不同部分应该是相同信息的不同版本。即内容相同传输类型不同，以适应不同的接受者。  
还是举例：  

```js 
From:  Nathaniel Borenstein <nsb@bellcore.com> 
To: Ned Freed <ned@innosoft.com> 
Subject: Formatted text mail 
MIME-Version: 1.0 
Content-Type: multipart/alternative; boundary=boundary42 


--boundary42 
Content-Type: text/plain; charset=us-ascii 

...plain text version of message goes here.... 

--boundary42 
Content-Type: text/richtext 

.... richtext version of same message goes here ... 
--boundary42 
Content-Type: text/x-whatever 

.... fanciest formatted version of same  message  goes  here 
... 
--boundary42-- 
```   
假如用户的系统可以识别 text/x-whatever 类型，那么其将会只看到这一部分。不同的用户看到什么内容取决于其系统支持何种类型。   
  
## 结束语
### 参考
[https://developers.google.com/drive/api/v3/batch?hl=zh-cn](https://developers.google.com/drive/api/v3/batch?hl=zh-cn)   
[https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)  
[https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html](https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html)  
  
到这里常见的content-type就介绍完了，感谢以上参考文章，此外水平有限可能有错误之处欢迎指出。对于前端同学来说，网络请求也是我们需要关注的部分，提升深度的同时也要注意落款广度，希望对有需要的同学有所裨益。