[回到Readme](/Readme.md)

# Render

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

https://render.com/

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

[回到Readme](/Readme.md)