# タスク計画

## 元の要求

CalorieBuddy（AI駆動カロリー収支管理アプリ）の初期プロジェクトセットアップ。`docs/issues.md` の P0-1 に基づき、`create-next-app` から開発基盤を構築する。

## 分析結果

### 目的

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Drizzle ORM + Vitest の初期構成を完了し、後続Issue（P0-2以降）の開発土台を整える。

### 参照資料の調査結果

P0-1 が参照する4ドキュメントを調査済み:

- **`docs/spec.md` §2（技術スタック）**: Next.js App Router / React 19 / Tailwind + shadcn/ui / Drizzle ORM / Neon PostgreSQL / Vitest。パッケージマネージャーは CLAUDE.md より `pnpm`
- **`docs/design-directory.md`**: Feature-based colocation。`src/` 配下に `app/`, `features/`, `components/`, `db/`, `lib/` の5層。features は dashboard/meals/exercise/weight/settings の5機能
- **`docs/design-deploy.md`**: 環境変数3つ（`DATABASE_URL`, `DATABASE_URL_DIRECT`, `GEMINI_API_KEY`）。`.env.local` で管理
- **`docs/design-test.md`**: Vitest 採用。MVP では `lib/calc.ts` のみテスト対象

**現在の実装との差異**: ソースコードが一切存在しない状態のため、全項目が新規作成。

### スコープ

**受け入れ基準（10項目）の対応状況:**

| # | 基準 | 判定 | 根拠 |
|---|------|------|------|
| 1 | create-next-app で Next.js (App Router) 作成 | 変更要 | package.json なし |
| 2 | TypeScript + Tailwind CSS 設定済み | 変更要 | 設定ファイルなし |
| 3 | shadcn/ui 初期化 | 変更要 | components.json なし |
| 4 | Drizzle ORM + @neondatabase/serverless インストール | 変更要 | node_modules なし |
| 5 | drizzle.config.ts 作成 | 変更要 | ファイルなし |
| 6 | Vitest インストール・設定 | 変更要 | vitest.config.ts なし |
| 7 | .env.local.example 作成 | 変更要 | ファイルなし |
| 8 | ESLint 設定 | 変更要 | create-next-app で同時セットアップ |
| 9 | src/ ディレクトリ構成 | 変更要 | src/ なし |
| 10 | pnpm lint && pnpm build 通過 | 変更要 | 検証対象なし |

### 検討したアプローチ

| アプローチ | 採否 | 理由 |
|-----------|------|------|
| 既存ディレクトリで直接 `create-next-app .` 実行 | ✅ 採用 | 既存ファイル（docs/, .agents/ 等）と競合しない。README.md のみ上書き対応が必要 |
| tmpディレクトリで生成してコピー | ❌ 不採用 | 手順が複雑化し、.gitignore 等のマージ処理が増える |
| Prettier を含める | ✅ 採用 | CLAUDE.md に `pnpm format` コマンドが定義されており、Prettier が前提。受け入れ基準には明記されていないが、開発基盤として必要 |
| Recharts / @google/genai をこの段階でインストール | ❌ 不採用 | P0-1 技術メモに「この段階ではインストール不要」と明記 |

### 実装アプローチ

**8ステップで実行する:**

**Step 1: Next.js プロジェクト作成**
```bash
pnpm create next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```
- 既存ディレクトリが非空のため、対話プロンプトに応答が必要な場合あり
- README.md が上書きされた場合、`# CalorieBuddy` の1行に復元する

**Step 2: shadcn/ui 初期化**
```bash
pnpm dlx shadcn@latest init
```
- Style: **New York**（P0-1技術メモに明記）
- Base color: Neutral
- CSS variables: yes
- 生成物: `components.json`, `src/lib/utils.ts`

**Step 3: 追加パッケージインストール**
```bash
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit vitest prettier prettier-plugin-tailwindcss
```

**Step 4: 設定ファイル作成（4ファイル）**

4-1. **`drizzle.config.ts`** — `docs/design-db.md` のマイグレーション管理セクション準拠:
```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT!,
  },
})
```

4-2. **`vitest.config.ts`**:
```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

4-3. **`.prettierrc`**:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

4-4. **`.env.local.example`** — `docs/design-deploy.md` 準拠:
```
DATABASE_URL=
DATABASE_URL_DIRECT=
GEMINI_API_KEY=
```

**Step 5: ディレクトリ構成作成**

`docs/design-directory.md` に従い、空ディレクトリに `.gitkeep` を配置:

```
src/
├── features/
│   ├── dashboard/components/.gitkeep
│   ├── meals/components/.gitkeep
│   ├── exercise/components/.gitkeep
│   ├── weight/components/.gitkeep
│   └── settings/components/.gitkeep
├── components/
│   └── layout/.gitkeep
└── db/.gitkeep
```

※ `src/lib/` は shadcn/ui が `utils.ts` を配置するため `.gitkeep` 不要
※ `src/components/ui/` は shadcn/ui が管理するため明示的な作成不要

**Step 6: package.json スクリプト追加**

create-next-app の `dev`, `build`, `start`, `lint` に加え:
```json
{
  "format": "prettier --write .",
  "type-check": "tsc --noEmit",
  "test": "vitest"
}
```

**Step 7: デフォルトコード整理**

- `src/app/page.tsx`: Vercel ロゴ等のデフォルトコンテンツを削除し、`<h1>CalorieBuddy</h1>` のみのシンプルな表示に置換
- `src/app/globals.css`: Tailwind ベースディレクティブと shadcn/ui CSS 変数のみ残す（デフォルトの装飾スタイルを削除）

**Step 8: 検証**
```bash
pnpm lint && pnpm build
```

## 実装ガイドライン

- **create-next-app の対話プロンプト対応**: 非空ディレクトリの警告が出た場合、続行を選択する。全オプションをCLIフラグで指定しているため、追加の対話は最小限のはず
- **shadcn/ui init の style 選択**: 必ず **New York** を選ぶこと（P0-1技術メモに明記）
- **drizzle.config.ts の `defineConfig`**: drizzle-kit v0.20+ では `defineConfig` をインポートして使用する。古い記法（プレーンオブジェクトの `export default`）は使わない
- **vitest.config.ts のパスエイリアス**: `@/` → `./src` のエイリアスは `tsconfig.json` の `paths` と一致させる。create-next-app が `"@/*": ["./src/*"]` を設定するので、vitest 側も合わせる
- **`.gitkeep` の配置**: 空ディレクトリを git で追跡するためのもの。中身のあるディレクトリ（`src/app/`, `src/lib/`）には不要
- **README.md の復元**: create-next-app が生成する README ではなく、元の `# CalorieBuddy` の1行に戻す。プロジェクト情報は CLAUDE.md (AGENTS.md) に集約されているため

## スコープ外

| 項目 | 除外理由 |
|------|---------|
| DB スキーマ定義・マイグレーション | P0-2 のスコープ（issues.md に明記） |
| 共通レイアウト・ナビゲーション UI | P0-3 のスコープ（issues.md に明記） |
| Recharts インストール | P1-3 で追加（P0-1 技術メモに明記） |
| @google/genai インストール | P2-2 で追加（P0-1 技術メモに明記） |
| CLAUDE.md の作成 | 手動で別途対応（issues.md に明記）。既に存在する |

## 確認事項

なし。P0-1 の受け入れ基準・技術メモ・参照ドキュメントで全項目が確定しており、ユーザー判断を要する不明点はない。