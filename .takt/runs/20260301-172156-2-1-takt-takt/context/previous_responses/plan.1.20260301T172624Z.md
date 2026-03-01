分析は完了しました。以下が計画です。

---

## 計画レポート: P0-1 プロジェクトセットアップ

### タスク概要

`docs/issues.md` の P0-1 に基づき、CalorieBuddy の開発基盤を構築する。Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Drizzle ORM + Vitest の初期構成を完了させる。

### 現状分析

**リポジトリ状態:**
- ブランチ: `takt/20260301T1721-ha-no-de-ni-shiteimasu-ha2tsua`
- 既存ファイル: `.agents/`, `.claude/`, `.takt/`, `docs/`（設計ドキュメント12件）, `README.md`, `skills-lock.json`, `CLAUDE.md`（シンボリックリンク）
- Next.js プロジェクト: **未作成**（`package.json`、`src/` なし）

**対象Issue の受け入れ基準（10項目）:**  
すべて「変更要」— 現在コードが存在しないため、全項目が新規作成対象。

### 実装アプローチ

#### Step 1: Next.js プロジェクト作成

既存ディレクトリ（非空）でのcreate-next-app実行。

```bash
pnpm create next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --skip-install
```

**注意点:**
- ディレクトリが非空のため、対話プロンプトで上書き確認が出る可能性あり。`--yes` フラグまたは手動応答で対応
- `README.md` が上書きされる可能性あり → create-next-app 完了後に `# CalorieBuddy` の1行に戻す
- `.git` が既に存在するため、git init はスキップされる
- `--skip-install` で生成だけ行い、Step 3 でまとめてインストール

**生成されるファイル:**
- `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `.gitignore`（既存にマージ）, `next-env.d.ts`

#### Step 2: shadcn/ui 初期化

```bash
pnpm install  # まず依存をインストール
pnpm dlx shadcn@latest init
```

**設定:**
- Style: **New York**（P0-1技術メモに明記）
- Base color: Neutral（shadcn/ui デフォルト）
- CSS variables: yes

**生成されるファイル:**
- `components.json`
- `src/lib/utils.ts`（shadcn/uiのcn関数）
- `src/components/ui/` は初期化時点では空（コンポーネント追加は後続Issueで）

#### Step 3: 追加パッケージインストール

**本番依存:**
```bash
pnpm add drizzle-orm @neondatabase/serverless
```

**開発依存:**
```bash
pnpm add -D drizzle-kit vitest prettier prettier-plugin-tailwindcss
```

**インストールしないもの（P0-1スコープ外、技術メモに明記）:**
- `recharts` → P1-3で追加
- `@google/genai` → P2-2で追加
- `zod` → shadcn/uiが依存として持つか確認。なければP1-1で追加

#### Step 4: 設定ファイル作成

**4-1. `drizzle.config.ts`**（`docs/design-db.md` のマイグレーション管理セクションに準拠）

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

**4-2. `vitest.config.ts`**

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

**4-3. `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**4-4. `.env.local.example`**（`docs/design-deploy.md` 準拠、3変数）

```
DATABASE_URL=
DATABASE_URL_DIRECT=
GEMINI_API_KEY=
```

#### Step 5: ディレクトリ構成作成

`docs/design-directory.md` に従い、以下のディレクトリを作成。空ディレクトリには `.gitkeep` を配置。

```
src/
├── app/                          # create-next-appが生成済み
├── features/
│   ├── dashboard/components/     # .gitkeep
│   ├── meals/components/         # .gitkeep
│   ├── exercise/components/      # .gitkeep
│   ├── weight/components/        # .gitkeep
│   └── settings/components/      # .gitkeep
├── components/
│   ├── ui/                       # shadcn/uiが管理（生成済みの可能性あり）
│   └── layout/                   # .gitkeep
├── db/                           # .gitkeep
└── lib/                          # shadcn/uiのutils.tsが配置済み（追加の.gitkeep不要）
```

#### Step 6: package.json スクリプト追加

create-next-app が生成する `dev`, `build`, `start`, `lint` に加え、CLAUDE.md に記載の以下を追加:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest"
  }
}
```

#### Step 7: 不要なデフォルトコード整理

create-next-app が生成する `src/app/page.tsx` のデフォルトコンテンツ（Vercelロゴ等）を簡素化:

```tsx
export default function Home() {
  return (
    <main>
      <h1>CalorieBuddy</h1>
    </main>
  )
}
```

`src/app/globals.css` も Tailwind のベースディレクティブのみ残す（shadcn/ui の変数定義は維持）。

#### Step 8: 検証

```bash
pnpm lint && pnpm build
```

### ファイル構成まとめ

| ファイル | 操作 | 備考 |
|---------|------|------|
| `package.json` | 新規（create-next-app）→ 編集 | scripts追加、依存追加 |
| `tsconfig.json` | 新規（create-next-app） | |
| `next.config.ts` | 新規（create-next-app） | |
| `postcss.config.mjs` | 新規（create-next-app） | |
| `tailwind.config.ts` | 新規（create-next-app） | |
| `components.json` | 新規（shadcn/ui） | |
| `drizzle.config.ts` | 新規 | |
| `vitest.config.ts` | 新規 | |
| `.prettierrc` | 新規 | |
| `.env.local.example` | 新規 | |
| `.gitignore` | 更新（create-next-app） | |
| `README.md` | 復元 | create-next-appによる上書き後 |
| `src/app/layout.tsx` | 新規（create-next-app） | |
| `src/app/page.tsx` | 新規（create-next-app）→ 編集 | デフォルト簡素化 |
| `src/app/globals.css` | 新規（create-next-app）→ 編集 | |
| `src/lib/utils.ts` | 新規（shadcn/ui） | cn関数 |
| `src/features/**/.gitkeep` | 新規 | 5機能 × components |
| `src/components/layout/.gitkeep` | 新規 | |
| `src/db/.gitkeep` | 新規 | |

### 制約確認

| ポリシー | 準拠状況 |
|---------|---------|
| パッケージマネージャー: pnpm | ✅ |
| shadcn/ui スタイル: New York | ✅ |
| src/ ディレクトリ使用 | ✅ |
| App Router | ✅ |
| drizzle.config.ts の out: `./src/db/migrations` | ✅ |
| Recharts 未インストール（P1-3で追加） | ✅ |
| @google/genai 未インストール（P2-2で追加） | ✅ |

### スコープ外（明示的に含めないもの）

- DB スキーマ定義・マイグレーション → P0-2
- 共通レイアウト・ナビゲーション UI → P0-3
- 各ページの機能実装 → Phase 1以降

### リスクと対応

| リスク | 対応 |
|-------|------|
| create-next-appが非空ディレクトリで失敗 | `--yes` フラグ利用。それでも失敗する場合はtmpディレクトリで生成後にファイルコピー |
| shadcn/ui init のCLIオプションが変更 | 対話形式で実行し手動で選択 |
| Prettier と ESLint の競合 | Next.js デフォルト ESLint はフォーマットルールを含まないため競合しない |