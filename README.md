# Hiro English Coach API Version

## 構成

- GitHub Pages: 画面
- Cloudflare Worker: OpenAI APIへの中継
- OpenAI API Key: Cloudflare WorkerのSecretに保存

公開サイトのJavaScriptにAPIキーを入れないでください。

## 1. GitHub Pages側

既存のGitHubリポジトリに以下をアップロードしてください。

- index.html
- manifest.webmanifest
- sw.js
- icon.svg

## 2. Cloudflare Workerを作る

Cloudflare dashboard → Workers & Pages → Create application → Worker

Worker名の例:

hiro-english-coach-api

作成後，worker.js の中身をコピーして貼り付け，Deployしてください。

## 3. Secretsを設定する

Cloudflare Worker → Settings → Variables and Secrets → Add

以下を追加してください。

### Secret
Variable name:

OPENAI_API_KEY

Value:

あなたのOpenAI APIキー

### Variable 任意
Variable name:

OPENAI_MODEL

Value:

gpt-5.5

### Variable 任意
Variable name:

ALLOWED_ORIGIN

Value:

https://androphir-pixel.github.io

## 4. アプリ側にWorker URLを入れる

公開済みアプリを開く → Settings → Cloudflare Worker URLに以下のようなURLを入れる。

https://hiro-english-coach-api.<あなたのサブドメイン>.workers.dev

保存。

## 5. 使い方

Homeでテーマとメモを入力 → AIで教材生成 → Lessonタブに1分スクリプト等が自動表示 → Voiceタブで英語音声入力 → WPM計測 → AI添削。
