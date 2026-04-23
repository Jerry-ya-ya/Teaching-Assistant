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
return "<html>
            <head>
                <title>首頁</title>
            </head>
            <body>
                <h1>歡迎來到我的網站</h1>
                <p>這是用 Flask 直接回傳 HTML</p>

                <a href="/about">前往 About</a>
            </body>
        </html>"
```

現在在 app.run 裡面加入 debug=True

這樣才可以熱重啟

也就是我們存檔後就可以讓新的東西更新在畫面上

這個功能非常重要

可以為我們的開發減去很多不必要的時間花費

存檔後把容器重新建立一次

應該會看到標題的字（歡迎來到我的網站）比下面的端落（這是用 Flask 直接回傳）還來的大

就是因為

```bash
<h1>
```

跟

```bash
<a>
```

是不一樣的標籤

所以會導致每個字或段落可能會跟其他地方不一樣

可是這樣直接在 Flask 寫 HTML 會很麻煩

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

引用好後把根路由那一大串很雜的 HTML 改成

```bash
return render_template("index.html")
```

然後在根目錄建立一個叫 templates 的資料夾

資料夾裡面再建立一個 index.html

index.html 裡面貼上

```bash
<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Flask MVP</title>
        </head>
        <body>
            <h1>Flask MVP Website</h1>
            <p>這是一個最小可行版本的 Flask 網站。</p>
        </body>
    </html>
```

存檔後重新整理一下你的網站頁面

應該就會看到大大的 Flask MVP Website 跟其他的內容

現在我們已經幫主頁開好一個模板了

一般來說正常的網頁不會只有一個頁面

拿我們輔仁大學的校網來說

光是導覽行就有八個不同的頁面

所以現在我們來建立一個新的頁面跟他的路由

在主程式的根目錄下面新增一個新的路由

```bash
@app.route("/html_tags")
def html_tags():
    return render_template("html_tags.html")
```

在 templates 裡面新增一個 html_tags.html

之後把 https://zero1-a6o5.onrender.com/html_tags 裡面的 html 抄下來

一樣存檔後刷新你的瀏覽器就可以看到你剛剛抄的內容了

嗎?

沒有對吧

你沒有看到剛剛抄的內容是因為

路由是不一樣的

剛剛建立的是 /html_tags 路由

抬頭看看瀏覽器網址的地方

你會發現自己應該在根路由 /

現在把瀏覽器上面的連結的尾部加上 /html_tags

應該就可以看到剛剛抄的內容了

可以在這個頁面裡面看到大部分的 HTML 標籤可以做到什麼事情

當然

這個頁面是美化過的

純粹的 html 是無法非常方便的做到這種程度的美化的

所以我們需要 CSS 來幫我們做到美化的功能

看到剛剛抄下來的 HTML

會看到有一個叫做 style 的標籤

裡面是用來放 CSS 的

如果你觀察我的網頁主頁的 HTML

你會發現裡面的最後還多了一個標籤 scripts

這是 JavaScripts

是網頁中負責「互動」的部分

它是一種程式語言

也是唯一能讓網頁 活起來 的關鍵

網頁三巨頭
- HTML 標記語言（Markup）
- CSS 樣式語言（Style）
- JavaScripts 程式語言（Programming）

這三部分通常會把它分出來

讓專案達到模組化

比較好管理

如果要重複使用也會更方便

例如我有兩個不同的 HTML

但是想要用同一個背景

就可以在裡面引入相同的 CSS

回到剛剛抄下來的 HTML

看到裡面第一個單元是

```bash
body {
      font-family: Arial, sans-serif;
      line-height: 1.7;
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
      color: #222;
      }
```

前面的 body 是拿來選中所有 body 標籤的

注意是 所有

如果要指定美化單一一個標籤的話可以使用 class 或 id

一般來說 class 用的比較多

因為 id 是用來指定「單一且唯一」的標籤

現在我們來試試看把 CSS 從 HTML 中分開

在根目錄建立一個 static 資料夾

資料夾裡建立 index.css 檔案

把 style 標籤裡面的所有東西都剪下搬過去 index.html 但是不包含 style 標籤

之後在剛剛的 HTML 裡面找到 head 頭部標籤

在裡面把我們分離好的 CSS 引入回去

```bash
<link rel="stylesheet" href="{{ url_for('static', filename='index.css') }}">
```

注意

這裡的 {{ url_for('static', filename='style.css') }} 是 Flask 裡面的 Jinja 要用的

在其他的框架下可能會不同

有可能是相對路徑或者是絕對路徑

像是

```bash
<link rel="stylesheet" href="/static/index.css">
```

這種寫法在 Flask 也可以但是不建議

因為但是因為 Flask 會幫你
- 處理路徑
- 部署到不同環境不會壞掉
- 支援版本控制（cache busting）

所以還是建議用 Jinja 的寫法

分離好一樣存檔後重新整理

應該可以看到 HTML 裡面沒有 style 標籤

但是網頁的風格應該會跟剛剛有 style 標籤的時候一樣

學會了靜態網頁的基本知識之後

我們就要為我們多路由想辦法了

畢竟每次切換頁面都要打上新的路由絕對不是好點子

現在我們就要學 Jinja 了

Jinja 是一個模板引擎

讓 HTML 可以寫變數與邏輯

並由後端動態產生網頁

跟 JavaScripts 很像但是 Jinja 是內建在 Flask 裡面的

它的工作就是把 Python 資料「填進」HTML



[回到Readme](/Readme.md)