# 変更スコープ宣言

## タスク
P0-1 プロジェクトセットアップ: Next.js 16 + Tailwind CSS v4 + shadcn/ui + Drizzle ORM + Vitest の初期構成

## 変更予定
| 種別 | ファイル |
|------|---------|
| 作成 | `package.json` |
| 作成 | `pnpm-lock.yaml` |
| 作成 | `pnpm-workspace.yaml` |
| 作成 | `tsconfig.json` |
| 作成 | `next.config.ts` |
| 作成 | `next-env.d.ts` |
| 作成 | `postcss.config.mjs` |
| 作成 | `eslint.config.mjs` |
| 作成 | `components.json` |
| 作成 | `drizzle.config.ts` |
| 作成 | `vitest.config.ts` |
| 作成 | `.prettierrc` |
| 作成 | `.env.local.example` |
| 作成 | `.tool-versions` |
| 変更 | `.gitignore` |
| 作成 | `src/app/layout.tsx` |
| 作成 | `src/app/page.tsx` |
| 作成 | `src/app/globals.css` |
| 作成 | `src/app/favicon.ico` |
| 作成 | `src/lib/utils.ts` |
| 作成 | `src/lib/setup.test.ts` |
| 作成 | `src/features/dashboard/components/.gitkeep` |
| 作成 | `src/features/meals/components/.gitkeep` |
| 作成 | `src/features/exercise/components/.gitkeep` |
| 作成 | `src/features/weight/components/.gitkeep` |
| 作成 | `src/features/settings/components/.gitkeep` |
| 作成 | `src/components/layout/.gitkeep` |
| 作成 | `src/db/.gitkeep` |

## 推定規模
Medium

## 影響範囲
- プロジェクト全体の開発基盤（新規作成のため既存機能への影響なし）
- 後続Issue（P0-2 DBスキーマ、P0-3 共通レイアウト）の前提条件となるツールチェーン・ディレクトリ構成