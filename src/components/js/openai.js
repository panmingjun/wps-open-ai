async function callOpenAi(config) {
    var {apiKey,apiUrl,model,temperature,messageFunc} = config;  // 你的 OpenAI API Key
    if (!apiKey) {
      alert('请先设置apiKey')
      return
    }
    var selection = wps.WpsApplication().Selection;
    if (!selection || selection.Text.trim() === "") {
      alert("请先选中文本");
      return;
    }
  
    var prompt = selection.Text.trim();
  
    if(messageFunc){
        var messages=messageFunc(prompt)
    }else{
        var messages=[{ "role": "user", "content": "续写内容" },
            { "role": "assistant", "content": prompt, "prefix": true }]
    }

    var requestBody = {
      model: model,
      // prompt: prompt,
      messages: messages,
      temperature: Number(temperature),
      stream: true
    };
  
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      })

      if(response.status>=300){//只有2xx和1xx开头的算是正常
        throw Error(`连接服务器异常:,状态码：${response.status}`)
      }
      // 创建Reader读取流数据
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        // 解析数据块（假设为SSE格式）
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
  
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0].delta.content;
              if (content) {
                result += content;
                // 实时更新到文档
                Application.ActiveDocument.Range().InsertAfter(content);
                Application.ScreenRefresh(); // 刷新界面
              }
            } catch (e) { /* 忽略解析错误 */ }
          }
        });
      }
    } catch (error) {
      alert(`OpenAi调用异常:${error}`);
    }
  }

  export default callOpenAi