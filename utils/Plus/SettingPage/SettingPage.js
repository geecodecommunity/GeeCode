var process = require('child_process')
var os = require('os')
var fs = require('fs')
var path = require('path')
var regedit = require('regedit')
var FsUtils = require('../../FsUtils')

var pluginsArr1 = {
}

var pluginsArr2 = {
  vscode: {
    img: 'img1',
    name: 'Visual Studio Code'
  }
}

function initPage(Vue) {
  return {
    template: FsUtils.getHtmlString(__dirname, 'SettingPage.html'),
    data: function () {
      return {
        more: '更多设置',
        tisp: '监测到您还没有装VScode?',
        vsName: 'Visual Studio Code',
        vsBtn: '一键安装',
        vsimg: 'img1',
        vsTitle: 'Visual Studio Code (简称VS Code) 是一款免费开源的现代化轻量级代码编辑器,支持几乎所有主流的开发语言',
        vscode: false,
        pluginsTitle1: '已经安装的编辑器插件',
        pluginsTitle2: '支持的其他编辑器插件',
        pluginsBtn: '卸载插件',
        pluginsArr1: pluginsArr1,
        pluginsArr2: pluginsArr2,
        plName: '',
        plUrl: '',
        mask: true,
        tip: false
      }
    },
    mounted: function () {
      // this.software()
      // console.log(this.pluginsArr1)
      this.pluginsName()
      this.tip = this.$tip
    },
    methods: {
      // 返回home页面
      back: function () {
        this.$router.push('home')
      },
      // 判断是否有vscode软件
      software: function () {
        var vm = this
        regedit.list('HKCU\\Software\\Classes\\Applications\\Code.exe', (err, result) => {
          // console.log(result)
          if (result) {
            vm.vscode = false
            this.pluginsName()
          } else {
            vm.vscode = true
          }
        })
      },
      // 读取插件名称
      pluginsName: function () {
        var vm = this
        fs.readdir(path.join(__dirname, '../../../assets/app-plugins'), (err, files) => {
          if (err) throw err
          // console.log(files[0])
          vm.plName = files[0]
          var fileName = 'geecode-python.' + files[0].slice(0, files[0].length - 5)
          // console.log(fileName)
          vm.isPlugins(files[0])
        })
      },
      // 判断是否安装插件
      isPlugins: function (fileName) {
        var vm = this
        var url = os.userInfo().homedir + '\\.vscode\\extensions\\' + fileName
        vm.plUrl = url
        console.log(url)
        // 判断有没有插件文件夹
        fs.exists(url, function (exists) {
          console.log(exists)
          if (exists) {
            console.log('有插件')
            var obj = JSON.stringify(vm.pluginsArr2.vscode)
            console.log(obj)
            vm.mask = false
            if (!obj) return
            vm.$set(vm.pluginsArr1, 'vscode', JSON.parse(obj))
            // console.log(vm.pluginsArr1)
            delete vm.pluginsArr2.vscode
          } else {
            console.log('无插件')
            if (JSON.stringify(vm.pluginsArr1) !== '{}') {
              vm.$set(vm.pluginsArr2, 'vscode', vm.pluginsArr1.vscode)
              delete vm.pluginsArr1.vscode
            }
            vm.mask = false
          }
        })
        // console.log(stat)
      },
      // 卸载插件
      uninstallPlugins: function () {
        var vm = this
        vm.$set(vm.pluginsArr2, 'vscode', vm.pluginsArr1.vscode)
        delete vm.pluginsArr1.vscode
        // console.log(vm.plName)
        // var url = path.join(__dirname, '../../assets/app-plugins')
        // process.exec("code --uninstall-extension " + url + "\\" + vm.plName, function (error, stdout, stderr) {
        //   if (error) {
        //     console.log(`stderr: ${stderr}`)
        //     console.error(`执行出错: ${error}`)
        //     return
        //   }
        //   // console.log(stdout)
        // })
        vm.deleteFolder(vm.plUrl)
        vm.uninstallLoading()
      },
      // 安装插件
      installPlugins: function () {
        var vm = this
        vm.$set(vm.pluginsArr1, 'vscode', vm.pluginsArr2.vscode)
        delete vm.pluginsArr2.vscode
        // var url = path.join(__dirname, '../../assets/app-plugins')
        // process.exec("code --install-extension " + url + "\\" + vm.plName, function (error, stdout, stderr) {
        //   if (error) {
        //     console.log(`stderr: ${stderr}`)
        //     console.error(`执行出错: ${error}`)
        //     return
        //   }
        //   // console.log(stdout)
        // })
        var url = path.join(__dirname, '../../../assets/app-plugins')
        vm.installLoading()
      },
      // 安装vscode
      softwareApp: function () {
        process.exec(path.join(__dirname, '../../../assets/app/VSCodeUserSetup-x64-1.32.3.exe'))
        this.softwareAppLoading()
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
      // 删除插件目录
      deleteFolder: function (path) {
        var vm = this
        var files = [];
        if (fs.existsSync(path)) {
          files = fs.readdirSync(path)
          files.forEach(function (file, index) {
            let curPath = path + "/" + file
            if (fs.statSync(curPath).isDirectory()) {
              vm.deleteFolder(curPath)
            } else {
              fs.unlinkSync(curPath)
            }
          })
          fs.rmdirSync(path)
        }
      },
      // loading
      softwareAppLoading: function () {
        var vm = this
        regedit.list('HKCU\\Software\\Classes\\Applications\\Code.exe', (err, result) => {
          // console.log(result)
          if (result) {
            vm.mask = false
            vm.vscode = false
            return
          } else {
            vm.mask = true
            vm.softwareAppLoading()
          }
        })
      },
      uninstallLoading: function (fileName) {
        var vm = this
        console.log(vm.plUrl)
        // 判断有没有插件文件夹
        fs.exists(vm.plUrl, function (exists) {
          console.log(exists)
          if (exists) {
            console.log('有插件')
            vm.mask = true
            vm.uninstallLoading()
          } else {
            console.log('无插件')
            vm.mask = false
            return
          }
        })
      },
      installLoading: function (fileName) {
        var vm = this
        console.log(vm.plUrl)
        // 判断有没有插件文件夹
        fs.exists(vm.plUrl, function (exists) {
          console.log(exists)
          if (exists) {
            console.log('有插件')
            vm.mask = false
            vm.tip = true
            vm.$tip = true
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
