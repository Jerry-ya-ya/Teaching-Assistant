[回到Readme](/Readme.md)

# SQLite 與環境變數

到目前為止

我們已經可以
- 建立 Flask 網站
- 使用多 routes
- 使用 Jinja
- 建立共用版型

SQLite 是一種輕量級資料庫

它不需要另外開資料庫伺服器

只會產生一個 .db 檔案

很適合拿來做小型專案、MVP、練習資料庫操作

它旨在一個檔案一個庫

例如：todo.db

如果 Todo 只存在 Python list 裡

伺服器重開之後會怎樣？

資料會消失

所以資料庫要解決的是

讓資料可以被長期保存

現在在 requirements.txt

新增兩個套件

**套件清單：`requirements.txt`（新增）**

```text
python-dotenv
Flask-SQLAlchemy
```

> [!TIP]
> **建立檔案：`.env`**
> 在專案根目錄新增 `.env`（檔名前有一個點），填入下方設定。實際密鑰應由自己設定。

**設定檔：`.env`**

```dotenv
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///todo.db
```

為什麼需要 .env？

如果我們把設定直接寫死

**反例：將密鑰寫死在程式中**

```python
app.config["SECRET"] = "example-secret-key"
```

會有幾個問題
- 不安全
- 不方便修改
- 不同環境不好切換

所以實務上會把設定放進 .env

> [!TIP]
> **建立檔案：`.env.example`**
> 在專案根目錄新增 `.env.example`，填入下方範例設定，供其他開發者參考。只保留占位值。

**設定範本：`.env.example`**

```dotenv
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///todo.db
```

可以注意到上面的內容跟 .env 的內容是一樣的

這是因為 .env 裡面是你們要自己去改的

> [!WARNING]
> **正式環境設定**
> 正式環境必須替換範例密鑰，並透過受控的環境變數或秘密管理機制提供設定。

可以想成是你的鑰匙串

因為裡面可能有
- 密碼
- API Key
- 資料庫網址
- Secret Key

可以讓你設下的重重關卡形同虛設

那想當然這種貴重的東西不可能丟上雲端

不然跟把自己家的鑰匙丟到大街上沒兩樣

> [!IMPORTANT]
> **修改 `.gitignore`**
> 將下方三項加入專案根目錄的 `.gitignore`，避免提交真實環境設定與本地資料庫。

**忽略清單：`.gitignore`（新增）**

```gitignore
.env
instance/
*.db
```

.db 是你的寶庫

而 .env 則是你的寶庫鑰匙

這兩項在未來無論如何也不要給開發人員以外的人

也千萬不可以上傳到任何一個地方

現在我們可以建立第一個 SQLite 資料庫

在 app.py 修改

**程式碼（Python）**

```python
import os
from flask import Flask, render_template, request, redirect
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
```

app 上新增

**程式碼（Python）**

```python
load_dotenv()
```

app 下新增

**程式碼（Python）**

```python
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

db = SQLAlchemy(app)
```

現在新增 Todo Model

用來描述資料表長什麼樣子

在定義資料庫後面新增

**程式碼（Python）**

```python
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    content = db.Column(
        db.String(200),
        nullable=False
    )
```

現在我們定義好資料表後要初始化資料庫

create_all() 會根據 Model 自動建立資料表

**程式碼（Python）**

```python
with app.app_context():
    db.create_all()
```

現在我們要建立可以用資料庫儲存東西的路由

這種不是回傳 HTML 的路由叫做 API

可以把它當成一個服務

是「不同程式之間溝通的方法」

因為我們要讓 Flask 幫我們把東西存進資料庫

所以會有一個路由不是回傳畫面而是做動作

今天我們要做的事很經典的 CRUD 服務

CRUD 分別是
- Create    建立
- Read      讀取
- Update    更新
- Delete    刪除

這些是最核心、最基礎、幾乎所有系統都一定會有的資料操作

大部分網站本質上都在做這四件事

之後可能還會有
- Migration（資料庫遷移）
- Query（進階查詢）
- Transaction（交易）
- Backup / Restore（備份與還原）
- Index（索引）
- Permission（權限）
- Replication（複製）
- ETL / Data Pipeline

但現在先不要擔心這些

在主路由下面新增一個新的路由

**程式碼（Python）**

```python
@app.route("/todo")
def todo():

    todos = Todo.query.all()

    return render_template(
        "todo.html",
        todos=todos
    )
```

在下面建立一個可以被用的 API

**程式碼（Python）**

```python
@app.route("/add", methods=["POST"])
def add_todo():

    content = request.form.get("content")

    if content:

        new_todo = Todo(content=content)

        db.session.add(new_todo)

        db.session.commit()

    return redirect("/todo")
```

接著

> [!TIP]
> **建立檔案：`templates/todo.html`**
> 在 `templates/` 資料夾新增 `todo.html`，填入下方待辦事項頁面，供 `/todo` 路由使用。

**程式碼（HTML / Jinja）**

```html
<!DOCTYPE html>
    <html>
        <head>
            <title>Todo List</title>
            <link rel="stylesheet" href="{{ url_for('static', filename='index.css') }}">
        </head>
        <body>
            {% extends "navbar.html" %}

            {% block content %}

            <h1>Todo List</h1>
            
            <form action="/add" method="POST">
                <input
                    type="text"
                    name="content"
                    placeholder="請輸入待辦事項"
                >
                    <button type="submit">
                        新增
                    </button>

            </form>

            <hr>

            <ul>

            {% for todo in todos %}

                <li>{{ todo.content }}</li>

            {% endfor %}

            </ul>

            {% endblock %}
        </body>
    </html>
```

把上一堂課的導覽行 HTML 改成 navbar.html

在裡面新增 todo 頁面的導向按鈕

之後透過一些技巧把所有 HTML 頁面的 base.html

`{% extends "base.html" %}`

改成 navbar.html

最後 index.css 引用到所有 HTML 頁面

把 HTML 展示頁面的 main 標籤註解

現在應該所有頁面的導覽行都長一樣了

現在在粉紅色鯨魚重啟應用程式

跳到 todo 頁面應該會看到一個輸入欄

可以在裡面輸入一點待做事項

再重啟一次應用程式看剛剛輸入的資料有沒有消失

重啟完應該會看到資料還是一樣

但是現在我們只有一個新增的功能

[回到Readme](/Readme.md)
