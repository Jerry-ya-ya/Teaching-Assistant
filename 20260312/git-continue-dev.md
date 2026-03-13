[回到Readme](/Readme.md)

# 在另一台裝置接續開發

如果我們需要在「另一個裝置」上繼續開發我們已經建立好、更新過的repo，可以使用以下操作接續開發

## 檢查是否安裝 & 檢查安裝版本

```bash
git --version
```

## 在新裝置新增資料夾

這個資料夾是要放置複製下來的專案

所以等一下複製下來的下一層才是repo

以如下格式進行repo的克隆，把遠端的repo複製下來

git clone https://github.com/你的帳號/你的repo.git

```bash
git clone
```

等待克隆完成，重新在VScode打開下一層你剛剛克隆好的 repo

接下來打開終端機輸入指令查看所有分支

```bash
git branch -a
```

你會看到：
- '*' main
- remotes/origin/main
- remotes/origin/***

本地端應該是綠色且前面沒有 remotes 前綴

分支前方有 '*' 代表你現在所處的分支

在你準備要開發的時候季的要檢查一下自己所在的分支

千萬不要等到要 commit 才發現自己在奇怪的地方

會比較麻煩

現在到倉庫主頁

點擊倉庫名稱下方的分支圖示的main

開啟選單之後再點選裡面的 View all branches

進入到查看所有分支的頁面後點選右上角的綠色 New branch 按鈕

輸入分支名字(可以是人名、版本、新功能或者是 bug 修復，基本上參考專案的大小跟合作的人數決定)

輸入好名字之後店選右下角的綠色 Create new branch 按鈕

建立好後應該會在 View all branches 頁面看到你剛剛建立的分支

第一堂課來不及講

基本上在專案開始的時候就會建好分支不會等到接續工作再建立

但是這也是建立一個新分支後必要的流程

這樣才能在新分支進行開發

之後回到本地的 VScode 在終端機輸入兩個更新倉庫的指令

```bash
git fetch
```

```bash
git pull
```

接著要切換到你上次所使用或者剛建立的分支

可以按照下面的格式在本地建立分支並追蹤遠端

前面是本地後面是遠端

git switch -c *** origin/***

```bash
git switch -c 
```

最後檢查一下所有分支就可以繼續更新了

```bash
git branch -a
```