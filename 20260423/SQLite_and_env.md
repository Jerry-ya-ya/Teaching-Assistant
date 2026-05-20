[回到Readme](/Readme.md)
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

```bash
python-dotenv
Flask-SQLAlchemy
```

建立一個叫 .env 的檔案

請注意前面有一個點

在裡面貼上

```bash
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///todo.db
```

為什麼需要 .env？

如果我們把設定直接寫死

```bash
app.config["SECRET"] = "LH102 冷氣斷電根本是酷刑"
```

會有幾個問題
- 不安全
- 不方便修改
- 不同環境不好切換

所以實務上會把設定放進 .env

現在建立一個 .env.example

在裡面貼上

```bash
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///todo.db
```

可以注意到上面的內容跟 .env 的內容是一樣的

這是因為 .env 裡面是你們要自己去改的

當然

不改也可以

但是正式環境下會把他們改掉然後只有你自己知道

可以想成是你的鑰匙串

因為裡面可能有
- 密碼
- API Key
- 資料庫網址
- Secret Key

可以讓你設下的重重關卡形同虛設

那想當然這種貴重的東西不可能丟上雲端

不然跟把自己家的鑰匙丟到大街上沒兩樣

現在在 .gitignore 新增三個要忽略的東西

```bash
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

```bash
import os
from flask import Flask, render_template, request, redirect
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
```

app 上新增

```bash
load_dotenv()
```

app 下新增

```bash
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

db = SQLAlchemy(app)
```

現在新增 Todo Model

用來描述資料表長什麼樣子

在定義資料庫後面新增

```bash
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    content = db.Column(
        db.String(200),
        nullable=False
    )
```

現在我們定義好資料表後要初始化資料庫

create_all() 會根據 Model 自動建立資料表

```bash
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

```bash
@app.route("/todo")
def todo():

    todos = Todo.query.all()

    return render_template(
        "todo.html",
        todos=todos
    )
```

在下面建立一個可以被用的 API

```bash
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

在主路由建立一個 todo.html

放入下面提供的標籤

```bash
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

{% extends "base.html" %}

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