# CalorieBuddy 設計TODO

> 実装前に決めるべき設計事項。1つずつ壁打ちで決めていく。

## 1. ディレクトリ構成 → [design-directory.md](./design-directory.md)
- [x] App Router のルーティング構造（`app/` 配下）
- [x] コンポーネント・Server Actions・DB層の配置ルール

## 2. UIライブラリ / スタイリング方針 → [design-ui.md](./design-ui.md)
- [x] スタイリング手法の選定（Tailwind CSS + shadcn/ui）
- [x] グラフライブラリの選定（Recharts）

## 3. DB設計 → [design-db.md](./design-db.md)
- [x] Drizzle ORM スキーマ定義方針
- [x] UUID生成方法（DB側 `gen_random_uuid()`）
- [x] マイグレーション管理方法（`drizzle-kit generate` + `migrate`）

## 4. Gemini API連携設計 → [design-gemini.md](./design-gemini.md)
- [x] プロンプト設計（カロリー推定 / 励ましメッセージ）
- [x] レスポンスの型定義・バリデーション方法（Structured Output + Zod 二段検証）
- [x] エラーハンドリング・キャッシュ戦略（429/5xxのみ1回リトライ・フォールバック・キャッシュなし）

## 5. 状態管理 / データフェッチ方針 → [design-state.md](./design-state.md)
- [x] Server Components / Client Components の境界（最小の葉コンポーネントのみ use client）
- [x] Server Actions の粒度と設計（1アクション = 1関数、useActionState）
- [x] フォームバリデーション（Zod、クライアント・サーバー両方検証）

## 6. デプロイ / 環境設定 → [design-deploy.md](./design-deploy.md)
- [x] 環境変数の管理方法（.env.local + Vercel 環境変数）
- [x] Neon接続設定（@neondatabase/serverless + 接続プーリング）

## 7. テスト方針（MVP） → [design-test.md](./design-test.md)
- [x] テスト対象を `lib/calc.ts` に限定
- [x] Vitest + 最低限ケース（BMR / METs / 歩数 / 収支判定境界）を定義

## 8. AI駆動開発ワークフロー → [design-ai-workflow.md](./design-ai-workflow.md)
- [x] TAKT セットアップ手順
- [x] GitHub Issue 分割（Phase 0〜3、14 Issue）
- [x] Issue テンプレート・記述ルール
- [x] TAKT ワークフロー設定（ピース・ペルソナ）
- [x] 開発フロー全体像（TAKT / Claude Code 直接の使い分け）
