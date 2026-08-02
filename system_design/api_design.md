[回到Readme](/Readme.md)

利用 Flask 當後端開發了一段時間

測試前端功能的時候我會看 Docker 後端的 log

發現一個前端按鈕可能會用到好幾個api

所以我想到有關結構性的問題

我應不應該把它們切分得更細

把常用的切分出來?

還是就這樣就好?

畢竟每一次的 Query 、 log 的儲存

都會提高對網站長期運營的壓力

如果只有少數人會訪問也許不是問題

但是網站的程式越變越大

之後要改可能會很吃力

如果一直放任這個結構問題不管

讓程式沒有經過良好規劃

只要有新需求就隨便在原本的架構上往上加蓋

導致最後結構脆弱、隨時會塌

改一個地方就全部壞掉

所以很多工程師都笑說可以動就不要去管它怎麼動起來的

甚至還有一個bug是bug，兩個bug是work

這些後果就是 Spaghetti code 造成的

也就是你的程式變成一個大雜燴

你已經分不清哪個地方會影響到哪一個功能

很多程式或遊戲就是因為這個原因所以乾脆整個打掉重做比較快

因為重構（Refactoring） 很累人

也會讓人感到無比的煩躁

這一坨大雜燴更是讓成本直線上升

那我們應該怎麼設計 api?

實際上

不需要因為「一個按鈕會呼叫很多 API」就立刻把 API 切得更細

真正要看的是

這些操作在業務上

究竟是一件事

還是好幾件彼此獨立的事？

先用一個例子理解

假設使用者按下「建立專案」後

前端依序做

```text
1. 建立專案
2. 建立預設 Todo
3. 發送通知
4. 扣除或發放點數
5. 寫入活動紀錄
```

如果前端自己連續呼叫五支 API：

```text
createProject()
createDefaultTodo()
updatePoints()
sendNotification()
createActivityLog()
```

這種設計容易出現

```text
專案建立成功
Todo 建立成功
點數更新失敗
通知發送失敗
```

最後系統變成半完成狀態

這時候不應該繼續把 API 拆得更碎

而是應該提供一支代表完整業務行為的 API

```text
POST /api/projects
```

由後端內部處理

```text
建立專案
→ 建立預設資料
→ 更新點數
→ 建立通知
→ 寫入紀錄
```

前端按鈕只需要呼叫一次

什麼情況應該合併成一支 API？

如果這些動作具有以下特性，建議由後端統一處理：

每次都會一起執行
有固定執行順序
其中一步失敗，其他步驟也不應成立
涉及點數、權限、付款、庫存或資料一致性
前端不需要知道內部細節
不同前端未來也會重複這段流程

例如：

```text
POST /api/project-recruitments
POST /api/friend-requests/{id}/accept
POST /api/orders/{id}/checkout
POST /api/tasks/{id}/complete
POST /api/users/register
```

這些都是「業務行為 API」

不是單純資料表 CRUD

例如接受好友邀請

後端可以一次處理：

```text
邀請狀態改為 accepted
建立好友關係
發送通知
寫入活動紀錄
```

而不是由前端分別呼叫四支 API

什麼情況應該保留多支 API？

如果這些資料彼此獨立，而且可能在不同頁面、不同時間使用，就應該分開。

例如進入個人頁面時：

取得個人資料
取得貼文
取得好友
取得最近活動

可以分成：

```text
GET /api/users/me
GET /api/users/me/posts
GET /api/users/me/friends
GET /api/users/me/activities
```

原因是：

```text
有些區塊可能不需要顯示
可以分批載入
某一支失敗不應影響其他資料
可以獨立快取
可以平行請求
手機版與桌面版可能需要不同資料
```

我在前面提到

是不是應該把常用的切分出來？

「常用」比較適合用來決定前端 Service 的封裝

而不是直接決定後端 API 的粒度

不要以「是否常用」作為 API 拆分標準

例如很多元件都會取得登入使用者

```text
getCurrentUser()
```

可以放到

```text
core/services/auth.service.ts
```

而好友相關的 API

```text
features/friend/services/friend.service.ts
```

專案相關的 API

```text
features/project/services/project.service.ts
```

也就是

```text
後端 API：按照資源與業務行為設計
前端 Service：按照功能領域與重用程度整理
```

不要做成一個超大的

```text
api.service.ts
```

裡面放

```text
login()
getProfile()
createPost()
deleteFriend()
updateTodo()
runCrawler()
```

這樣後面會很難維護

Component 裡不要直接堆很多 HttpClient

```text
this.http.post(...)
this.http.patch(...)
this.http.get(...)
```

而是呼叫有業務意義的方法

```text
this.projectService.publishRecruitment(form);
```

即使內部暫時需要呼叫多支 API

Component 也不應知道細節

一個實用判斷表

| 情境 | 建議 |
| :--- | :--- |
| 每次一定一起做 | 合成一個業務 API |
| 任一步失敗都必須回滾 | 後端 transaction |
| 只是頁面同時需要多種資料 | 保留多支 GET API |
| 各區塊可獨立載入 | 分開 |
| 資料會在不同頁面重用 | 分開 |
| 前端一直重複同一串呼叫 | 考慮 Facade 或聚合 API |
| API 只是為了對應每一張資料表 | 重新思考業務語意 |
| 涉及權限、點數、付款 | 絕對不要交給前端串接決策 |

你的按鈕如果屬於

```text
發布專案招募
接受好友邀請
完成高優先任務
管理員核發點數
註冊帳號
```

建議每個按鈕對應一支主要的業務 API，後端完成所有必要操作。

如果只是

```text
打開個人頁面
顯示 Dashboard
載入首頁不同區塊
```

則保留多支查詢 API

前端平行取得即可

最重要的原則是

前端負責觸發意圖

後端負責保證業務流程完整

這本質上是系統架構與 API 邊界設計的問題

幾乎所有程式語言、前後端框架都必須思考

不過結論不是「每個按鈕一支 API」

也不是「每個資料表一支 API」

而是每個具有明確責任、權限與一致性需求的操作

應該有合理的 API 邊界

一個按鈕呼叫多支 API 不一定錯

假設使用者進入個人頁面，需要顯示：

```text
基本資料
頭像
貼文
好友數量
通知數量
```

這些資料彼此相對獨立，可以分開取得：

```text
GET /api/me
GET /api/users/me/posts
GET /api/users/me/friend-summary
GET /api/notifications/unread-count
```

這樣的好處是：

```text
每個區塊可以獨立載入
某支 API 失敗，不一定拖垮整頁
可以個別快取
不需要的區塊就不用請求
權限與資料模型比較清楚
```

這種分割通常是合理的

但一個「單一動作」要呼叫多支寫入 API

就要特別小心

例如「發布專案招募」按鈕需要：

```text
建立專案
建立招募文章
扣除或發放點數
建立操作紀錄
發送通知
```

前端若依序呼叫：

```text
POST /projects
POST /recruitments
POST /points
POST /audit-logs
POST /notifications
```

就很危險

假設前兩支成功

第三支失敗，系統可能變成：

```text
專案已建立
招募文已建立
點數沒有處理
通知也沒有發送
```

這叫做部分成功或資料不一致

這種情況比較適合讓前端只呼叫一支用途明確的 API：

```text
POST /api/project-recruitments
```

由後端在同一個服務流程中完成：

```text
驗證權限
→ 建立專案
→ 建立招募資料
→ 處理點數
→ 寫入紀錄
→ 提交資料庫交易
→ 排程通知
```

前端不需要知道內部其實動了幾張資料表或幾個服務

不是每個「內部步驟」都需要公開成 API

API 是提供給客戶端使用的介面

不等於後端每個函式

例如：

```text
calculateReward()
createAuditLog()
validateProjectOwner()
sendNotification()
```

這些可以只是後端內部的 service function，不必全部變成：

```text
POST /api/calculate-reward
POST /api/create-audit-log
POST /api/validate-owner
```

否則前端會承擔太多業務流程，也會增加：

```text
權限繞過風險
請求次數
網路延遲
錯誤處理複雜度
資料不一致
API 維護成本
攻擊面
不需要查出的資料，確實有資安與成本問題
```

假設前端只需要：

```json
{
  "id": 12,
  "nickname": "Jerry",
  "avatarUrl": "/avatars/12"
}
```

後端卻回傳：

```json
{
  "id": 12,
  "nickname": "Jerry",
  "avatarUrl": "/avatars/12",
  "email": "example@example.com",
  "passwordHash": "...",
  "verificationToken": "...",
  "role": "admin",
  "internalNote": "...",
  "lastLoginIp": "..."
}
```

這不只是浪費流量

而是嚴重的資料暴露

即使前端畫面沒有顯示

使用者仍然能在：

```text
F12 → Network → Response
```

看到所有回傳資料

因此後端應該使用專門的回應模型

例如：

```
interface PublicUserResponse {
  id: number;
  nickname: string;
  avatarUrl: string | null;
}
```

而不是把整個資料庫模型直接序列化回傳

不必要資料的主要問題

```text
資安：敏感欄位可能被暴露
隱私：取得業務功能不需要的個人資料
效能：資料庫查詢、序列化與傳輸成本增加
維護性：資料表新增欄位後，可能意外跟著 API 洩漏
耦合：前端開始依賴後端內部資料結構
```

不過要注意

「不回傳敏感資料」不能取代真正的權限控制

即使回傳欄位很少

後端仍然必須驗證目前使用者是否有權讀取或修改該資源

在不考慮後端開發成本時

也不是每個動作都要獨立 API

切得過細會產生所謂的 Chatty API：

```text
取得使用者名稱
取得頭像
取得職位
取得好友數
取得貼文數
取得專案數
```

如果一個頁面需要發出二十支請求，可能造成：

```text
網路往返時間增加
Loading 狀態複雜
錯誤處理困難
手機網路體驗不佳
前端程式變得零碎
後端連線與認證成本增加
```

因此可以提供一個針對頁面或使用情境設計的聚合 API：

```text
GET /api/profile-overview
```

回傳：
```json
{
  "profile": {
    "id": 12,
    "nickname": "Jerry",
    "avatarUrl": "/avatars/12"
  },
  "statistics": {
    "postCount": 10,
    "friendCount": 25,
    "projectCount": 3
  },
  "permissions": {
    "canEdit": true
  }
}
```

這種 API 有時稱為：

```text
Composite API
Aggregation API
Backend for Frontend，簡稱 BFF
View Model API
```

它不是粗糙地把所有資料都塞進去

而是只回傳該畫面真正需要的資料

可以用這個原則判斷

適合合併成一支 API

當這些操作：

```text
共同構成一個使用者動作
必須全部成功或全部失敗
有固定執行順序
共享相同權限
前端不應控制內部流程
幾乎每次都會一起使用
```

例如：

```text
POST /api/project-recruitments
POST /api/orders/checkout
POST /api/friend-requests/{id}/accept
POST /api/posts/{id}/publish
```

接受好友邀請可能不只是更新一筆狀態

後端還可能建立雙方關係、寫入通知、增加紀錄

前端只需要表達「接受邀請」

適合拆成多支 API

當資料或操作：

```text
可以獨立存在
更新頻率不同
權限不同
可以單獨快取
頁面不一定每次都需要
某一部分失敗不影響其他部分
```

例如：

```text
GET /api/users/{id}
GET /api/users/{id}/posts
GET /api/users/{id}/projects
GET /api/users/{id}/friends
```

我建議 API 分成三個層次

```text
Controller / Route
    ↓
Application Service
    ↓
Repository / Database
```

例如前端：

```text
POST /api/project-recruitments
```

Controller 負責：

```text
解析請求
驗證登入
呼叫服務
組合回應
```

Application Service 負責：

```text
驗證業務規則
建立專案招募
處理點數
建立紀錄
觸發通知
控制 transaction
```

Repository 負責：

```text
查詢與寫入資料庫
```

這樣你可以維持「前端只呼叫一支 API」

同時後端內部仍然切成很多小函式與服務

而不是把幾百行程式全部塞進同一個 route

最實用的判斷句

設計 API 時可以問：

```text
前端是在要求一份資料
還是在表達一個業務意圖？
```

要求資料：

```text
GET /api/users/12/posts
```

表達業務意圖：

```text
POST /api/friend-requests/45/accept
POST /api/projects/18/publish
POST /api/tasks/20/complete
```

業務意圖通常應由一支 API 完整處理

而不是讓前端自己拼湊後端流程

所以最終答案是

不是每個按鈕固定對應一支 API

也不是每個內部動作都要獨立一支 API

讀取資料依照資料邊界與頁面需求拆分

具有交易一致性的業務動作

通常由一支用途明確的 API 統一完成

回應資料則應遵循最小必要原則

只查詢並回傳使用情境真正需要的欄位

[回到Readme](/Readme.md)