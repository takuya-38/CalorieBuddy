# タスク完了サマリー

## タスク
CalorieBuddy（AI駆動カロリー収支管理アプリ）のP0-1プロジェクトセットアップ。Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Drizzle ORM + Vitest の初期構成を完了し、後続Issueの開発基盤を構築する。

## 結果
完了

## 変更内容
| 種別 | ファイル | 概要 |
|------|---------|------|
| 作成 | `package.json` | Next.js 16.1.6 + React 19 + 全依存パッケージ + スクリプト定義 |
| 作成 | `tsconfig.json` | TypeScript strict設定、`@/*` パスエイリアス |
| 作成 | `next.config.ts` | Next.js設定 |
| 作成 | `postcss.config.mjs` | Tailwind CSS v4 PostCSS設定 |
| 作成 | `eslint.config.mjs` | ESLint flat config (core-web-vitals + TypeScript) |
| 作成 | `components.json` | shadcn/ui設定（New York スタイル） |
| 作成 | `drizzle.config.ts` | Drizzle ORM設定（PostgreSQL, DATABASE_URL_DIRECT） |
| 作成 | `vitest.config.ts` | Vitest設定（globals, パスエイリアス） |
| 作成 | `.prettierrc` | Prettier設定（semi:false, singleQuote, tailwindプラグイン） |
| 作成 | `.env.local.example` | 環境変数テンプレート（3変数） |
| 作成 | `.tool-versions` | Node.js 20.14.0 + pnpm 10.10.0 |
| 作成 | `pnpm-workspace.yaml` | pnpmワークスペース設定 |
| 作成 | `next-env.d.ts` | Next.js 型定義参照 |
| 作成 | `src/app/layout.tsx` | ルートレイアウト（CalorieBuddy, lang=ja） |
| 作成 | `src/app/page.tsx` | トップページ（`<h1>CalorieBuddy</h1>`） |
| 作成 | `src/app/globals.css` | Tailwind v4 + shadcn/ui CSS変数 |
| 作成 | `src/app/favicon.ico` | ファビコン |
| 作成 | `src/lib/utils.ts` | shadcn/ui cn()ユーティリティ |
| 作成 | `src/lib/setup.test.ts` | セットアップ検証テスト（パスエイリアス + cn動作確認） |
| 作成 | `src/features/*/components/.gitkeep` | 5機能ディレクトリ（dashboard, meals, exercise, weight, settings） |
| 作成 | `src/components/layout/.gitkeep` | 共有レイアウトコンポーネント用 |
| 作成 | `src/db/.gitkeep` | DB層用 |

## 確認コマンド
```bash
pnpm test run
pnpm lint
pnpm type-check
pnpm build
```