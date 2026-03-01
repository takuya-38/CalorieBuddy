# 決定ログ

## 1. create-next-app を一時ディレクトリで実行
- **背景**: ワークツリーのディレクトリ名に大文字が含まれており、npm の命名制約（小文字のみ）でパッケージ名として使用できずエラーになった
- **検討した選択肢**: (A) 一時ディレクトリで生成してファイルをコピー、(B) package.json を手動作成
- **理由**: (A) を採用。create-next-app が生成するボイラープレート（tsconfig.json, eslint.config.mjs, postcss.config.mjs 等）を正確に取得しつつ、ファイルコピーで確実に目的ディレクトリに配置できる

## 2. .tool-versions ファイルの追加
- **背景**: asdf 管理下で pnpm/nodejs のバージョンがプロジェクトに未指定のため、コマンド実行時に「No version is set for command pnpm」エラーが発生した
- **検討した選択肢**: (A) .tool-versions をプロジェクトに追加、(B) 環境変数やシェル設定で一時的に対応
- **理由**: (A) を採用。プロジェクトの再現性のため、Node.js 20.14.0（LTS）と pnpm 10.10.0 を明示的に固定。他の開発環境やCIでも同じバージョンが使われることを保証する

## 3. Next.js 16 + Tailwind CSS v4 の採用
- **背景**: create-next-app の最新版が Next.js 16.1.6 + Tailwind CSS v4 を生成した。計画時の設計ドキュメントでは特定バージョンの指定はなく、Tailwind v3 の `@tailwind base/components/utilities` 構文を想定していた可能性がある
- **検討した選択肢**: (A) 最新版をそのまま使用、(B) バージョンをピン留めして旧版を使用
- **理由**: (A) を採用。Tailwind v4 は `@import "tailwindcss"` 構文で `tailwind.config.ts` が不要になる。shadcn/ui も v4 対応済み（初期化時に `Found v4` と自動検出）。設計ドキュメントの本質的な要件（App Router, TypeScript, Tailwind, shadcn/ui）は全て満たせる

## 4. ESLint flat config 形式の採用
- **背景**: Next.js 16 の create-next-app が ESLint v9 の flat config（`eslint.config.mjs`）を生成した。従来の `.eslintrc.json` 形式ではない
- **検討した選択肢**: (A) flat config をそのまま使用、(B) 旧形式に変換
- **理由**: (A) を採用。ESLint v9 のデフォルトであり、`eslint-config-next` も flat config に対応済み。lint スクリプトも `next lint` ではなく `eslint` コマンド直接実行に変更されている

## 5. pnpm.onlyBuiltDependencies の設定と esbuild rebuild
- **背景**: pnpm v10 はデフォルトでパッケージのビルドスクリプト（postinstall等）を無視する。esbuild のビルドスクリプトが実行されないと、vitest や drizzle-kit が esbuild バイナリを見つけられず動作しない
- **検討した選択肢**: (A) package.json に `pnpm.onlyBuiltDependencies` を追加 + `pnpm rebuild esbuild`、(B) `pnpm rebuild` を都度手動実行
- **理由**: (A) を採用。package.json に `pnpm.onlyBuiltDependencies: ["esbuild"]` を追加し、初回は `pnpm rebuild esbuild` も実行して確実にバイナリを配置。CI/CD でも設定が永続化される

## 6. セットアップ検証テストの追加
- **背景**: P0-1 のスコープでは本来のテスト対象（`lib/calc.ts`）がまだ存在しない。しかし実装指示で「新規作成した関数にはテストを追加」とあり、Vitest のセットアップが正しく動作することの検証が必要
- **検討した選択肢**: (A) パスエイリアス解決と cn ユーティリティの動作確認テストを作成、(B) テストファイルなし
- **理由**: (A) を採用。`src/lib/setup.test.ts` として、`@/` パスエイリアスの解決と shadcn/ui の `cn` 関数の動作を検証する2テストを作成。Vitest + パスエイリアス設定の正常動作を保証し、後続Issue（P1-2）でのテスト追加がスムーズになる