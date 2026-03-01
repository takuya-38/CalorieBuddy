# 決定ログ

## 1. create-next-app を一時ディレクトリで実行
- **背景**: ワークツリーのディレクトリ名に大文字が含まれており、npm の命名制約でパッケージ名として使用できなかった
- **検討した選択肢**: (A) 一時ディレクトリで生成してコピー、(B) package.json を手動作成
- **理由**: (A) を採用。create-next-app が生成するボイラープレートを正確に取得しつつ、ファイルコピーで確実に目的ディレクトリに配置できる

## 2. .tool-versions ファイルの追加
- **背景**: asdf 管理下で pnpm/nodejs のバージョンが未指定のためコマンド実行がエラーになった
- **検討した選択肢**: (A) .tool-versions を追加、(B) 環境変数で一時的に設定
- **理由**: (A) を採用。プロジェクトの再現性のため、Node.js 20.14.0 (LTS) と pnpm 10.10.0 を明示的に固定

## 3. Next.js 16 + Tailwind CSS v4 の採用
- **背景**: create-next-app の最新版が Next.js 16.1.6 + Tailwind CSS v4 を生成した。計画時は Next.js 14/15 + Tailwind v3 を想定していた
- **検討した選択肢**: (A) 最新版をそのまま使用、(B) バージョンをピン留めして旧版を使用
- **理由**: (A) を採用。Tailwind v4 は `@import "tailwindcss"` 構文で `tailwind.config.ts` が不要。shadcn/ui も v4 対応済み（初期化で自動検出された）。設計ドキュメントの本質的な要件（App Router, TypeScript, Tailwind, shadcn/ui）は全て満たせる

## 4. ESLint flat config 形式
- **背景**: Next.js 16 の create-next-app が ESLint v9 の flat config (`eslint.config.mjs`) を生成した。計画時は `.eslintrc.json` 形式を想定していた
- **検討した選択肢**: (A) flat config をそのまま使用、(B) 旧形式に変換
- **理由**: (A) を採用。ESLint v9 のデフォルトであり、`eslint-config-next` も flat config に対応済み

## 5. pnpm.onlyBuiltDependencies の設定
- **背景**: pnpm v10 はデフォルトでパッケージのビルドスクリプトを無視する。esbuild のビルドスクリプトが実行されず vitest/drizzle-kit が動作しない
- **検討した選択肢**: (A) package.json に `pnpm.onlyBuiltDependencies` を追加、(B) `pnpm rebuild` で都度対応
- **理由**: (A) を追加し、初回インストール後は (B) の `pnpm rebuild esbuild` も実行して確実にビルド。CI/CD でも再現可能にする

## 6. セットアップ検証テストの追加
- **背景**: P0-1 のスコープではテスト対象（`lib/calc.ts`）がまだ存在しない。しかし指示書で「新規作成した関数にはテストを追加」とあり、Vitest のセットアップ検証が必要
- **検討した選択肢**: (A) パスエイリアス解決と cn ユーティリティの動作確認テスト、(B) テストなし
- **理由**: (A) を採用。`src/lib/setup.test.ts` として、`@/` パスエイリアスの解決と shadcn/ui の `cn` 関数の動作を検証。Vitest + パスエイリアス設定の正常動作を保証する
