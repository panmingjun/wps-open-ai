function getConfig() {
    var pluginDir = Application.Env.GetHomePath() + '/.wps-open-ai'
    if (!Application.FileSystem.existsSync(pluginDir)) {
        Application.FileSystem.Mkdir(pluginDir)
    }
    var configFile = pluginDir + '/config.json'
    if (!Application.FileSystem.Exists(configFile)) {
        Application.FileSystem.WriteFile(configFile, '')
    }
    //读取文件json
    var fileJson = Application.FileSystem.ReadFile(configFile)
    if (fileJson) {
        try {
            return JSON.parse(fileJson)
        } catch { }
    }
}

function reloadConfig() {
    var config = getConfig()
    if (config && config.current && config.list) {
        var current_config = config.list.find(x => x.id == config.current)
        if (current_config)
            Application.PluginStorage.setItem("config", current_config)
    }
}
export default { getConfig, reloadConfig }