[回到Readme](/Readme.md)

## 一般請求方法

在導覽行新增跳轉連結

```html
<a href="{{ url_for('quotes') }}">Quotes</a>
```

在主程式新增一個新的路由

```python
@app.route("/quotes")
def quotes():

    url = "https://quotes.toscrape.com/js/"

    response = requests.get(url)

    return response.text
```

重啟容器之後利用導覽行跳轉到剛剛建立的路由

對比一下網址中的內容

你應該在你的網站上會什麼東西都看不到

也許會有一些零碎的東西

但是主體內容應該是看不到的

那上次使用的 BeautifulSoup 呢?

```python
@app.route("/quotes")
def quotes():

    url = "https://quotes.toscrape.com/js/"

    response = requests.get(url)

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    quotes = soup.select(".quote")

    return f"找到 {len(quotes)} 筆資料"
```

找到 0 筆資料對吧

因為 BeautifulSoup 是用來做資料處理的

加上它也不會讓原本不存在的資料出現

## 靜態與動態網站

這種情況就是你所想要爬的網頁是動態的

它裡面的資訊並沒有寫死在 HTML 裡面

在前面的範例中

我們利用 requests 與 BeautifulSoup 嘗試從網站中取得名言資料

```python
response = requests.get(url)

soup = BeautifulSoup(
    response.text,
    "html.parser"
)

quotes = soup.select(".quote")
```

也就是寫死在 HTML 裡面的資料

如果沒有人工改動 HTML 裡面的內容

這個頁面就是永遠長這樣

這種頁面叫做靜態頁面

然而剛剛我們執行後卻發現

主要展示名言根本就沒有被我們抓到

這時候可能你會感到疑惑

明明瀏覽器裡看得到資料

為什麼程式卻找不到？

其實問題並不在 BeautifulSoup

而是在於我們取得的 HTML 與瀏覽器最終顯示的內容並不完全相同

requests 真正取得的是什麼？

當我們使用

```python
response = requests.get(url)
```

時，程式做的事情其實非常單純

它只是向網站發送 HTTP Request

並取得伺服器最初回傳的 HTML

流程如下：

```text
requests
    ↓
網站伺服器
    ↓
HTML 原始碼
```

此時 requests 的工作就已經結束了

但是，瀏覽器做了更多事情

當我們使用 Chrome 或 Edge 開啟網頁時

瀏覽器除了接收 HTML 之外，還會：
- 下載 CSS
- 下載 JavaScript
- 執行 JavaScript
- 修改網頁內容
- 顯示最終畫面

流程如下：

```text
瀏覽器
    ↓
取得 HTML
    ↓
下載 JavaScript
    ↓
執行 JavaScript
    ↓
產生資料
    ↓
顯示畫面
```

因此瀏覽器看到的內容

往往比 requests 取得的內容更多

這種沒有將主要內容寫在 HTML 裡面的網站叫做動態網站（Dynamic Website）

這類網站會利用 JavaScript 在頁面載入完成後才建立資料

例如：

```text
HTML 剛下載時
    ↓
頁面是空的
    ↓
JavaScript 執行
    ↓
資料出現
```

因此剛剛 requests 看抓到的是空白區塊

而瀏覽器看到的是完整資料

我們遇到了什麼問題？

在 quotes.toscrape.com/js 中：

```text
requests
    ↓
取得 HTML
    ↓
找不到 quote
```

因為名言內容是由 JavaScript 動態產生的

所以 BeautifulSoup 並沒有出錯

真正的原因是

BeautifulSoup 只能解析取得的 HTML

但資料根本還沒有出現在 HTML 裡面

那我們該如何解決？

當網站依賴 JavaScript 產生內容時

我們需要能夠：
- 模擬真實瀏覽器
- 執行 JavaScript
- 等待資料載入


這時候就需要使用 Selenium

Selenium 會真正開啟瀏覽器：

```text
Selenium
    ↓
Chrome
    ↓
執行 JavaScript
    ↓
產生資料
    ↓
取得最終畫面
```

因此對於動態網站而言

Selenium 往往能取得 requests 無法取得的資料

在使用 Selenium 之前

我們再補充一下先備知識

## 伺服器渲染與用戶端渲染

在前面的課程中，我們曾經介紹過：
- SSR（Server Side Rendering）伺服器渲染
- CSR（Client Side Rendering）用戶端渲染

這邊我們再複習一下

熟悉這兩種網站的運作方式

不但有助於網頁開發

也能幫助我們判斷網站是否適合使用 requests 進行爬取

### 伺服器渲染

什麼是伺服器渲染（SSR）？

伺服器渲染（Server Side Rendering）是指：

資料與 HTML 在伺服器端組合完成後，
再一起傳送給瀏覽器。

流程如下：
```text
瀏覽器
    ↓ Request
伺服器
    ↓
資料庫查詢
    ↓
產生完整 HTML
    ↓
回傳 HTML
    ↓
瀏覽器顯示
```

Flask 就是 SSR

在 Flask 中，我們經常使用

```python
return render_template(
    "index.html",
    todos=todos
)
```

其中

```python
todos = Todo.query.all()
```

先從資料庫取得資料

接著

```python
render_template()
```

會利用 Jinja 將資料填入 HTML

例如：

```html
<ul>

{% for todo in todos %}

    <li>{{ todo.content }}</li>

{% endfor %}

</ul>
```

最終在伺服器端產生：

```html
<ul>
    <li>買牛奶</li>
    <li>寫作業</li>
    <li>準備考試</li>
</ul>
```

然後直接送給瀏覽器。

因此 Flask + Jinja 屬於典型的 SSR 架構

那 SSR 對爬蟲的影響在哪裡？

因為資料已經存在於 HTML 裡面

所以

```python
response = requests.get(url)
```

通常就能取得：
- 標題
- 文章
- 商品資料
- 待辦事項

因此 SSR 網站通常非常適合使用 requests + BeautifulSoup 進行爬取

### 用戶端渲染

什麼是用戶端渲染（CSR）？

用戶端渲染（Client Side Rendering）則完全不同。

伺服器一開始回傳的內容可能只有：

```html
<div id="app"></div>
```

真正的資料會由 JavaScript 在瀏覽器中取得

流程如下：

```text
瀏覽器
    ↓ Request
伺服器
    ↓
回傳空白 HTML
    ↓
下載 JavaScript
    ↓
執行 JavaScript
    ↓
呼叫 API
    ↓
取得資料
    ↓
產生畫面
```

### 現代前端框架

下面這幾個現代前端框架就是 CSR 最好的例子：
Angular
React
Vue

他們都屬於常見的 CSR 架構

例如：

```html
<div id="app"></div>
```

畫面看起來有很多內容

但其實資料並不在原始 HTML 裡

而是在：

```text
JavaScript
↓
API
↓
資料庫
```

取得資料後才顯示出來

為什麼 requests 有時候抓不到資料？

假設：

```python
response = requests.get(url)
```

取得的是

```html
<div id="app"></div>
```

那麼

```python
BeautifulSoup(
    response.text,
    "html.parser"
)
```

當然找不到：
- 文章
- 商品
- 名言
- 活動資訊

因為這些內容根本還沒出現

這就是 quotes.toscrape/js 發生的事情

在前面的範例中：

```url
https://quotes.toscrape.com/js/
```

網站上的名言實際上是 JavaScript 執行後才動態加入頁面

因此 requests 只能看到空的 HTML

而 Selenium 因為真的開啟瀏覽器

能夠執行 JavaScript

所以最終取得完整資料

SSR 與 CSR 比較

|項目|SSR|CSR
|-|-|-
|全名|Server Side|Rendering	Client Side Rendering
|資料產生位置|伺服器|瀏覽器
|Flask + Jinja|✓|✗
|Angular|✗|✓
|requests 容易取得資料|✓|✗
|Selenium 需求|較少|較多

## 判斷靜態還是動態網站

如何判斷網站是靜態網站還是動態網站？

在網際網路發展初期

動態網站與靜態網站的差異非常明顯

靜態網站通常會在頁面載入時逐步顯示內容

而動態網站則需要等待 JavaScript 執行後才會出現資料

因此使用者很容易分辨兩者的差異

然而現代瀏覽器的效能已經大幅提升

無論是：
- Chrome
- Edge
- Firefox

都能在極短時間內完成：
- 下載 HTML
- 執行 JavaScript
- 渲染頁面

整個過程往往只需要不到一秒鐘

因此對人類使用者而言：
- 幾乎無法僅靠肉眼判斷
- 這個網站到底是不是動態網站

這也是許多初學者在學習網路爬蟲時經常遇到的問題



方法一：先用 requests 嘗試

最簡單的方法其實就是

```python
response = requests.get(url)

print(response.text)
```

如果 HTML 中已經能看到：
- 標題
- 文章內容
- 商品資訊

那麼通常表示資料直接存在於 HTML 中

這類網站通常可以使用

```text
requests
+
BeautifulSoup
```

完成爬取

方法二：使用瀏覽器檢查元素

在網頁上按下 F12 或右鍵檢查

開啟開發者工具（Developer Tools）

如果在 HTML 中直接找到目標資料

```html
<div class="quote">
    ...
</div>
```

那麼通常代表資料已存在於 HTML

較適合使用 requests

方法三：查看網路請求（Network）

在開發者工具中切換到 Network 頁籤

重新整理頁面後觀察：

Fetch/XHR

請求

如果看到：

api/news
api/events
api/products

之類的請求

通常表示：
- 網站正在透過 JavaScript
- 向後端 API 取得資料

此時就有可能是動態網站

方法四：檢查 requests 是否取得資料

這是最常見的方法

例如：
```python
quotes = soup.select(".quote")

print(len(quotes))
```

結果：0

但瀏覽器畫面卻明明有資料

這通常表示

資料是在 JavaScript 執行後才產生

此時 requests 無法取得完整內容

方法五：觀察原始碼

有些網站會出現

```html
<div id="app"></div>
```

或

```html
<div id="root"></div>
```

而整份 HTML 幾乎沒有內容

這類網站通常是：
- React
- Vue
- Angular

等前端框架建立的單頁應用程式（SPA）

例如：
- React
- Vue
- Angular
- Next.js
- Nuxt.js

此時大部分資料都會在 JavaScript 執行後才出現

方法零：問問神奇海螺

判斷流程建議

在開始寫爬蟲之前，可以先依照以下流程判斷：
```text
requests
    ↓
是否取得資料？
    ↓
    是
    ↓
BeautifulSoup
    ↓
    否
    ↓
F12 檢查
    ↓
查看 Network
    ↓
查看 HTML
    ↓
分析 API
    ↓
最後才考慮 Selenium
```

## Selenium 介紹

Selenium 是什麼？

在前面的範例中

我們發現 requests + BeautifulSoup

並不一定能取得網站上的所有資料

尤其是在現代網站中

許多內容都是透過 JavaScript 動態產生的

這時候就需要另一種工具 Selenium

Selenium 最初並不是為了網路爬蟲而設計

它的主要用途其實是網頁自動化測試

例如：
- 測試登入功能
- 測試購物車
- 測試表單送出
- 測試網頁按鈕

工程師可以透過 Selenium 撰寫程式

自動操作瀏覽器

驗證網站是否正常運作

因此 Selenium 在業界最常見的用途其實是自動化測試（Automated Testing）

而不是網路爬蟲

當我們使用

```python
requests.get(url)
```

時：

程式直接向網站取得 HTML

流程如下：
```text
requests
    ↓
網站
    ↓
HTML
```

而 Selenium 則完全不同

Selenium 會真正開啟瀏覽器

例如：
- Chrome
- Chromium
- Edge
- Firefox

然後模擬人類操作

流程如下：
```text
Selenium
    ↓
瀏覽器
    ↓
網站
    ↓
執行 JavaScript
    ↓
取得最終畫面
```

因此 Selenium 看見的內容與使用者看到的畫面幾乎相同

Selenium 可以做什麼？

除了讀取資料之外

Selenium 還可以：
- 點擊按鈕
- Click
- 輸入文字
- send_keys()
- 切換頁面
- driver.get()
- 捲動頁面
- scroll
- 等待資料載入
- WebDriverWait

因此 Selenium 可以完成許多 requests 做不到的事情

Selenium 為什麼能解決動態網站問題？

因為 Selenium 並不是直接讀取 HTML

它會：
- 啟動瀏覽器
- 執行 JavaScript
- 等待頁面載入

所以即使網站內容是 JavaScript 動態產生

Selenium 仍然能夠取得資料

這也是為什麼剛剛在名言網站

使用 requests 時找不到名言

但使用 Selenium 時卻能成功取得資料

Selenium 的缺點

雖然 Selenium 很強大

但並不代表任何情況都應該優先使用

因為比起 requests 太慢了

每次都需要：
- 開啟瀏覽器
- 載入頁面
- 執行 JavaScript

速度遠慢於 requests

而且也較耗資源

Selenium 需要：
- CPU
- RAM
- 瀏覽器

因此在大量爬取資料時成本較高

部署較麻煩

除了 Python 套件之外

還需要：
- Chrome
- Chromium
- ChromeDriver

才能正常運作

Selenium 不是第一選擇

在實務開發中，通常會依照以下順序嘗試：

```text
requests
    ↓
BeautifulSoup
    ↓
分析 API
    ↓
最後才使用 Selenium
```

因為：

能用 requests 解決的問題

通常不要使用 Selenium

## MVP Selenium

現在終於可以在我們的程式上面加上動態爬蟲了

剛剛提到我們需要給 Selenium 瀏覽器它才可以正常運作

所以我們要在生成容器的時候幫它安裝瀏覽器跟一些相關的工具

在 Dockerfile 新增

```dockerfile
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*
```

這串新指令可以拆成三個部分：
- 更新套件清單
- 安裝 Chromium 與相關函式庫
- 安裝 GUI 相關函式庫

1. 更新套件清單

```bash
apt-get update
```

作用是從 Ubuntu 軟體庫取得最新套件資訊

類似更新商店目錄

如果沒有這一步

```bash
apt-get install chromium
```

可能會出現

```text
Unable to locate package chromium
```

2. 安裝 Chromium 與相關函式庫

chromium 就是瀏覽器本體

例如：
- Selenium
- Playwright
- Puppeteer

都需要它

chromium-driver 提供 WebDriver

關係如下：

```text
Selenium
    ↓
Chromedriver
    ↓
Chromium
```

沒裝會怎樣？

可能出現：

```text
selenium.common.exceptions.WebDriverException
```

或：

```text
chromedriver executable needs to be in PATH
```

3. 安裝 GUI 相關函式庫

雖然 Docker 裡通常沒有桌面環境

但 Chromium 啟動時仍然需要一些 Linux Library

libnss3 顧名思義

是 NSS (Network Security Services) 的庫

負責：
- HTTPS
- SSL/TLS 憑證驗證

沒裝可能

```text
Failed to load NSS library
libxss1
libxss1
```

X11 Screen Saver Extension

提供 Chromium 部分圖形功能

libasound2
libasound2

是 ALSA 聲音系統

即使不用音效

很多 Chromium 版本仍會檢查它

libatk-bridge2.0-0
libatk-bridge2.0-0

Accessibility Toolkit

無障礙介面支援

libgtk-3-0
libgtk-3-0

GTK3 GUI 函式庫

Chromium 需要的核心圖形元件之一

沒裝常看到

```text
error while loading shared libraries:
libgtk-3.so.0
```

4. 最後清理 apt 快取

```bash
rm -rf /var/lib/apt/lists/*
```

用來減少 Docker Image 體積

因為

```bash
apt-get update
```

會下載大量索引檔

例如：

```ubuntu
/var/lib/apt/lists/
```

可能有數十 MB

所以安裝完後

```bash
rm -rf /var/lib/apt/lists/*
```

就把它刪掉

處理好環境之後

在 requirements.txt 新增套件

```requirements
selenium
```

在主程式上面引入套件

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
```

修改剛剛建立在主程式的爬蟲路由

```python
@app.route("/quotes")
def quotes():
    options = Options()
    options.binary_location = "/usr/bin/chromium"
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    driver = webdriver.Chrome(options=options)

    try:
        driver.get("https://quotes.toscrape.com/js/")

        quotes = driver.find_elements(By.CLASS_NAME, "quote")

        result = ""

        for quote in quotes:
            result += quote.text
            result += "<hr>"

        return result

    finally:
        driver.quit()
```

存檔後刷新應該就可以看到它會等待一段時間後顯示

但是就是純文字

沒有網頁該有的樣子

現在我們來解決一下這個問題

讓路由可以回傳 HTML

## Selenium 回傳 HTML

修改路由處裡邏輯

```python
quote_elements = driver.find_elements(
            By.CLASS_NAME,
            "quote"
        )

        quote_list = []

        for quote in quote_elements:

            text = quote.find_element(
                By.CLASS_NAME,
                "text"
            ).text

            author = quote.find_element(
                By.CLASS_NAME,
                "author"
            ).text

            quote_list.append({
                "text": text,
                "author": author
            })
```

路由尾部回傳 HTML

```python
return render_template(
        "quotes.html",
        quote_list=quote_list
    )
```

新增要回傳的 HTML 命名為 quotes.html

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Quotes</title>
    </head>

    <body>
        <h1>Quotes</h1>

        {% for quote in quote_list %}

            <div>

                <p>
                    {{ quote.text }}
                </p>

                <p>
                    - {{ quote.author }}
                </p>

            </div>

            <hr>

        {% endfor %}
    </body>
</html>
```

全部存檔更新一下瀏覽器頁面應該就可以看到我們要的名言內容了

## Selenium 儲存到資料庫

現在我們還沒有把爬蟲爬到的東西存到資料庫

這會讓使用者每次跳轉到名言頁面的時候都爬取一次

這就違反了我們上一次上課講的爬蟲倫理

這不僅會造成目標網站困擾

而且當我們網站的使用者變多時可能會變成 DDos 攻擊

進而讓我們遭遇不好的後果

所以現在我們要把爬蟲爬到的東西存到資料庫裡面

建立一個新的路由用來放置我們的爬蟲邏輯

這樣跳轉到名言頁面就不會每次都要重新爬蟲

```python
@app.route("/crawl")
def crawl_quotes():
```

把剛剛名言路由的爬蟲邏輯搬到這個路由下面

將原本定義 list 的地方改成

```python
Quote.query.delete()
```

爬蟲邏輯尾部的 return 部分拉回名言頁面路由

並且在名言路由回傳 HTML 前查詢資料庫的名言資料表

```python
quote = Quote.query.all()
```

爬蟲邏輯的尾部現在是空的

這次改動的目的就是將爬到的資訊可以存進資料庫

所以在爬蟲邏輯的退出瀏覽器前填上

```python
            db.session.add(
                Quote(
                    text=text,
                    author=author
                )
            )

        db.session.commit()
```

最後爬蟲邏輯回傳

```python
return "Crawl Success!"
```

因為我們把爬蟲跟顯示頁面分開了

現在我們在顯示頁面要加一個按鈕用來啟動爬蟲

```html
<form action="/crawl" method="GET">
    <button type="submit">
        更新資料
    </button>
</form>
```

這樣就完成把爬蟲爬到的資料丟到資料庫的功能

不僅不會造成對方網站造成負擔

也讓使用者的體驗更上層樓

[回到Readme](/Readme.md)