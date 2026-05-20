[回到Readme](/Readme.md)

市面上常見的資料庫主要分為兩大陣營

關聯式資料庫 (SQL) 與 非關聯式資料庫 (NoSQL)

上次介紹的 SQLite 跟這次的 Postgre 資料庫都是關聯式資料庫 (SQL)

資料以表格（Table）為單位儲存

具備高度結構化

適合處理複雜的交易與嚴謹的資料一致性

而非關聯式資料庫 (NoSQL)

打破傳統表格限制

採用文件、鍵值（Key-Value）、圖形（Graph）等多元結構儲存

具備高擴展性與靈活性

適合巨量資料

這裡介紹三個
- Redis：極速的「鍵值（Key-Value）」記憶體資料庫，資料存取速度極快，常被用作快取（Cache）、訊息佇列或處理即時狀態
- Neo4j：最主流的「圖形資料庫（Graph Database）」，以節點與邊來記錄關聯性，非常適合處理社交網路推薦、詐欺檢測等高度關聯的資料
- MongoDB：以「文件（Document）」為基礎的 NoSQL，資料結構類似 JSON 格式，開發彈性極高，廣泛應用於現代 Web 應用程式

那為什麼有這麼多不同資料庫？

因為不同場景需要不同特性

像上禮拜我們建立的 SQLite 根本不需要多做連線也不需要多餘的安裝

這禮拜我們要用的 Postgre 雖然在雲端

但是如果你要本地建立資料庫的話

大部分是要裝一些專用軟體

例如 Microsoft SQL Server (MS SQL) 需要先用 SQL server management studio 開啟資料庫

第一次連線甚至要管理員權限

而且如果要看資料庫裡面的表

也會有一些專用的查表程式

像 Postgre 就有一款查表軟體叫做 pgAdmin4

剛剛提到 PostgreSQL 是一種關聯式資料庫管理系統

(Relational Database Management System, RDBMS)

主要用來
- 儲存資料
- 查詢資料
- 更新資料
- 管理大量使用者與大量資料

很多正式網站、後端 API、金融系統、電商平台都會使用 PostgreSQL

也極受現代開發者歡迎

PostgreSQL 的特色
- 開源
- 支援 SQL
- 適合正式專案
- 支援多使用者同時操作
- 資料型態很多

1. 開源（Open Source）
- 免費
- 可自行架設
- 可修改原始碼

2. 支援 SQL
PostgreSQL 使用：
- SELECT
- INSERT
- UPDATE
- DELETE

這類 SQL 指令操作資料

3. 適合正式專案

SQLite 很適合：
- 小型專案
- 教學
- 本機測試

但 PostgreSQL 更適合：
- 多人同時使用
- 正式網站
- 雲端服務
- 大量資料

4. 支援多使用者同時操作

例如：1000 人同時登入網站

PostgreSQL 仍然可以管理資料一致性

SQLite 因為本質上是單一檔案： todo.db 大量同時寫入時容易卡住

5. 資料型態很多

除了：
- 文字
- 數字
- 日期

還支援：
- JSON
- 陣列
- 地理資訊

介紹完後現在我們來看看要如何建立雲端的 PostgreSQL

登入 Render 後到 Dashboard 的地方

上面導覽行的地方有一個新增服務的地方

![新增服務按鈕](/img/Render/postgre_01.png)

選擇 Postgre 資料庫建立

![新增資料庫](/img/Render/postgre_02.png)

填寫資料庫命名與使用者設定(第一行必要，其他自行決定)

![服務設定](/img/Render/postgre_03.png)

選擇免費方案(三天會自行刪除)

![選擇方案](/img/Render/postgre_04.png)

建立好就可以使用了

現在我們要把 PostgreSQL 接上 Flask

在 Render PostgreSQL 設定中

找到 connection 區塊

![connection 區塊](/img/Render/postgre_connection.png)

裡面有一行叫做 Internal Database URL

另外一行是 External Database URL

![Database URL](/img/Render/postgre_database_url.png)

現在我們要從 Render 外面連進 Render 內的資料庫

所以我們要選 External Database URL

Internal Database URL 是給 Render 內部連線的

也就是我們部屬在 Render 上的程式要用的

等等再進一步解釋

這邊要用到的是 External Database URL

才能讓我們在外面可以連進去

.env 裡面的 DATABASE_URL 修改成剛剛看到的 External Database URL

在 Render 內複製貼上就好

.env & .env.example 修改

```bash
# External Database URL / Internal Database URL
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

requirements.txt 新增一個套件

```bash
psycopg2-binary
```

psycopg2 是 Python 連線 PostgreSQL 的驅動程式

我們要幫 Flask 裝上他兩邊才可以溝通

後面的 binary 代表這個是它已經幫你編譯好的套件可以直接使用

新增好套件然後 docker-compose 重新建立程式

測試一下 todo 頁面可不可以正常運作

如果可以我們來幫它新增一點功能

app.py 新增刪除 API 路由

```bash
@app.route("/update/<int:id>", methods=["POST"])
def update_todo(id):

    todo = Todo.query.get(id)

    if todo:

        new_content = request.form.get("content")

        if new_content:

            todo.content = new_content

            db.session.commit()

    return redirect("/todo")
```

本地測試完成之後利用日常三步驟把更新好的程式推送到遠端

接下來是利用 Postgre 查表程式 pgAdmin4

看看剛剛我們手動輸入的測試訊息有沒有成功存入資料庫

在下面的網址下載好 pgAdmin4

示範版本 9.6

https://www.pgadmin.org

下載後將其打開

對左邊的 Servers 右鍵

出現選單選擇 Register Server

![選單選擇](/img/pgAdmin/connection/01.png)

幫 pdAdmin 裡面要顯示的資料庫命名

這裡沒有嚴格限定自行決定要叫什麼

只要認得出來就可以

![資料庫命名](/img/pgAdmin/connection/02.png)

從上面的導覽行跳到設定資料庫連線的 Connection

現在我們要把剛剛的 External Database URL 拆解成多個部分再輸入到 pdAdmin

下面是我剛剛貼上的 External Database URL

```bash
postgresql://jerry:mABi4NUq18w9PGJtGFx5huiVbt5JJ2NM@dpg-d860ng1kh4rs73cdss6g-a.singapore-postgres.render.com/jerry_1234_eug3
```

剛剛我們在修改 .env.example 的時候有寫到

```bash
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

這就是標準的 Postgre 連線 URL

一般來說

資料庫連線 URL 是這樣設計的

總共有五大塊
- postgresql(資料庫類別名稱)
- USER(使用者名稱)
- PASSWORD(使用者密碼)
- HOST:PORT(資料庫伺服器位置)
- DATABASE(要使用的資料庫名稱)

現在切分剛剛拿到的 External Database URL

```bash
postgresql://

jerry

:

mABi4NUq18w9PGJtGFx5huiVbt5JJ2NM

@

dpg-d860ng1kh4rs73cdss6g-a.singapore-postgres.render.com

/

jerry_1234_eug3
```

這邊把密碼放上來是因為這個資料庫三天就會自己消失

而且密碼是 Render 隨機生成的

千萬不要把密碼放到公開的地方

切好了之後一一對照填到 pdAdmin 裡面的連線設定

請記得要從 External Database URL 去切

不要用 Render 裡面表格的東西

![連線設定](/img/pgAdmin/connection/03.png)

填好了之後就可以開始查表了

剛剛連上線的是 Render_Jerry 資料庫

所以把它展開

![展開資料庫](/img/pgAdmin/connection/04.png)

展開資料庫後展開 Databases

![展開 Databases](/img/pgAdmin/connection/05.png)

選擇展開剛剛切分 URL 時的最後一個參數

也就是選擇 Render 生成給我們的資料庫名稱

![展開資料庫名稱](/img/pgAdmin/connection/06.png)

然後展開 Schemas (架構)

這裡會放一些跟資料庫架構有關的檔案

我們要找的資料表就在這裡

![展開資料庫架構](/img/pgAdmin/connection/07.png)

在 Schemas 裡面找到 Tables (資料表) 把它展開

如果未來建立多個表

這邊會變比較多個

現在我們只有 todo 這個資料表

![展開資料表](/img/pgAdmin/connection/08.png)

對 todo 資料表右鍵

找到 View/Edit Data 選擇 All Rows

![View/Edit Data](/img/pgAdmin/connection/09.png)

這樣就可以看到所有剛剛我們測試輸入的內容了

這裡資料表會以 ID 做排序

但是我們做了一個修改的功能

所以修改後的 todo 會跑到下面

這是可以自己去優化的部分

![測試輸入](/img/pgAdmin/connection/10.png)

[回到Readme](/Readme.md)