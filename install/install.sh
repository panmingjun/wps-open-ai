python_version=$(python --version 2>&1)
if [[ $python_version == *"Python 2"* ]]; then
    python -m SimpleHTTPServer 8000  & sleep 1 && open http://localhost:8000/publish.html
elif [[ $python_version == *"Python 3"* ]]; then
    python -m http.server 8000  & sleep 1 && open http://localhost:8000/publish.html
else
    echo "无法确定 Python 版本"
fi

