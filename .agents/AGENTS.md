# CalorieBuddy

AI駆動カロリー収支管理アプリ（自分専用）。食事テキストからGemini AIがカロリー推定し、体重・運動・歩数と合わせて収支を管理する。

## Tech Stack

Next.js (App Router) / React 19 / TypeScript / Tailwind CSS + shadcn/ui / Recharts / Drizzle ORM / Neon PostgreSQL / Gemini API (`@google/genai`, model: `gemini-2.5-flash`) / Vercel

## Commands

```bash
pnpm dev              # 開発サーバー起動
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm type-check       # TypeScript型チェック
pnpm build            # プロダクションビルド
pnpm test             # Vitest実行
```

## Architecture

Feature-based colocation。`page.tsx`はデータ取得とコンポーネント組み立てのみ。

```
src/
├── app/              # ルーティングのみ（/, /meals, /exercise, /weight, /settings）
├── features/         # 機能単位（dashboard, meals, exercise, weight, settings）
│   └── */            # components/, actions.ts, queries.ts, schemas.ts
├── components/       # 共有UI（ui/ = shadcn, layout/ = ナビ・ヘッダー）
├── db/               # schema.ts（Drizzle定義）+ index.ts（接続）
└── lib/              # gemini.ts, calc.ts, constants.ts
```

詳細: @docs/design-directory.md

## Code Rules

- Server Components をデフォルトにする。`'use client'`は最小のリーフコンポーネントだけ
- `useActionState`でフォーム処理、`useTransition`で非フォーム操作
- Server Action 後は必ず`revalidatePath`で再検証する
- クエリ関数の先頭に`noStore()`を書く（静的生成を防ぐ）
- 1ファイル300行以下
- named export が基本（例外: page.tsx, layout.tsx, loading.tsx, error.tsx はdefault export）
- `actions.ts`はDB更新前に必ず`schemas.ts`（Zod）でバリデーションする
- AIレスポンス（JSON）も保存前にスキーマ検証する
- ディレクトリ名: kebab-case、コンポーネント: PascalCase

## Database

5テーブル: profile, meals, exercises, weights, steps。UUID PKはDB側で`gen_random_uuid()`生成。タイムスタンプはUTC保存、日付集計はJST（Asia/Tokyo）基準。

詳細: @docs/design-db.md

## Environment Variables

```
DATABASE_URL=          # Neon PostgreSQL（pooled、アプリ用）
DATABASE_URL_DIRECT=   # Neon PostgreSQL（direct、マイグレーション用）
GEMINI_API_KEY=        # Google Gemini API key
```

## Gemini API

- SDK: `@google/genai`（Structured Output対応）
- カロリー推定: temperature 0.1 / 励ましメッセージ: temperature 0.8
- タイムアウト10秒、429/5xxのみ1回リトライ
- レスポンスはZodスキーマでダブルバリデーション

詳細: @docs/design-gemini.md

## Workflow

- Issue → feature branch → 実装 → lint/build → PR作成 → セルフマージ
- コミット: `<type>: <日本語サマリー>`（25文字以内）
- ブランチ: `{prefix}/#{issue}_{feature}`
- DB変更時: `drizzle-kit generate` → SQL をコミット → `drizzle-kit migrate`

詳細: @docs/design-workflow.md

## Testing

- Vitest。MVPでは`lib/calc.ts`のみテスト（`lib/calc.test.ts`にコロケーション）
- テスト対象: BMR計算、METs消費、歩数消費、収支判定（境界値 ±200kcal）

詳細: @docs/design-test.md

## Gotchas

- 認証なし（シングルユーザー）。profileテーブルは常に1レコード
- Neonはpooled接続（アプリ）とdirect接続（マイグレーション）でURLが異なる
- ダッシュボードのSummary / Trends / Motivationは`Suspense`で分割ストリーミング
- `db/`と`features/*/queries.ts`以外からDrizzle APIを直接呼ばない
- weightsとstepsの`date`カラムはUNIQUE（1日1レコード制約）

## Design Docs

設計の詳細は以下を参照:

- @docs/spec.md — MVP仕様書
- @docs/design-directory.md — ディレクトリ構成
- @docs/design-db.md — データベース設計
- @docs/design-ui.md — UI/スタイリング
- @docs/design-gemini.md — Gemini API統合
- @docs/design-state.md — 状態管理・データフェッチ
- @docs/design-deploy.md — デプロイ・環境設定
- @docs/design-test.md — テスト戦略
- @docs/design-workflow.md — 開発フロー
- @docs/design-ai-workflow.md — AI駆動開発ワークフロー
