# 変更スコープ宣言

## タスク
P0-1 プロジェクトセットアップ: Next.js + Tailwind CSS + shadcn/ui + Drizzle ORM + Vitest の初期構成

## 変更予定
| 種別 | ファイル |
|------|---------|
| 作成 | `package.json` (create-next-app) |
| 作成 | `tsconfig.json` (create-next-app) |
| 作成 | `next.config.ts` (create-next-app) |
| 作成 | `postcss.config.mjs` (create-next-app) |
| 作成 | `tailwind.config.ts` (create-next-app) |
| 作成 | `components.json` (shadcn/ui) |
| 作成 | `drizzle.config.ts` |
| 作成 | `vitest.config.ts` |
| 作成 | `.prettierrc` |
| 作成 | `.env.local.example` |
| 作成 | `src/app/layout.tsx` (create-next-app) |
| 変更 | `src/app/page.tsx` (デフォルト→簡素化) |
| 変更 | `src/app/globals.css` (デフォルト→Tailwindベースのみ) |
| 作成 | `src/lib/utils.ts` (shadcn/ui) |
| 作成 | `src/features/{dashboard,meals,exercise,weight,settings}/components/.gitkeep` |
| 作成 | `src/components/layout/.gitkeep` |
| 作成 | `src/db/.gitkeep` |
| 変更 | `README.md` (create-next-app上書き後に復元) |
| 変更 | `.gitignore` (create-next-appが更新) |

## 推定規模
Medium

## 影響範囲
- プロジェクト全体の開発基盤（新規作成のため既存機能への影響なし）
