# 使用 nohup 让 Python 3 的 HTTP 服务在后台运行，输出重定向到 /dev/null
nohup python -m http.server 17890 > /dev/null 2>&1 &
# 记录 HTTP 服务的进程 ID
http_pid=$!
# 等待 1 秒，确保服务启动
sleep 1
# 打开浏览器访问指定页面
xdg-open http://localhost:17890/publish.html
# 等待用户输入，模拟终端停留在 Python 命令上
read -p "按任意键停止 HTTP 服务..."
# 根据进程 ID 终止 HTTP 服务
kill $http_pid
