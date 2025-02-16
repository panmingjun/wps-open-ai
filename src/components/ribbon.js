import Util from './js/util.js'
import configUtil from './js/config.js'
import callOpenAi from './js/openai.js'

//这个函数在整个wps加载项中是第一个执行的
function OnAddinLoad(ribbonUI) {
  configUtil.reloadConfig()
  return true
}

//"sk-6eac4024aeae46629f34f2a706f09395"
const WRITE_BUSY='write_busy'

var WebNotifycount = 0
async function OnAction(control) {
  const eleId = control.Id
  switch (eleId) {
    case 'btnWrite': {
      Application.PluginStorage.setItem(WRITE_BUSY,true)
      window.Application.ribbonUI.InvalidateControl('btnWrite')

      try{
        var config=Application.PluginStorage.getItem("config")
        var apiUrl = "https://api.deepseek.com/beta/chat/completions";
        var model = 'deepseek-chat'
        'sk-6eac4024aeae46629f34f2a706f09395'
        var apiUrl=config.url
        var model=config.model

        await callOpenAi({
          apiUrl:apiUrl,
          apiKey:config.key,
          model:model,
          temperature:config.temperature,
          messgeFunc:text=>[{ "role": "user", "content": "续写内容" },
            { "role": "assistant", "content": text, "prefix": true }]
        })
      }finally{
        Application.PluginStorage.setItem(WRITE_BUSY,false)
        window.Application.ribbonUI.InvalidateControl('btnWrite')
      }

      break
    }
    case 'btnConfig': {
      
      window.Application.ShowDialog(
        Util.GetUrlPath() + Util.GetRouterHash() + '/config',
        '配置',
        400 * window.devicePixelRatio,
        400 * window.devicePixelRatio,
        false
      )
      break
    }
    case 'btnShowMsg':
      {
        const doc = window.Application.ActiveDocument
        if (!doc) {
          alert('当前没有打开任何文档')
          return
        }
        alert(doc.Name)
      }
      break
    case 'btnIsEnbable': {
      let bFlag = window.Application.PluginStorage.getItem('EnableFlag')
      window.Application.PluginStorage.setItem('EnableFlag', !bFlag)

      //通知wps刷新以下几个按饰的状态
      window.Application.ribbonUI.InvalidateControl('btnIsEnbable')
      window.Application.ribbonUI.InvalidateControl('btnShowDialog')
      window.Application.ribbonUI.InvalidateControl('btnShowTaskPane')
      //window.Application.ribbonUI.Invalidate(); 这行代码打开则是刷新所有的按钮状态
      break
    }
    case 'btnShowDialog': {
      window.Application.ShowDialog(
        Util.GetUrlPath() + Util.GetRouterHash() + '/dialog',
        '这是一个对话框网页',
        400 * window.devicePixelRatio,
        400 * window.devicePixelRatio,
        false
      )
      break
    }
    case 'btnShowTaskPane':
      {
        let tsId = window.Application.PluginStorage.getItem('taskpane_id')
        if (!tsId) {
          let tskpane = window.Application.CreateTaskPane(Util.GetUrlPath() + Util.GetRouterHash() + '/taskpane')
          let id = tskpane.ID
          window.Application.PluginStorage.setItem('taskpane_id', id)
          tskpane.Visible = true
        } else {
          let tskpane = window.Application.GetTaskPane(tsId)
          tskpane.Visible = !tskpane.Visible
        }
      }
      break
    case 'btnApiEvent':
      {
        let bFlag = window.Application.PluginStorage.getItem('ApiEventFlag')
        let bRegister = bFlag ? false : true
        window.Application.PluginStorage.setItem('ApiEventFlag', bRegister)
        if (bRegister) {
          window.Application.ApiEvent.AddApiEventListener('DocumentNew', 'ribbon.OnNewDocumentApiEvent')
        } else {
          window.Application.ApiEvent.RemoveApiEventListener('DocumentNew', 'ribbon.OnNewDocumentApiEvent')
        }

        window.Application.ribbonUI.InvalidateControl('btnApiEvent')
      }
      break
    case 'btnWebNotify':
      {
        let currentTime = new Date()
        let timeStr =
          currentTime.getHours() + ':' + currentTime.getMinutes() + ':' + currentTime.getSeconds()
        window.Application.OAAssist.WebNotify(
          '这行内容由wps加载项主动送达给业务系统，可以任意自定义, 比如时间值:' +
            timeStr +
            '，次数：' +
            ++WebNotifycount,
          true
        )
      }
      break
    default:
      break
  }
  return true
}

function GetImage(control) {
  const eleId = control.Id
  switch (eleId) {
    case 'btnShowMsg':
      return 'images/1.svg'
    case 'btnShowDialog':
      return 'images/2.svg'
    case 'btnShowTaskPane':
      return 'images/3.svg'
    default:
  }
  return 'images/newFromTemp.svg'
}

function OnGetEnabled(control) {
  const eleId = control.Id
  switch (eleId) {
    case 'btnWrite': {
      if(Application.PluginStorage.getItem(WRITE_BUSY)){
        return false
      }
      return true
    }
    case 'btnConfig': {
      return true
    }
    default:
      break
  }
  return true
}

function OnGetVisible(control) {
  const eleId = control.Id
  // console.log(eleId)
  return true
}

function OnGetLabel(control) {
  const eleId = control.Id
  switch (eleId) {
    case 'btnWrite': {
      return '自动续写'
    }
    case 'btnConfig': {
      return '配置'
    }
  }
  return ''
}

function OnNewDocumentApiEvent(doc) {
  alert('新建文件事件响应，取文件名: ' + doc.Name)
}

//这些函数是给wps客户端调用的
export default {
  OnAddinLoad,
  OnAction,
  GetImage,
  OnGetEnabled,
  OnGetVisible,
  OnGetLabel,
  OnNewDocumentApiEvent
}
