[回到Readme](/Readme.md)

# Render

## 因應 Docker 無法使用補充本地化虛擬環境

上週因為無法使用 Docker 導致上沒一半就下課了

助教很對不起大家

在這裡說一聲抱歉

藉由這次機會

我們來體驗一下沒有 Docker 我們該怎麼在處理環境上減少時間的花費

如果我們直接在電腦上安裝套件

不同專案之間會互相影響

譬如
- A 專案使用了 1.23 版本的 Jerry-tools
- B 專案使用了 2.34 版本的 Jerry-tools

假如 2.0 版本以上有更新語法或者 2.0 沒辦法很好的適配

我們在開發跟上線的時候就可能會遇到無數的錯誤跟困難

進而導致我們把時間都拿來調整環境

不僅花時間也很消耗我們的耐心與熱情

虛擬環境就是幫每一個專案建立一個「獨立的 Python 世界」

讓 AB 專案互不干擾

也就是容器化

只是這次是用 Python 原生的虛擬環境也需要提前準備好 Python

要使用 Python 原生的虛擬環境前先檢查一下 Python

```bash
python3 --version
```

再來我們就可以建立虛擬環境

在專案根目錄

```bash
python -m venv venv
```

成功後會看到一個資料夾：venv/

建立好虛擬環境後我們要將其啟動

啟動前請注意觀察一下 venv/ 裡面的結構

如果裡面是 venv\Scripts 就用下面這個 Windows 的指令

若否則用 Mac / Linux 的指令(Codespace裡面用這個)

venv 會根據你的系統而有所不同

Windows（PowerShell）

```bash
venv\Scripts\Activate
```

Mac / Linux

```bash
source venv/bin/activate
```

成功後會看到：(venv) C:\your-path>

也就是在終端機目錄前面會看到(venv)

接下來做進一步的確認是否真的啟動

Windows（PowerShell）

```bash
where python
```

Mac / Linux

```bash
which python
```

你應該會看到路徑指向：venv/...

確定開好虛擬環境後要把套件安裝到我們的虛擬環境中

這邊建議使用我們在 Docker 時就寫好的 requirement.txt

這是一個透過 pip 套件或我們手寫建立好的清單

他可以自動告訴 pip 我們需要那些套件跟版本

就不用我們手動一個一個慢慢安裝

```bash
pip install -r requirements.txt
```

等 pip 幫我們把清單裡面的東西都安裝好了之後

我們檢查一下他有沒有遺漏東西

```bash
pip list
```

應該會看到清單裡一樣的套件

確認好所有所需套件後

我們就可以 run 我們的 flask 了

如果要離開我們的虛擬環境

```bash
deactivate
```

你會看到 (venv) 消失

關掉之後我們可以看一下成果

```bash
pip list
```

有一些套件會消失（如果全域沒裝）或者版本跟清單裡面的不一樣

最後

如果你觀察力不錯

應該會發現你的專案根目錄多了一個 __pycache__/ 檔案

那是 venv 為了記錄你虛擬環境的快取

我們為了避免它上傳到 Github

我們在根目錄建立一個 .gitignore 檔案

目的是讓 Git 忽略裡面列出的檔案

因為未來有一些檔案是我們不想上傳到公開網頁的

有些是為了讓檔案不要那麼大

但大部分是為了不要把隱私暴露出去

這也是我們 Github 上課的時候沒有上到的內容

但是是很重要的部分

## 網站託管前的知識補充

我們寫好的 Flask

不只是程式

它要被放到一台永遠開著的電腦上

讓別人可以用網址連上來

當我們完成一個 Flask MVP（Minimum Viable Product 最小可行產品）之後

程式其實只是存在於自己的電腦上

部署（Deployment） 的本質是把你的程式放到一個「別人也能存取的環境」

讓它變成真正的網站

例如：
- 本地：http://localhost:5000（只有自己看得到）
- 部署後：https://zero1-emju.onrender.com（全世界都能看）

若我們需要將我們的網站部屬上線有兩種方法
- 本地部屬
- 雲端託管

本地部署顧名思義就是程式跑在自己的電腦上

優點
- 開發速度快
- Debug 容易
- 不需要網路
- 完全掌控

缺點
- 別人無法存取
- 電腦關機就沒了
- 無法展示成果
- 不是真實環境（缺少壓力測試）

雲端部署就是程式跑在遠端伺服器（例如 Render, AWS, Azure）

優點
- 全球可存取（有 URL）
- 24 小時運行
- 可以當作品展示
- 可以逐步 scale（升級資源）

缺點
- 需要學習部署流程
- 成本問題
- Debug 比本地困難
- 需要處理環境變數 / 網路問題

雲端部署也稱為是「託管（Hosting）」

藉由託管我們就不用整天開著電腦

受到駭客利用漏洞攻擊的風險也比較低

現在主流的託管有兩種方式
- 網站託管 = 幫你「跑程式」
- 容器託管 = 幫你「跑整個環境」

以上一堂課的比喻來說的話就是

搬入房東已經裝潢好的房子跟來去自如的房車

像我們上一次上課就是教大家如何把自己的 Flask 藉由 Docker 將我們寫好的程式容器化

我們這學期的目標就是這個

教大家使用容器託管的方式把程式公開給全世界的人使用

容器託管的難度比較高

但是相對的束縛也比較少

自由度可以拉到很高

容器託管也是業界普遍使用的方式

我相信大家都很有慧根

只要有心

花一點時間一定可以學會

由於我們是初學者

一開始不要使用太過複雜

介面按鈕多得像廣告裡面爛大街手遊的託管平台（Azure）

那種託管平台雖然功能很多很強

但是太多太雜了

就連我都迷路在裡面一個禮拜才把網站託管上去

而且 Azure 雖然有學生免費額度

但是忘記關掉會不小心用掉蠻多額度的

也許這學期有機會讓大家以補充的形式看到或是操作到

為了讓大家以最快的速度看到成果

杰克幫大家找好了免費的託管平台

雖然只能託管一個容器

每次開啟網站也要等一段時間

但是也非常夠用了

## 透過 Render.com 部屬網站

請點開以下連結進入 Render 的頁面

https://render.com

![Render頁面](../img/Render/website.png)

點擊右上角的 Sign In 進入註冊的頁面

![註冊頁面](../img/Render/sign_in.png)

想必大家都有 Github 我就沒有嘗試其他登入方式

點選最左邊的 Github 登入方式

會跳轉到 Github 請你授權

授權完後就進入到 Render 的頁面

登入後的頁面應該跟下面的圖一致

![登入後](../img/Render/after_login.png)

可以看到

在 Production 的大字下面是空的

還有一個 (+ Create new service)

點擊 (+ Create new service) 進入創立服務的頁面

![建立新服務](../img/Render/create_new_service.png)

接下來看到多個服務的右上角

也就是 Web Services

點擊它下面的 New Web Service

![建立新服務](../img/Render/new_web_service.png)

進入 New Web Service 頁面後有三個方式把網站從別的地方拉上 Render

我們選擇從中間的 Public Git Repository 引入我們做好的網站

如果需要也可以選擇從 Docker Hub 把 Image 引入

![公開 Git repo 方法](../img/Render/public_git_repository.png)

選好中間的上傳方法後

我們開一個新的分頁到做好網站的Repo

![作品repo](../img/Render/repo.png)

從瀏覽器或者點擊綠色的 (<> Code) 可以找到一串 url

![repo 連結](../img/Render/repo_url.png)

複製好 url 後回到 Render 的頁面貼上

![貼上連結](../img/Render/repo_url_paste.png)

接著點下左下的 Connect

![服務設定](../img/Render/service_setting.png)

請幫你的服務命名一個能分辨出來裡面功能的名字

像我這邊只發佈前端

所以加了一個 Frontend

![服務命名](../img/Render/service_name.png)

接下來幫容器選擇語言

如果有 Docker 化就選 Docker

![服務程式語言](../img/Render/service_language.png)

分支可以依照你的 repo 分支來選擇

像我的專案有 Java 板跟 Python 版

這邊因為沒有用到後端所以選哪個都不影響

當然如果 main / master 分支是最新的也可以選擇它

![服務分支](../img/Render/service_branch.png)

伺服器地區選擇新加坡是最近的

![服務地區](../img/Render/service_region.png)

如果語言選擇 Docker 就需要幫容器找到 Dockerfile

像我的專案是前後端分離的

所以會有兩個 Dockerfile

今天要發佈前端就要找到前端的

後端亦然

![找到 Dockerfile](../img/Render/find_dockerfile.png)

我們找到了 Dockerfile 但是如果不想要讓容器太龐大可以改變根目錄

可以像下圖一樣把根目錄設為前端

讓每個容器分工合作

也就不用特地在幫 Render 找 Dockerfile 了

因為它就在根目錄

![改變根目錄](../img/Render/service_root.png)

接下來是環境變數

如果是後端容器這個部分就很重要

會用來藏 api 的前段、管理員帳號密碼之類的

但是這裡用不到就先不談

![設定環境變數](../img/Render/service_env.png)

設定好這麼一大堆之後就可以發布我們的網站了

點擊最下面的 Deploy Web Service

Render 就會開始工作了

發佈之後可以看到右下角有一塊區域一直在動

那就是你的網站在 Render 裡面的終端機

你可以看到網站的各種狀態

![發佈](../img/Render/after_deploy.png)

接著看到頁面中 Github 圖示下面有一串 url

點開 Render 給的 url 後可以看到我們的網站正在準備

![等待網站上線](../img/Render/website_waiting.png)

給他一點時間就可以看到你這段時間努力得來的成果

![網站上線](../img/Render/website_deploy.png)

## Gunicorn

剛剛的上傳完畢之後打開網頁發現部屬失敗了對吧

如果你仔細觀察 Render 裡面容器的終端機你會發現

Flask 現在是 host 在 http://127.0.0.1:5000 這個連結

127.0.0.1 代表只允許「你自己這台電腦」連線

127.0.0.1 = localhost = 自己這台電腦

:5000 代表在 5000 這個埠(ㄅㄨˋ, bù, port)

也就是我們只開了一個只有在 Render 伺服器上面才能用的網站

代表 Render 的外部流量 進不去 127.0.0.1

而且也不只是 127.0.0.1 的問題

而是因為它沒有對外提供服務（也沒有正確監聽 port）

就好像你家房子都裝潢好了但是沒有開洞裝門(我們還沒裝門)

郵差在外面喊半天繞了一圈房子也沒辦法把東西送到你手上

將房子打洞讓外面的人可以送東西進來或者拿走東西的行為

我們稱之為監聽（listening）

如果未來我們需要連接資料庫、其他容器、其他機器

都需要監聽來建立連線

也才可以不管隔了多遠的距離也可以好好的溝通

為了要解決房子四面都是牆的問題

我們需要有人來幫我們完成這個任務

這時候就需要 Gunicorn 這個套件

什麼是 Gunicorn？

Gunicorn（Green Unicorn）是一個用來執行 Python Web 應用的伺服器

Gunicorn 是「讓 Flask 在正式環境中運作」的工具

我們之前用的 Flask run 是開發用的

它

不安全
- 沒有針對外網設計
- 不適合公開網站

效能差
- 一次只能處理少量請求
- 無法有效應付多人同時訪問

不穩定
- 沒有 worker 管理
- 沒有負載能力

而 Gunicorn 不僅能將網路請求轉給 Flask

也可以設定多個 worker

讓很多人同時連線也不會導致程式崩潰或卡住不能用

接著跟 ChatGPT 說明你想要使用 Gunicorn 套件部屬 Flask

修改好之後日常三步驟把程式上傳 Github

接著到 Render 上面到容器的 Events 事件頁面上查看

應該會看到 

```bash
Deploy started for XXXXXXX: Added a ...
New commit via Auto-Deploy
```

看到有此事件代表每當你每做一次版本更新

Render 都會自動幫你把最新的版本更新上去

就不用再手動部屬一次

非常方便

如果可以透過 Render 給的網址看到自己的網站

代表你已經完全成功把網站給全球的人使用了

不妨用手機或者其他裝置看看是否也可以連接上去

到這邊大家對於將一個網站架設到公網已經有一定的概念

希望各位有收穫了一點成就感

我知道這些都不容易

過程中很多步驟有點繁瑣跟障礙

很感謝不管是為了自己還是期末作品而來上助教課的大家

[回到Readme](/Readme.md)