var os = require('os')
var fs = require('fs')
var path = require('path')
var FsUtils = require('../../utils/FsUtils')
var http = require('../../apiserver/utils/HttpClient')
var ipcRenderer = require('electron').ipcRenderer

function initPage (Vue) {
  return {
    template: FsUtils.getHtmlString(__dirname, '/HomePage.html'),
    data: function () {
      return {
        feedback: '提出反馈意见',
        welcome_title: '欢迎来到GeeCode!',
        welcome_con1:
          '当启用跟踪光标时，我们将在您键入时自动显示文档，并在编辑器中单击。!',
        welcome_con2: '您也可以在上面的框中手动搜索表达式。!',
        btnTitle1: '文档跟随光标',
        btnTitle2: '点击跟随光标',
        value: '',
        keyList: [],
        isShow: false,
        newKeyList: [],
        libg: {
          background: '#000'
        },
        mainShow: {
          main: true,
          show: false
        },
        welcomeObj: {
          welcome: true,
          hide: false
        },
        title_btn_leftObj: {
          title_btn_left: true,
          disable: true
        },
        title_btn_rightObj: {
          title_btn_right: true,
          disable: true
        },
        isbtn: false,
        history: [],
        historyIndex: 0,
        list: {},
        readDoc: {
          title: '描述',
          readDocTitle: '',
          readDocType: '',
          description_text: '',
          description_html: ''
        },
        signatures: {
          title: '签名',
          args: []
        },
        parameters: {
          title: '参数',
          args: []
        },
        keyChildren: {
          title: '子类',
          children: []
        },
        kwarg: {
          title: '**KWDS',
          kwarg_parameters: []
        },
        iskwargActive: 'Expand',
        iskwarg: false,
        listLength: 5,
        see: '',
        seeHide: false,
        color: '#296EB3',
        mainHeight: 550,
        screenHeight: document.body.clientHeight,
        // 备用
        active: '',
        httpHref: 'http://geecall.com',
        timer: 0,
        total_members: 0,
        tip: false,
          isSearchInputing:false
      }
    },
    created: function () {
      ipcRenderer.send('ClientSetIsAutoSearch', this.isbtn)
      ipcRenderer.on('ClientAutoSearch', this.onClientAutoSearch)
      // // console.log(123)
      // this.$router.push('login')
    },
    mounted: function () {
      // this.isDisplay()
      // this.getData('json')
      this.getMainHeight()
      this.tip = this.$tip
      this.pluginsName()
    },
    computed: {
      notFound: function () {
          if (!this.isSearchInputing) {
              return false;
          }
          if (this.keyList.length === 0) {
              return true;
          }
          return false;
      }
    },
    methods: {
      // 光标跟踪
      onClientAutoSearch: function (e, p_name_s) {
        this.value = ''
        this.active = p_name_s
        this.clickGetData()
      },
      // 在页面加载时,判断是否有数据
      isDisplay: function () {
        var vm = this
        // console.log(JSON.stringify(this.list) === '{}')
        if (this.keyChildren.length > 1) {
          vm.isShow = false
          vm.mainShow.show = false
          vm.welcomeObj.hide = false
        } else {
          vm.isShow = true
          vm.mainShow.show = true
          vm.welcomeObj.hide = true
        }
      },
      // 历史记录左按钮
      title_btn_left: function (key, btn) {
        var vm = this
        var index = this.history.lastIndexOf(key)
        console.log(key)
        console.log(this.history)
        if (index !== -1) {
          vm.historyIndex--
          if (vm.historyIndex < 1 && vm.historyIndex >= 0) {
            vm.title_btn_leftObj.disable = true
            vm.title_btn_rightObj.disable = false
            vm.getHistoryData(vm.historyIndex)
            return
          }
          vm.title_btn_rightObj.disable = false
          vm.getHistoryData(vm.historyIndex)
          return
        }
      },
      // 历史记录右按钮
      title_btn_right: function (key, btn) {
        console.log(key)
        var vm = this
        var index = this.history.indexOf(key)
        // console.log(this.history)
        // console.log(index)
        if (index !== -1) {
          vm.historyIndex++
          console.log(vm.historyIndex)
          if (vm.historyIndex === vm.history.length - 1) {
            vm.title_btn_leftObj.disable = false
            vm.title_btn_rightObj.disable = true
            vm.getHistoryData(vm.historyIndex)
            return
          }
          vm.title_btn_leftObj.disable = false
          vm.getHistoryData(vm.historyIndex)
          return
        }
      },
      // 判断当前的历史记录在什么位置
      historicalPosition: function (key, btn) {
        var vm = this
        var index = 0
        if (btn === 'left') {
          index = this.history.lastIndexOf(key)
          console.log(this.history)
          console.log(vm.historyIndex)
          if (index !== -1) {
            vm.historyIndex--
            // vm.judgementClick(index)
            if (vm.historyIndex < 1 && vm.historyIndex >= 0) {
              vm.title_btn_leftObj.disable = true
              vm.title_btn_rightObj.disable = false
              // vm.list.name = this.history[vm.historyIndex]
              return vm.historyIndex
            }
            vm.title_btn_rightObj.disable = false
            // this.list.name = this.history[vm.historyIndex]
            return vm.historyIndex
          }
        } else if (btn === 'right') {
          index = this.history.indexOf(key)
          // console.log(this.history)
          // console.log(index)
          if (index !== -1) {
            vm.historyIndex++
            // vm.judgementClick(index)
            if (vm.historyIndex === vm.history.length - 1) {
              vm.title_btn_leftObj.disable = false
              vm.title_btn_rightObj.disable = true
              // this.list.name = this.history[vm.historyIndex]
              return vm.historyIndex
            }
            vm.title_btn_leftObj.disable = false
            // this.list.name = this.history[vm.historyIndex]
            return vm.historyIndex
          }
        }
      },
      // 获取历史记录的数据
      getHistoryData: function (index) {
        var vm = this
        var key = this.history[index]
          this.isSearchInputing = false;
        this.$http().ajax({
          url: vm.httpHref + '/clientapi/ReadDoc',
          type: 'get',
          data: {
            full_api: key
          },
          dataType: 'text',
          success: function (result1) {
            console.log(JSON.parse(result1))
            var result = JSON.parse(result1)
            if (result1 === '{}' || result1 === '[]') {
              vm.readDoc.readDocTitle = key
              vm.readDoc.readDocType = ''
              vm.readDoc.description_text = ''
              vm.readDoc.description_html = ''
              vm.signatures = {}
              vm.parameters = {}
              vm.keyChildren = {}
              vm.kwarg = {}
              return
            }

            vm.readDoc = {
              title: '描述',
              readDocTitle: '',
              readDocType: '',
              description_text: '',
              description_html: ''
            }
            vm.signatures = {
              title: '其他人怎么用这个',
              func: '',
              args: []
            }
            vm.parameters = {
              title: '参数',
              args: []
            }
            vm.keyChildren = {
              title: '子类',
              children: []
            }
            vm.kwarg = {
              title: '**KWDS',
              kwarg_parameters: []
            }

            if (result.symbol.value[0].details.module) {
              vm.keyChildren.children =
                result.symbol.value[0].details.module.members
              // console.log(vm.keyChildren)
              // if (vm.keyChildren.children.length >= 5) {
              //   vm.see = 'See ' + (vm.keyChildren.children.length - 5) + ' more members in this module'
              // }
              vm.total_members =
                result.symbol.value[0].details.module.total_members
              vm.see =
                'See ' +
                (vm.total_members - 5) +
                ' more members in this module'
            }

            if (result.symbol.value[0].details.type) {
              vm.keyChildren.children =
                result.symbol.value[0].details.type.members
              // console.log(vm.keyChildren)
              // if (vm.keyChildren.children.length >= 5) {
              //   vm.see = 'See ' + (vm.keyChildren.children.length - 5) + ' more members in this module'
              // }
              vm.total_members =
                result.symbol.value[0].details.type.total_members
              vm.see =
                'See ' +
                (vm.total_members - 5) +
                ' more members in this module'
            }

            if (result.symbol.value[0].details.function) {
              vm.signatures.func = result.symbol.name
              vm.signatures.args =
                result.symbol.value[0].details.function.signatures
              console.log(vm.signatures)
            }

            if (result.symbol.value[0].details.function) {
              vm.kwarg.kwarg_parameters =
                result.symbol.value[0].details.function.language_details.python.kwarg_parameters
            }

            if (result.symbol.value[0].details.function) {
              vm.parameters.args =
                result.symbol.value[0].details.function.parameters
              vm.parameters.title = '参数'
              if (
                JSON.stringify(vm.kwarg.kwarg_parameters) !== '[]' &&
                vm.kwarg.kwarg_parameters
              ) {
                vm.parameters.args.push({
                  name: '**kwds',
                  language_details: {
                    python: {
                      default_value: null
                    }
                  }
                })
              }
              console.log(vm.parameters.args)
            } else {
              vm.parameters = {}
            }

            vm.readDoc.readDocTitle = result.symbol.value[0].repr
            vm.readDoc.readDocType = result.symbol.value[0].kind
            vm.readDoc.description_text = result.report.description_text
            vm.readDoc.description_html = result.report.description_html

            vm.setLink()
            vm.iskwarg = false
            // console.log(vm.kwarg)
          }
        })
      },
      // 显示关键字的全部成员
      moreClick: function () {
        var vm = this
        this.seeHide = !this.seeHide
        if (this.seeHide) {
          this.see = '...hide'
          this.$http().ajax({
            url: vm.httpHref + '/clientapi/ReadMembers',
            type: 'get',
            data: {
              full_api: vm.readDoc.readDocTitle
            },
            dataType: 'json',
            success: function (result) {
              console.log(123465)
              console.log(result)
              if (JSON.stringify(result) !== '[]') {
                // vm.keyChildren.children = result
                // var newArr = []
                vm.keyChildren.children = []
                for (var i = 0; i < result.length; i++) {
                  // console.log(result[i].id)
                  var index = result[i].id.indexOf('.')
                  var name = result[i].id.slice(index + 1)
                  vm.keyChildren.children.push({
                    name: name,
                    value: [
                      {
                        kind: result[i].kind,
                        repr: result[i].id
                      }
                    ]
                  })
                }
                // vm.keyChildren.children = newArr
                vm.total_members = result.length - 1
                vm.listLength = vm.total_members
              }
            }
          })
        } else {
          this.see =
            'See ' + (vm.total_members - 5) + ' more members in this module'
          this.listLength = 5
        }
      },
      // 点击显示KWDS
      kwargActive: function () {
        this.iskwarg = !this.iskwarg
        if (this.iskwarg) {
          this.iskwargActive = 'Collapse'
        } else {
          this.iskwargActive = 'Expand'
        }
      },
      // 头部跟随光标按钮事件
      btnClick: function () {
        this.isbtn = !this.isbtn
        ipcRenderer.send('ClientSetIsAutoSearch', this.isbtn)
        if (this.isbtn) {
          // this.$refs.before.style.background = 'url("/../assets/img/browse.png")'
          this.color = '#181F25'
          this.btnTitle1 = '点击跟随光标'
        } else {
          // this.$refs.before.style.background = 'url("/../assets/img/zanting.png")'
          this.color = '#296EB3'
          this.btnTitle1 = '文档跟随光标'
        }
      },
      // 头部搜索框input事件--模糊查询
      searchClick: function () {
        var vm = this
        var key = this.value
        if (key.length === 0) return
        console.log(456)
          this.isSearchInputing = true;
        this.$http().ajax({
          url: vm.httpHref + '/clientapi/SearchApi',
          type: 'get',
          data: {
            keyword: key
          },
          dataType: 'json',
          success: function (result) {
            vm.keyList = result
            console.log(result)
            if (vm.keyList[0]) {
              vm.active = vm.keyList[0]
            }
          }
        })
      },
      // 监听a链接打开外部默认浏览器
      setLink: function () {
        // this.$nextTick(function() {
        //   var { shell } = require("electron");
        //   var exLinkBtn = document.querySelector(".external_link");
        //   console.log(exLinkBtn)
        //   if (!exLinkBtn) return;
        //   exLinkBtn.addEventListener("click", function(e) {
        //     e.preventDefault();
        //     var href = exLinkBtn.hash.slice(1);
        //     console.log(href)
        //     shell.openExternal(href);
        //   });
        // });
      },
      // 监听用户是否点击页面中的关键字
      descriptionKey: function (e) {
        // console.log(e)
        var node = e.target
        // console.dir(node);
        if (node.tagName === 'A' && node.className === 'internal_link') {
          console.log(node.innerText)
          var key = node.innerText
          this.getData(key)
          this.list.name = key
          this.title_btn_leftObj.disable = false
          this.title_btn_rightObj.disable = true
          this.historyIndex++
          this.history.splice(this.historyIndex, this.history.length - 1)
        }
        console.dir(node)
        if (node.classList[0] === 'external_link') {
          var {shell} = require('electron')
          var href = node.hash.slice(1)
          console.log(href)
          shell.openExternal(href)
        }
      },
      // popular子类关键字点击事件
      popularClick: function (item) {
        var key = item.value[0].repr ? item.value[0].repr : item.id
        console.log(key)
        this.list.name = key
        this.getData(key)
        this.title_btn_leftObj.disable = false
        this.title_btn_rightObj.disable = true
        this.historyIndex++
        this.history.splice(this.historyIndex, this.history.length - 1)
      },
      // 根据关键字获取数据
      getData: function (key) {
        if (!key) return
        var vm = this
          this.isSearchInputing = false;
        this.$http().ajax({
          url: vm.httpHref + '/clientapi/ReadDoc',
          type: 'get',
          data: {
            full_api: key
          },
          dataType: 'text',
          success: function (result1) {
            console.log(JSON.parse(result1))
            var result = JSON.parse(result1)
            if (result1 === '{}' || result1 === '[]') {
              vm.history.push(key)
              vm.readDoc.readDocTitle = key
              vm.readDoc.readDocType = ''
              vm.readDoc.description_text = ''
              vm.readDoc.description_html = ''
              vm.signatures = {}
              vm.parameters = {}
              vm.keyChildren = {}
              vm.kwarg = {}
              return
            }

            vm.readDoc = {
              title: '描述',
              readDocTitle: '',
              readDocType: '',
              description_text: '',
              description_html: ''
            }
            vm.signatures = {
              title: '其他人怎么用这个',
              func: '',
              args: []
            }
            vm.parameters = {
              title: '参数',
              args: []
            }
            vm.keyChildren = {
              title: '子类',
              children: []
            }
            vm.kwarg = {
              title: '**KWDS',
              kwarg_parameters: []
            }

            if (result.symbol.value[0].details.module) {
              vm.keyChildren.children =
                result.symbol.value[0].details.module.members
              // console.log(vm.keyChildren)
              // if (vm.keyChildren.children.length >= 5) {
              //   vm.see = 'See ' + (vm.keyChildren.children.length - 5) + ' more members in this module'
              // }
              vm.total_members =
                result.symbol.value[0].details.module.total_members
              vm.see =
                'See ' +
                (vm.total_members - 5) +
                ' more members in this module'
            }

            if (result.symbol.value[0].details.type) {
              vm.keyChildren.children =
                result.symbol.value[0].details.type.members
              // console.log(vm.keyChildren)
              // if (vm.keyChildren.children.length >= 5) {
              //   vm.see = 'See ' + (vm.keyChildren.children.length - 5) + ' more members in this module'
              // }
              vm.total_members =
                result.symbol.value[0].details.type.total_members
              vm.see =
                'See ' +
                (vm.total_members - 5) +
                ' more members in this module'
            }

            if (result.symbol.value[0].details.function) {
              vm.signatures.func = result.symbol.name
              vm.signatures.args =
                result.symbol.value[0].details.function.signatures
              console.log(vm.signatures)
            }

            if (result.symbol.value[0].details.function) {
              vm.kwarg.kwarg_parameters =
                result.symbol.value[0].details.function.language_details.python.kwarg_parameters
            }

            if (result.symbol.value[0].details.function) {
              vm.parameters.args =
                result.symbol.value[0].details.function.parameters
              vm.parameters.title = '参数'
              if (
                JSON.stringify(vm.kwarg.kwarg_parameters) !== '[]' &&
                vm.kwarg.kwarg_parameters
              ) {
                vm.parameters.args.push({
                  name: '**kwds',
                  language_details: {
                    python: {
                      default_value: null
                    }
                  }
                })
              }
              console.log(vm.parameters.args)
            } else {
              vm.parameters = {}
            }

            vm.readDoc.readDocTitle = result.symbol.value[0].repr
            vm.readDoc.readDocType = result.symbol.value[0].kind
            vm.readDoc.description_text = result.report.description_text
            vm.readDoc.description_html = result.report.description_html

            vm.setLink()
            vm.iskwarg = false
            vm.history.push(key)
            // console.log(vm.kwarg)
          }
        })

        vm.isDisplay()

        vm.isShow = true
      },
      // 主体滚动条事件
      getMainHeight: function () {
        this.$nextTick(function () {
          var that = this
          var reEvt =
            'orientationchange' in window ? 'orientationchange' : 'resize'
          var reFontSize = function () {
            var clientH =
              document.documentElement.clientHeight ||
              document.body.clienHeigth
            if (!clientH) {
              return
            }
            that.mainHeight = clientH - 140
          }
          window.addEventListener(reEvt, reFontSize)
          // DOMContentLoaded->dom加载完就执行,onload要dom/css/js都加载完才执行
          document.addEventListener('DOMContentLoaded', reFontSize)
        })
      },
      // 为选中的li加active样式
      selectedLi: function (name) {
        var list = this.$refs.list.children
        for (var i = 0; i < list.length; i++) {
          list[i].className = ''
        }
        this.active = name
      },
      // 键盘上下切换选中li
      moveCursor: function (type) {
        this.$nextTick(function () {
          var list = this.$refs.list.children
          for (var i = 0; i < list.length; i++) {
            if (list[i].className == 'active') {
              if (type == 'up' && i != 0) {
                list[i].className = ''
                list[i - 1].className = 'active'
                this.active = list[i - 1].innerText
                return
              } else if (type == 'down' && i < list.length - 1) {
                list[i].className = ''
                list[i + 1].className = 'active'
                this.active = list[i + 1].innerText
                return
              }
            }
          }
        })
      },
      //esc取消列表和搜索内容
      cancleList: function () {
        this.value = ''
        this.active = 'josn'
      },
      //tab自动补齐
      tabComplet: function (e) {
        console.log(123)
        this.value = this.active
        console.log(this.active)
      },
      // 回车事件
      keyGetData: function () {
        // console.log(123)
        this.value = this.active
        var key = this.value
        this.getData(key)
        if (this.history.length < 1) {
          this.title_btn_leftObj.disable = true
          this.title_btn_rightObj.disable = true
          this.historyIndex = 0
          // console.log(123)
        } else {
          this.title_btn_leftObj.disable = false
          this.title_btn_rightObj.disable = true
          this.historyIndex++
        }
        this.list.name = key
        this.history.splice(this.historyIndex, this.history.length - 1)
        this.keyList = []
        // this.value = ''
      },
      // 点击事件
      clickGetData: function () {
        var vm = this
        if (vm.timer) {
          clearTimeout(vm.timertimer)
          vm.timer = 0
          // console.log(vm.timertimer)
        } else {
          vm.timer = setTimeout(function () {
            vm.keyGetData()
          }, 100)
        }
      },
      // 底部跳转到设置页
      toSetting: function () {
        var vm = this
        vm.$router.push('setting')
      },
      // 读取插件名称
      pluginsName: function () {
        var vm = this
        fs.readdir(path.join(__dirname, '../../assets/app-plugins'), (err, files) => {
          if (err) throw err
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
            vm.tip = false
          } else {
            console.log('无插件')
            vm.tip = true
            vm.$tip = true
          }
        })
      }
    }
  }
}

module.exports = {
  initPage: initPage
}

