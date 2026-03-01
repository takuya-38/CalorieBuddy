# デプロイ / 環境設定

## 環境変数

```
DATABASE_URL=            # Neon PostgreSQL 接続文字列（プーリング用、アプリ実行時）
DATABASE_URL_DIRECT=     # Neon PostgreSQL 接続文字列（ダイレクト用、マイグレーション時）
GEMINI_API_KEY=          # Google Gemini API キー
```

- `.env.local` で管理（gitignore 済み）
- Vercel には環境変数設定から登録

## Neon 接続設定

- `DATABASE_URL` - プーリング接続（アプリ実行時、`@neondatabase/serverless`）
- `DATABASE_URL_DIRECT` - ダイレクト接続（マイグレーション時、`drizzle-kit migrate`）

## デプロイ

- **Vercel** に GitHub リポジトリ連携
- `main` ブランチへの push で自動デプロイ

### マイグレーション手順

スキーマ変更時は **デプロイ前に手動実行**:

```bash
npx drizzle-kit generate   # マイグレーションファイル生成
npx drizzle-kit migrate    # Neon に適用（DATABASE_URL_DIRECT を使用）
git push                   # デプロイ
```
