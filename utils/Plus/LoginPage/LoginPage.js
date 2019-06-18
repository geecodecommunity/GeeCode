var path = require('path')
var os = require('os')
var fs = require('fs')
var process = require('child_process')
var regedit = require('regedit')
var FsUtils = require('../../FsUtils')
var md5 = require('../../../assets/lib/md5.min')
var session = require('electron').remote.session
var ipcRenderer = require("electron").ipcRenderer;

function initPage (Vue) {
  return {
    template: FsUtils.getHtmlString(__dirname, 'LoginPage.html'),
    data: function (params) {
      return {
        block: false,
        set: true,
        number: '',
        password: '',
        verification: '',
        verificationCon: '获取验证码',
        disabled: false,
        countdown: 60,
        httpHref: 'http://geecall.com',
        // httpHref: "http://192.168.50.33:8080",
        message: '',
        islogo: true,
        currentPage: 'register',
        plName: '',
        plUrl: '',
        isVscode: false,
        isPlugin: false,
        checkVsIpt: false,
        checkPluginIpt: false,
        vsRow: true,
        gcRow: true,
        mask: true
      }
    },
    created: function () {

    },
    mounted: function () {
      // this.clearCookies()
      this.hasPlugin()
      this.isCookie()
    },
    methods: {
      // 展示页面
      show: function (name) {
        if (this.currentPage === name) {
          return true
        }
      },
      // 点击按钮获取验证码
      loginPageVerification: function () {
        // console.log(123)
        // this.setTime(this);
        var vm = this
        var reg = /^1[3456789]\d{9}$/
        var zg = '0086'
        var num = this.number.replace(/(^\s*)|(\s*$)/g, '')
        if (reg.test(num)) {
          console.log(zg + num)
          zg += num

          this.setTime(this)

          // http.sendPostRequest(vm.httpHref + '/sendMessage', {
          //     userPhone: zg
          // }).then(function (msg) {
          //     console.log(msg);
          // })

          this.$http().ajax({
            url: vm.httpHref + '/sendMessage',
            type: 'post',
            data: {
              userPhone: zg
            },
            success: function (msg) {
              console.log(msg)
            }
          })
        } else {
          // alert("手机号码有误，请重填");
          vm.message = '手机号码有误，请重填'
          return false
        }
      },
      // 验证码倒计时
      setTime: function () {
        var vm = this
        if (vm.countdown === 0) {
          vm.disabled = false
          vm.verificationCon = '获取验证码'
          vm.countdown = 60
        } else {
          vm.disabled = true
          vm.verificationCon = +vm.countdown + '秒'
          vm.countdown--
          setTimeout(function () {
            vm.setTime(vm)
          }, 1000)
        }
      },
      // 点击按钮注册账号
      loginPageBtn: function () {
        var vm = this
        vm.message = ''
        var zg = '0086'
        var num = vm.number.replace(/(^\s*)|(\s*$)/g, '')
        zg += num
        var pw = vm.password
        var verification = vm.verification

        var requestJSONObject = {
          userPhone: zg,
          userPassword: md5(pw),
          userPasswordM: pw,
          messageCode: verification,
          userName: zg
        }

        this.$http().ajax({
          url: vm.httpHref + '/register6',
          type: 'post',
          cache: false,
          data: JSON.stringify(requestJSONObject),
          dataType: 'json',
          success: function (result) {
            console.log(result)
            if (result.sc) {
              // console.log(123)
              // vm.$router.push('home')
              vm.loginPageIn()
            } else {
              // console.log(456)
              console.log(result.msg)
              vm.message = result.msg
            }
          }
        })
      },
      // 登录
      loginPageIn: function () {
        var vm = this
        vm.message = ''
        var pw = vm.password

        this.$http().ajax({
          url: vm.httpHref + '/login',
          type: 'post',
          cache: false,
          data: JSON.stringify({
            nameOrEmail: vm.number,
            userPassword: md5(pw)
          }),
          dataType: 'json',
          success: function (result) {
            if (result.sc) {
              // console.log(result)
              // vm.hasVscode()
              vm.setCookie('name', vm.number)
              vm.setCookie('pwd', pw)
              // add by luanhaipeng 把用户信息传给后台进程
              ipcRenderer.send("ClientSetUserInfo", {
                token: result.token,
                tokenName: result.tokenName,
                nameOrEmail: vm.number,
                JSESSIONID:result.JSESSIONID
              });
              vm.$router.push('home')
            } else {
              console.log(result)

              // alert(result.msg)
              vm.message = result.msg
            }
          }
        })
      },
      // 点击按钮显示登录或注册
      loginPageSet: function (name) {
        // this.set = !this.set;
        this.currentPage = name
        this.message = ''
      },
      // 跳过登录注册
      loginPageSkip: function () {
        // this.hasVscode()
        this.$router.push('home')
      },
      // 设置cookie
      setCookie: function (name, value) {
        var Days = 30
        var exp = new Date()
        var date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60
        var cookie = {
          url: 'http://www.geecode.co',
          name: name,
          value: value,
          expirationDate: date
        }
        session.defaultSession.cookies.set(cookie, (error) => {
          if (error) console.error(error)
        })
      },
      // 获取cookie
      getCookie: function () {
        var vm = this
        session.defaultSession.cookies.get({
          url: 'http://www.geecode.co'
        }, function (error, cookies) {
          if (error) return console.log(error)
          console.log(cookies)
          if (cookies.length > 0) {
            vm.number = cookies[0].value
            vm.password = cookies[1].value
            vm.$router.push('home')
            vm.loginPageIn()
          }
          vm.block = true
        })
      },
      // 清空cookie
      clearCookies: function () {
        session.defaultSession.clearStorageData({
          origin: 'http://www.geecode.co',
          storages: ['cookies']
        }, function (error) {
          if (error) console.error(error)
        })
      },
      // 判断cookie是否有账号密码缓存
      isCookie: function () {
        var vm = this
        vm.getCookie()
      },
      // 是否存在vscode
      hasVscode: function () {
        var vm = this
        regedit.list('HKCU\\Software\\Classes\\Applications\\Code.exe', function (err, result) {
          if (!result) { // 没有vs
            vm.islogo = false
            vm.currentPage = 'setup'
            vm.isVscode = false
            vm.checkVsIpt = true
            vm.checkPluginIpt = true
            vm.hasPlugin()
          } else { // 有vs
            vm.vsRow = false
            vm.isVscode = true
            vm.hasPlugin()
          }
        })
      },
      // 是否存在插件
      hasPlugin: function () {
        var vm = this
        var url = path.join(__dirname, '../../../assets/app-plugins')
        fs.readdir(url, (err, files) => {
          if (err) throw err
          vm.plName = files[0]
          var uname = os.userInfo().homedir
          var pluginPath = uname + '\\.vscode\\extensions'
          vm.plUrl = pluginPath
          vm.isPlugin = fs.existsSync(pluginPath + '\\' + files[0])
          if (vm.isPlugin) { // 有插件
            vm.startUp()
            vm.mask = false
          } else { // 没有插件
            if (fs.existsSync(uname + '\\.vscode')) {
              vm.copyFolder(url, pluginPath)
            } else {
              fs.mkdirSync(uname + '\\.vscode')
            }
            vm.copyFolder(url, pluginPath)
            vm.startUp()
            vm.mask = false
            // vm.islogo = false
            // vm.checkPluginIpt = true
            // vm.currentPage = 'setup'
          }
          // console.log(vm.isPlugin)
        })
      },
      // 启动vscode软件
      startUp: function () {
        var appUrl = path.join(__dirname, '../../../assets/app')
        fs.readdir(appUrl, (err, files) => {
          if (err) throw err
          var name = files[0] + '\\Code.exe'
          var url = '"' + appUrl + '\\' + name + '"'
          process.exec(url, (err, stdout, stderr) => {
            if (err) throw err
            console.log(stdout)
            process.exec("taskkill /f /t /im GeeCodeClient.exe")
          })
          console.log(appUrl + '\\' + files[0])
        })
      },
      // 点击安装
      install: function () {
        var vm = this
        // console.log(vm.isVscode)
        if (!vm.isVscode) { // 无vscode
          vm.installVscode()
        } else { // 有vscode
          vm.installPlugins()
        }
      },
      // 安装vscode
      installVscode: function () {
        process.exec(path.join(__dirname, '../../../assets/app/VSCodeUserSetup-x64-1.32.3.exe'))
        this.softwareAppLoading()
      },
      // 安装插件
      installPlugins: function () {
        var vm = this
        var url = path.join(__dirname, '../../../assets/app-plugins')
        // console.log('code --install-extension ' + url + '\\' + vm.plName)
        process.exec("code --install-extension " + url + "\\" + vm.plName, function (error, stdout, stderr) {
          if (error) {
            console.log(`stderr: ${stderr}`)
            console.error(`执行出错: ${error}`)
            return
          }
          // console.log(stdout
        })
        vm.installLoading()
      },
      // 复制文件夹
      copyFolder: function (from, to) {        // 复制文件夹到指定目录
        var vm = this
        var files = []
        if (fs.existsSync(to)) {           // 文件是否存在 如果不存在则创建
          files = fs.readdirSync(from)
          files.forEach(function (file, index) {
            var targetPath = from + '/' + file
            var toPath = to + '/' + file
            if (fs.statSync(targetPath).isDirectory()) { // 复制文件夹
              vm.copyFolder(targetPath, toPath)
            } else {                                    // 拷贝文件
              fs.copyFileSync(targetPath, toPath)
            }
          })
        } else {
          fs.mkdirSync(to)
          vm.copyFolder(from, to)
        }
      },
      // 删除文件夹
      deleteFolder: function (path) {
        var vm = this
        var files = []
        if (fs.existsSync(path)) {
          if (fs.statSync(path).isDirectory()) {
            files = fs.readdirSync(path)
            files.forEach(function (file, index) {
              var curPath = path + '/' + file
              if (fs.statSync(curPath).isDirectory()) {
                vm.deleteFolder(curPath)
              } else {
                fs.unlinkSync(curPath)
              }
            })
            fs.rmdirSync(path)
          } else {
            fs.unlinkSync(path)
          }
        }
      },
      // 安装vscode loading界面
      softwareAppLoading: function () {
        var vm = this
        regedit.list('HKCU\\Software\\Classes\\Applications\\Code.exe', (err, result) => {
          // console.log(result)
          if (result) {
            vm.mask = false
            vm.vscode = false
            vm.installPlugins()
            return
          } else {
            vm.mask = true
            vm.softwareAppLoading()
          }
        })
      },
      // 安装插件 loading界面
      installLoading: function (fileName) {
        var vm = this
        console.log(vm.plUrl)
        // 判断有没有插件文件夹
        fs.exists(vm.plUrl, function (exists) {
          // console.log(exists)
          if (exists) {
            console.log('有插件')
            vm.mask = false
            vm.$router.push('home')
            return
          } else {
            console.log('无插件')
            vm.mask = true
            vm.installLoading()
          }
        })
      }
    }
  }
}

module.exports = {
  initPage: initPage
}
