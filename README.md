# IritoDeVoice

## プロジェクト概要
IritoDeVoice は、React を用いたフロントエンドと Express ベースのバックエンドで構成されたフルスタック Web アプリケーションです。Drizzle ORM を通じて PostgreSQL と通信し、TypeScript と Vite によって開発されています。

## セットアップ
1. 依存関係をインストールします。
   ```bash
   npm install
   ```
2. 環境変数を設定します。例として `.env` に `DATABASE_URL` などを記述してください。
3. 必要に応じてデータベースを初期化します。
   ```bash
   npm run db:push
   ```

## 開発
```bash
npm run dev
```
Express サーバーと Vite を組み合わせた開発環境が起動し、API と React クライアントが同じポートで提供されます。

## ビルド
```bash
npm run build
```
クライアントとサーバーのコードを `dist/` に出力します。

## 本番起動
```bash
npm start
```
ビルド成果物を用いた Express サーバーが起動します。

## 使用技術
- React
- Express
- Drizzle ORM
- Vite
- Tailwind CSS
- TypeScript

## ディレクトリ構造
```text
.
├── client/             # フロントエンド (React + Vite)
├── server/             # バックエンド (Express)
├── shared/             # 共通の型やユーティリティ
├── drizzle.config.ts   # Drizzle ORM の設定
├── tailwind.config.ts  # Tailwind CSS の設定
├── vite.config.ts      # Vite の設定
└── そのほか各種設定ファイル
```
