# Hiro English Dashboard Add-on v1

## 重要
既存の `index.html` は一切変更しません。

追加するファイルは以下だけです。

- dashboard.html
- dashboard.css
- dashboard.js
- README_DASHBOARD.md

## 使い方
GitHubの同じリポジトリ `/kuro/` に上記ファイルをアップロードします。

開くURL:

https://androphir-pixel.github.io/kuro/dashboard.html

## できること

- Daily Review
- Speaking Feedback Log
- Weekly Report
- Theme Ideas
- Search & Tags
- Dashboard専用データのExport/Import

## データ保存
既存アプリ本体のデータは読み取り専用です。

Dashboardで新しく保存するFeedbackやタグは，以下の別localStorageキーに保存します。

- hiroEnglishDashboard.v1

既存アプリ本体のlocalStorageキー:

- hiroEnglishCoach.stable.v5
