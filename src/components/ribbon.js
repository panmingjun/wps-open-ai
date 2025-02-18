import Util from './js/util.js'
import configUtil from './js/config.js'
import callOpenAi from './js/openai.js'

//这个函数在整个wps加载项中是第一个执行的
function OnAddinLoad(ribbonUI) {
  configUtil.reloadConfig()
  return true
}

//"sk-6eac4024aeae46629f34f2a706f09395"

const aiPromotConfig = {
  'btnWrite': {
    messageFunc: text => [
      { "role": "system", "content": "你是一个专业的续写助手，擅长根据用户输入的一段文本，续写后面的内容" },
      { "role": "user", "content": "请续写后续内容:" },
      { "role": "assistant", "content": text, "prefix": true }]
  },
  'btnPerf': {
    messageFunc: text => [
      { "role": "system", "content": "你是一个专业的文本润色助手，擅长将输入的文本进行优化和润色。且从不废话，直接给我润色后的结果" },
      { "role": "user", "content": `请润色以下内容: ${text}` }
    ]
  },
  'btnFix': {
    messageFunc: text => [
      { "role": "system", "content": "你是一个细心的文本纠错助手，擅长检查文本中的错别字和语法错误。且从不废话，直接给我修改后的结果。" },
      { "role": "user", "content": `请检查并修复以下内容: ${text}` }
    ]
  }
}

async function aiBtn(btnName) {
  Application.PluginStorage.setItem(btnName + '_busy', true)
  window.Application.ribbonUI.InvalidateControl(btnName)

  try {
    var config = Application.PluginStorage.getItem("config")
    var apiUrl = config.url
    var model = config.model

    await callOpenAi({
      apiUrl: apiUrl,
      apiKey: config.key,
      model: model,
      temperature: config.temperature,
      messageFunc: aiPromotConfig[btnName].messageFunc
    })
  } finally {
    Application.PluginStorage.setItem(btnName + '_busy', false)
    window.Application.ribbonUI.InvalidateControl(btnName)
  }
}

var WebNotifycount = 0
async function OnAction(control) {
  const eleId = control.Id
  switch (eleId) {
    case 'btnWrite': {

      await aiBtn('btnWrite')
      break
    }
    case 'btnPerf': {

      await aiBtn('btnPerf')
      break
    }
    case 'btnFix': {

      await aiBtn('btnFix')
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
      if (Application.PluginStorage.getItem('btnWrite_busy')) {
        return false
      }
      return true
    }
    case 'btnPerf': {
      if (Application.PluginStorage.getItem('btnPerf_busy')) {
        return false
      }
      return true
    }
    case 'btnFix': {
      if (Application.PluginStorage.getItem('btnFix_busy')) {
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
    case 'btnPerf': {
      return '文本润色'
    }
    case 'btnFix': {
      return '错字/病句修复'
    }
    case 'btnConfig': {
      return '配置'
    }
  }
  return ''
}

//这些函数是给wps客户端调用的
export default {
  OnAddinLoad,
  OnAction,
  GetImage,
  OnGetEnabled,
  OnGetVisible,
  OnGetLabel,
}
