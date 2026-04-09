[回到Readme](/Readme.md)

上一次我們把最小可以用的 Flask 上傳到 Render 裡面了

現在的結構應該長這樣

```bash
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, Docker Flask!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

可以看到我們現在的主路由 "/" 只會回傳一句 "Hello, Docker Flask!"

這樣是沒有辦法做標題、段落、按鈕、圖片、導覽列

這時候我們就需要 HTML

HTML 解決的是畫面結構（Structure）的問題

把文字上標籤

讓瀏覽器知道要怎麼顯示他們

現在我們來試試看怎麼把文字上標籤

把

```bash
return "Hello, Docker Flask!"
```

改成

```bash
return "<h1>標題</h1>
        <p>段落</p>"
```

現在在 app.run 裡面加入 debug=True

這樣才可以熱重啟

也就是我們存檔後就可以讓新的東西更新在畫面上

這個功能非常重要

可以為我們的開發減去很多不必要的時間花費

存檔後把容器重新建立一次

應該會看到標題的字比下面的端落還來的大

可是這樣很麻煩

現在一個網頁隨隨便便就上百上千行文字

我們不可能把它全部塞在 app.py 這樣不僅管理麻煩

有時候格式段落也怪怪的

人眼要看這麼雜的東西是很費力的

雜亂的東西也會影響心情

我們就需要把 HTML 抽取出去

那該怎麼抽呢

這就要靠 render_template 這個 Flask 的原生套件了

它依靠 Jinja2 template engine 運作的

可以幫我們把一些動態的資料加進 HTML 再傳給使用者

也可以讓我們把 HTML 抽離出去

把

```bash
from flask import Flask
```

改成

```bash
from flask import Flask, render_template
```

把新的套件引用進來我們才可以在程式裡面做使用



[回到Readme](/Readme.md)