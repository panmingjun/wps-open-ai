<template>
  <div class="hello">
    <div class="global">
      <div class="divItem">
        <span style="font-weight: bolder; color: slateblue; cursor: pointer">选择模型</span>
        <select v-model="current">
          <option v-for="(item, index) in modelJson" :key="index" :value="item.id">
            {{ item.name }}
          </option>
          <option value="-1">其他OpenAi模型</option>
        </select>
      </div>
      <div class="divItem" v-if="current == -1">
        <span style="font-weight: bolder; color: slateblue; cursor: pointer">填写模型地址</span>
        <input type="text" v-model="url" />
      </div>
      <div class="divItem" v-if="current == -1">
        <span style="font-weight: bolder; color: slateblue; cursor: pointer">填写模型名称</span>
        <input type="text" v-model="model" />
      </div>
      <div class="divItem">
        <span style="font-weight: bolder; color: slateblue; cursor: pointer">填写密钥</span>
        <input type="text" v-model="key" />
      </div>
      <div class="divItem">
        <span style="font-weight: bolder; color: slateblue; cursor: pointer">设置温度</span>
        <input type="text" v-model="temperature" />
      </div>
      <hr />
      <div class="divItem">
        <button style="margin: 3px" @click="onSave()">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
import modelJson from './js/model.js'
import configUtil from './js/config.js'
export default {
  name: 'Dialog',
  data() {
    return {
      modelJson: modelJson,
      current: -1,
      url: '',
      key: '',
      model: '',
      temperature: 0.6,
      list: []
    }
  },
  methods: {
    onSave() {
      var config = configUtil.getConfig()
      //如果没有配置，则生成默认的
      if (!config) {
        config = { current: -1, list: JSON.parse(JSON.stringify(modelJson)) }
      }
      //自动补全空的数据
      for (var j in modelJson) {
        var m = modelJson[j]
        var cm = config.list.find(x => x.id == m.id)
        if (cm) {
          var i = config.list.indexOf(cm)
          cm = { ...m, ...cm }
          config.list.splice(i, 1, cm)
        } else {
          cm = m
          config.list.push(cm)
        }
      }
      //自动补全自定义的数据
      var cm = config.list.find(x => x.id == -1)
      if (!cm) {
        cm = { id: -1 }
        config.list.push(cm)
      }

      //设置当前的
      config.current = this.current
      //覆盖密钥和温度配置
      var cm = config.list.find(x => x.id == config.current)
      var i = config.list.indexOf(cm)
      cm = { ...cm, key: this.key, temperature: this.temperature }

      //如果是自定义，则还需要覆盖名称和地址
      if (this.current == -1) {
        cm = { ...cm, name: this.name, url: this.url, model: this.model }
      }
      config.list.splice(i, 1, cm)

      //保存
      var pluginDir = Application.Env.GetHomePath() + '/.wps-open-ai'
      var configFile = pluginDir + '/config.json'
      Application.FileSystem.WriteFile(configFile, JSON.stringify(config))
      // alert('保存成功')
      configUtil.reloadConfig()
      close()
    }
  },
  watch: {
    'current': function () {
      this.url = ''
      this.key = ''
      this.model = ''
      this.temperature = 0.6
      var config = configUtil.getConfig()
      if (config) {
        var that = this
        var current_config = config.list.find(x => x.id == that.current)

        this.url = current_config.url
        this.key = current_config.key
        this.model = current_config.model
        this.temperature = current_config.temperature
      }
      configUtil.reloadConfig()
    }
  },
  mounted() {
    var config = configUtil.getConfig()
    if (config && config.current && config.list) {
      this.current = config.current
      var current_config = config.list.find(x => x.id == config.current)
      this.url = current_config.url
      this.key = current_config.key
      this.temperature = current_config.temperature
      this.list = config.list
    }
    configUtil.reloadConfig()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.global {
  font-size: 15px;
  min-height: 95%;
}

.divItem {
  margin-left: 5px;
  margin-bottom: 18px;
  font-size: 15px;
  word-wrap: break-word;
}
</style>
