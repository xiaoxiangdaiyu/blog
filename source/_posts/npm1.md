---
title: npm进阶命令知多少(一)
date: 2020-09-06
---
## 前言
作为前端模块化扎展现形式的npm包，已经在前端开发中不可或缺，熟练掌握npm相关内容，也是前端开发者的一门必修课，那么除了npm publish这类常见内容之外，还有哪些内容需要我们关注呢，下面就一起深入看看。
<!-- more -->
## npm publish 发布npm包
该命令简单粗暴，执行之后，就会将相关文件上传到远端，并为对应包新增一个对应版本号。那么这里的**相关文件**和**对应版本**具体是哪些呢，不知道大家有没有关注过。
 
### 发布哪些文件
一个指令爽的飞起，包发布完成了，问题是发了什么上去呢，万一有些不能对外暴露的文件被download下去，问题可能就大了。因此npm允许开发者通过配置来指定待发布内容。
可以分为以下几种情况来指定:

1. 当前包目录下，只要.npmignore存在，那么以.npmignore为准，没有被.npmignore忽略的内容都会被上传，即使.gitignore已经忽略该文件。毕竟是专用配置文件，优先级最高。
2. 不存在.npmignore，但有.gitignore，会以.gitignore为准。这里也说得过去，一般无需通过git进行管理的文件，一般是无关内容，例如.vscode等环境配置相关。
   例如，[vue就只有](https://github.com/vuejs/vue/blob/dev/.gitignore) .gitignoe   大家可以看下安装的包里面存不存在相关文件。
3. 没有.gitignore 或者 .npmignore，上所有文件都会上传。
4. 有一种情况例外，package.json中存在files字段，可以理解为files为白名单，ignore文件为黑名单。
   ```js
   files:["src","types"]
   ```
这里有个问题：当.npmignore和files内容冲突时，那个优先级高呢。**答案是以files为准**,
可以通过npm pack 命令进行本地测试：

```js
// .npmignore
.DS_Store
node_modules
.gobble*
dist
src
// package.json
"files": [
    "src",
    "dist",
    "README.md"
  ]
// 打包测试
npm pack  
```
项目根目录下会生成一个压缩包这就是将要上传的文件内容，打开后可以发现，src文件夹是存在的。

**举个栗子**
 再举个比较明显的例子，[vue@2.6.12](https://github.com/vuejs/vue/tree/v2.6.12) 其配置如下：
 
 ```js
 //files
 "files": [
    "src",
    "dist/*.js",
    "types/*.d.ts"
  ]
  // .gitignore
  .DS_Store
node_modules
*.log
explorations
TODOs.md
dist/*.gz
dist/*.map
dist/vue.common.min.js
test/e2e/reports
test/e2e/screenshots
coverage
RELEASE_NOTE*.md
dist/*.js
packages/vue-server-renderer/basic.js
packages/vue-server-renderer/build.js
packages/vue-server-renderer/server-plugin.js
packages/vue-server-renderer/client-plugin.js
packages/vue-template-compiler/build.js
.vscode
 ```
这样的话，vue对外开放的npm包中，只包含有files定义的文件和package.json、README.md这些文档类文件。   

为什么有额外这些文档类呢，原因在于这些信息传递的文件，npm是规定不允许忽略的，只有存在就会上传：

* package.json
* README (and its variants)
* CHANGELOG (and its variants)
* LICENSE / LICENCE


**ignore语法格式**
.npmignore语法跟.gitignore相同，上面的例子也体现出了相关语法，这里就不粘贴了。

   
**至于什么样的文件夹可以被认定为包目录**： 
[这里的定义比较复杂](https://docs.npmjs.com/using-npm/developers)

常见的就是包含有package.json的文件夹，我们记住这个就行了。  

具体到实际开发中，monorepo那种单仓库多包的形式，每个子包显然也是一个包目录，可以进行独立的npm包管理行为。  

举个例子：
 
* [vue下的packages的vue-template-compiler](https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler) ，就是单独发布为一个vue-template-compiler包的。
* 根目录发布为vue包，忽略掉了packages下的一些内容
#### 总结
这一小段的核心就是，指定需要上传的文件时有两种方式：
1. 白名单形式： files字段，优先级最高，该字段以外的文件，除了信息类，其他的都忽略。
   适用于，文件夹多，需要上传的文件夹少的情况，例如vue这种。
2. 黑名单形式: .npmignore 或.gitignore， npmignore优先级较高。
3. 都不指定，包目录下所有内容都上传。

### 发布什么版本
明确了发布的内容之后，发布的版本也是有要求的。通用的就是[遵循语义化版本规范](https://semver.org/lang/zh-CN/ )，部分内容摘抄如下：

```js
版本格式：主版本号.次版本号.修订号，

版本号递增规则如下：

主版本号：当你做了不兼容的 API 修改，

次版本号：当你做了向下兼容的功能性新增，

修订号：当你做了向下兼容的问题修正。

先行版本号及版本编译元数据可以加到“主版本号.次版本号.修订号”的后面，作为延伸。

先行版本：

alpha: 内部版本

beta: 公测版本

rc: 即Release candiate，正式版本的候选版本

```
作为业界公认的规范，只有大家都遵循之后，才能形成整个生态的统一和谐，否则一方升级版本之后，使用者都不敢跟进，那么就不要谈以后的发展了。

**版本哪里来**
版本通过package.json里面的version字段来确定：

```js
 "version": "1.0.0",
```

每一版本号是唯一的，假如发布了1.0.0,下次更新必须要进行更新，否则会提醒。

```js
npm ERR! [forbidden]cannot modify pre-existing version: 1.0.1
```

**自动更新**
有人说，每次都要手动更新版本太麻烦，或者万一改错了就不好了。  是否有命令行可以替我自动执行这些操作。   

这里要说一下，因为版本的确定还是一个依赖于内容决定的主观性动作，所以不可能全自动的通过工具实现，谁知道你改的内容是否向下兼容，这里作为开发者要有自己的判断。   

因此只能实现个半自动操作:

```js
npm version  opt
// 这里opt 的取值如下，跟语义化版本是对应的。
patch, minor, major, prepatch, preminor, premajor, prerelease
```
官方解释：
Run this in a package directory to bump the version and write the new data back to package.json, package-lock.json, and, if present, npm-shrinkwrap.json.

不仅会根据指令自动升级版本，升级幅度为1。而且会回写到下面文件中package.json, package-lock.json, and, if present, npm-shrinkwrap.json。  
这里有个点需要注意，如果是在git仓库下，还会自动创建一个版本commit和tag，可以通过下面的指令避免：

```js
npm --no-git-tag-version version
```
举个例子： 

```js
// 当前版本 1.0.0
 "version": "1.0.0",
// 升级大版本好
npm version major
// 执行后当前结果
 "version": "2.0.0",
```
#### 总结
这一节的重点就在于介绍了升级版本的半自动操作，虽然本地开发时看起来半自动提升不明显。
但是在ci/cd中，就可以结合git，实现升版本，push代码的联合操作。
避免忘记修改版本重新发布的情况。  

### 谁来发布
前面讲到了发布npm的直接一步，但这之前还需要个前置步骤。那就是登录了，否则作为一个成熟的系统，游客随便就进行修改操作了，那也太可怕了。
   
常规操作：

```js
npm login
-> npm login
Username: 
Password:
Email: (this IS public)
```

依次执行就可以了，假如不确定是否登录，可以通过查看命令来看： 

```js
npm whoami
```
登录完成之后，不一定可以发布指定包，需要具备权限（这也是要我们登录的原因，鉴权嘛），假如没有，可以让有权限的同学通过下面命令添加： 
```js
// 给zhangshan增加pkg1 包的发布权限
npm owner add zhangshan pkg1
```

假如某一天登录态过期了，那么我们又要重新执行这些操作了。那么是否可以有方式配置自己的登录态呢，这就要依赖.npmrc这个文件了。
#### npmrc
npm的配置文件，相关配置项可以参考：[https://www.npmjs.cn/misc/config/](https://www.npmjs.cn/misc/config/)  
例如我们常见的修改为淘宝源，除了通过如下命令行的形式外：

```js
npm config set registry https://registry.npm.taobao.org
```
还可以通过.npmrc来配置

#### .npmrc的位置
作为基本的配置项，npm的设置还是非常灵活的，允许用户自定义来满足定制化需求，但是用户一般只会修改几项，所以一般我们会遇到四个是.npmrc的文件： 
 
* 每个项目的配置文件，位置是： (/path/to/my/project/.npmrc)
* 每个用户的配置文件，位置是：(~/.npmrc)
  因为每个计算机可以有多个用户。
* 全局配置文件，位置是 ($PREFIX/etc/npmrc)
* npm 内置配置文件，位置是 (/path/to/npm/npmrc)
  全局都有了，为啥还有个内置呢，避免不完全修改，做个备份。
  
**这四个文件的优先级是自上而下组件减小的** 
这样也可以理解，用户的修改项目本地文件是最低成本且不会造成其他影响的，所以优先级最高，npm内置的优先级最低。

其内容都是key-value的形式。
举个例子：

```js
// 随手从网上找了个：
prefix=D:\Program Files\nodejs\node_global
cache=D:\Program Files\nodejs\node_cache
registry=https://registry.npm.taobao.org
```
假如要修改用户名，在其中进行修改即可。  

## 结束语
本来想一篇就把npm的相关内容介绍完毕，没想到随便展开一下就很多了，本文就到这里吧，其他的后面再行更新。本文是一篇学习笔记，部分内容没有展开讲，有兴趣的同学可以直接[官网深究](https://docs.npmjs.com/cli-documentation/)。  
因为精力和能力有限，如果有疏漏，忘不吝指正。



