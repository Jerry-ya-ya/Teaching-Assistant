[回到Readme](/Readme.md)

什麼是網路爬蟲（Web Scraping）

網路爬蟲（Web Scraping）是利用程式自動取得網站上的資料

例如：
- 新聞標題
- 股票價格
- 商品資訊
- 天氣資料
- 社群文章

平常我們是人類閱讀網站

而爬蟲則是讓程式閱讀網站

爬蟲的基本流程

```bash
程式發送請求
    ↓
網站回傳 HTML
    ↓
程式解析 HTML
    ↓
取得需要的資料
```

幾節課以前我們已經講過 HTML 是網站的結構

他是顯示網頁的三大巨頭之首

瀏覽器會把 HTML 轉換成我們看到的網站畫面

而爬蟲會直接讀取 HTML 原始碼

就是我們用 F12 看到的那一大串 HTML

雖然我們可以用肉眼看或是用關鍵字查找我們要的資料

但是這樣對眼睛不友善

也會浪費時間

所以我們需要爬蟲來幫我們做到一些自動化的事情

網路爬蟲的核心用途就是自動化取得網路上的資料

而這些資料之後可以：
- 統整
- 分析
- 搜尋
- 訓練 AI
- 建立網站
- 監控資訊

爬蟲本身不是目的而是「資料取得工具」

真正重要的是你拿資料來做什麼

常見用途

1. 統整資訊（最常見）

例如：
- 新聞網站
- 比價網站
- 資訊聚合網站

像：
- Google News
- 巴哈動畫瘋排行
- 股票資訊網站

很多背後其實都有爬蟲 + 資料整理

2. 資料狩獵（Data Collection）

這其實是 AI 時代非常重要的概念。

例如：
- 收集圖片
- 收集文章
- 收集留言
- 收集商品資料

之後可以：
- 分析
- 訓練模型
- 建立資料集

很多 AI 模型的資料來源其實是大量爬蟲

例如：
- 網頁文章
- 圖片網站
- GitHub 程式碼
- 討論區內容

3. 自動監控

例如：
- 商品價格變化
- 缺貨通知
- 股票價格
- 天氣資訊

範例：
PS5 降價就通知我

背後可能就是：

定時爬蟲

其他還有像是
- 搜尋引擎
- 建立自己的資料網站
- 商業分析

等等的應用

資料是現代的重要資源

AI 時代很多競爭

其實是在競爭誰擁有更多資料

而爬蟲就是取得資料的方法之一

但是你們在使用的時候要注意

爬蟲是有規則與限制的

這是很重要的部分

不要對網站瘋狂發送 Request

這會造成網站負擔

害你的 IP 被封鎖

或是被判定為攻擊

這種故意利用多次請求導致網站無法被正常使用者訪問

可能在法律上會有問題

我們通常稱呼這種行為為

DDoS

DDoS 是什麼？

DDoS（Distributed Denial of Service）

分散式阻斷服務攻擊

意思是大量裝置同時對網站發送請求

讓網站無法正常服務真正使用者

我們用餐廳比喻

正常情況下 10 個客人進餐廳

服務生還能正常工作

但如果突然 10 萬人同時衝進餐廳

結果：
- 點餐系統塞爆
- 廚房來不及做
- 真正客人無法使用

這就是服務被阻斷（Denial of Service）

所以我們在爬蟲的時候要小心謹慎的使用

才不會使他人財產損失或因此吃官司

因為Server 資源不是無限的

網站需要處理：
- CPU
- RAM
- Database
- 網路頻寬

當我們網站部屬到公網的時候

這些東西、功能都會換算成錢

在每個網站的背後是每一分每一秒都在燒錢

所以好的工程師不只是讓程式能跑

還要避免造成系統負擔

那我們要避免送出多次的請求可以利用以下幾種方式
- 加入延遲
- 不要短時間大量 request
- 查看 robots.txt
- 不要爬：需要登入的私人資料、個資、付費內容、或敏感資料

什麼是 robot.txt?

很多網站會有/robots.txt

例如：
- https://example.com/robots.txt

裡面可能會寫哪些頁面不希望被爬或是可以被接受的爬取頻率

最後

有些網站是禁止爬蟲的

部分網站會：
- Cloudflare 防護
- CAPTCHA 驗證
- 封鎖 Bot

爬蟲不是駭客工具

只要使用得當

它更像是自動化資料收集工具

現在我們來做第一版的爬蟲

在爬蟲誕生之前我們要先挑選一個目標網站

今天我們以 https://news.ycombinator.com 為目標網站

這個網站叫做 Hacker News

是由知名矽谷創業孵化器 Y Conbinator 創立的社群網站

專門匯集與電腦駭客技術、軟體開發、程式設計、及新創公司相關的科技資訊

這是一個靜態網站

現代網站有兩種

靜態網站跟動態網站

靜態網站就是資料直接存在 HTML 中

例如：
- Hacker News
- 一些部落格
- 文件網站

適合利用 requests + BeautifulSoup 爬取

也是最簡單爬取的網站類型

動態網站的資料是 JavaScript 後來載入的

例如：
- Instagram
- Facebook
- Threads

通常需要：
- Selenium
- Playwright
- API 分析

動態網站是現今網頁的普遍結構

利用 JavaScripts 可以不用每次有新東西就改一次 HTML

只要更新資料庫

這次的新資料就會自己排好顯示給使用者

好

講了這麼多先輩知識

現在就要實做爬蟲了

這次我們先做統整爬蟲

把上面的新聞連結

統整在我們的一個頁面裡面

如果要一步一步把服務建立起來應該要先看到東西

就算很簡陋也沒關係

爬蟲的第一步就是把東西爬下來

後面再思考如何過濾我們不要或我們要的東西

一步一步升級我們的網站

在 requirements 加入

```bash
requests
```

然後在主程式建立一個新的路由

```bash
@app.route("/news")
def news():

    url = "https://news.ycombinator.com/"

    response = requests.get(url)

    return response.text
```

在 navbar.html 新增一個頁面切換的超連結

```bash
<a href="{{ url_for('news') }}">Hacknews</a>
```

利用 docker-compose.yml 重新建立容器後

你可以利用導覽行跳轉到 Hacknews 頁面

你應該會看到滿版的連結包含文章、點數、作者、上傳時間、評論數等等

對比一下原本的網頁應該會看到

在你網站上面顯示的內容跟原本的網頁長得很像

基本上可以說是一模一樣

這是因為我們還沒對我們爬到的東西進行整理就全部放上來

現在我們要對我們爬到的資料進行處理

把我們要的連結保留下來

其他不重要的去除

在 requirements 加入

```bash
bs4
```

這邊的 bs4 是 BeautifulSoup 的縮寫

BeautifulSoup 是 Python 的 HTML 解析工具

因為 HTML 本身只是文字

BeautifulSoup 會把 HTML 轉換成可搜尋的結構

所以我們要利用這個套件來把爬取到的原始資料

清理、改寫成我們想要的內容

再來

修改主程式的 news 路由

```bash
    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    titles = soup.select(".titleline a")

    result = ""

    for title in titles:

        result += title.text
        result += "<br>"

    return result
```

利用 docker-compose.yml 重新建立容器後

你可以利用導覽行跳轉到 Hacknews 頁面

你應該會看到滿版的字

這些字都不是以連結的形式出現

而是純文字

對比一下你會發現

這些字都是從原本頁面的連結抽取出來的

由一個標題跟後面的網站組成

那這樣還是沒有符合我們想要的統整目的

一個好的統整頁面應該要可以還原或改進原本頁面的內容

現在我們來改一下剛剛路由

```bash
    news_list = []

    for title in titles:

        news_list.append({
            "title": title.text,
            "url": title["href"]
        })

    return render_template(
        "news.html",
        news_list=news_list
    )
```

因為返回了一個 

剛剛返回的都是純文字

現在我們要在 templates 裡面新增一個 HTML 才能給使用者一個頁面

```bash
<!DOCTYPE html>
<html>
    <head>
        <title>Hacker News</title>
    </head>
    <body>
        <h1>Hacker News</h1>
        <ul>
            {% for news in news_list %}
     
                <li>
                    <a href="{{ news.url }}" target="_blank">
                        {{ news.title }}
                    </a>
                </li>
            {% endfor %}
        </ul>
    </body>
</html>
```

現在可以在你的網站試試看

各項功能是否可以正常的運作

導覽行、統整頁面連結跳轉等等

你應該會發現

在統整頁面現在偶數網頁連結是不會有內容的（404 No Found）

回到新聞頁面

點擊看看那個在你的網站不會運作的連結

看看那些連結在原本頁面的功能是什麼

點進去觀察一下

你應該會發現

這個連結應該是一個分類用的 API

因為裡面文章後面的文章來源網站都一樣

而且觀察一下瀏覽器上面的 URL

應該會有一個

```bash
/from?site=science.org
```

/from?site=*** 代表應該是篩選文章從何而來的 API

現在我們要如何把他們網站的 API 用連結去掉呢

你可以用 F12 或右鍵開發者工具看一下

找到他們 API 連結跳轉字串

看一下它跟可用文章標題的 HTML 標籤有什麼不同

```bash
<td class="title">
    <span class="titleline">
        <a href="https://www.diffuseai.pub/p/the-structural-barriers-to-ai-lawyers">
            The Structural Barriers to AI Lawyers
        </a>
        <span class="sitebit comhead">
            (
                <a href="from?site=diffuseai.pub">
                    <span class="sitestr">
                        diffuseai.pub
                    </span>
                </a>
            )
        </span>
    </span>
</td>
```

可以看到

我們想要的是第三行的連結

```bash
<a href="https://www.diffuseai.pub/p/the-structural-barriers-to-ai-lawyers">
```

但是目標連結同一層的 span 後面還有一個 span

這個 span 裡面還有一個連結所以剛剛我們篩選全部連結標籤的時候

把所有 <a> 都抓出來放上去了

所以我們要挑的只有第一個連結

修改 news 路由

```bash
    titles = soup.select(".titleline")

    news_list = []

    for title in titles:
        main_link = title.find("a")

        news_list.append({
            "title": main_link.text,
            "url": main_link["href"]
        })
```

這樣就成功從 HackerNews 上面把別人分享的網頁網址爬下來了

但是我們現在的爬蟲還很陽春

不但不會自己更新

也沒有存入資料庫

這樣每一次跳到這個頁面都會重新爬取這個頁面

如果一直切換或重新整理太快都會造成目標頁面的負擔

雖然我們沒有一秒上萬次請求

但是這樣我們的使用者也會不方便（每次跳到這個頁面都要爬一次）

如果我們真的自行架設網站也會讓我們的架設費用增加

[回到Readme](/Readme.md)