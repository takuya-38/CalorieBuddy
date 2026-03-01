# 開発フロー

## 基本フロー

```
1. GitHub Issue を立てる
2. feature ブランチを切る
3. 実装（Claude Code）
4. チェック & マージ
5. 自動デプロイ（Vercel）
```

## 手順

```bash
# 1. Issue 確認
gh issue view 3

# 2. ブランチ作成
git checkout main
git pull
git checkout -b feature/meal-input

# 3. 実装
# Claude Code で開発

# 4. マージ前チェック
npm run lint && npm run build

# 5. main にマージ（fast-forward で履歴をきれいに保つ）
git checkout main
git pull
git merge --ff-only feature/meal-input
git push  # → Vercel 自動デプロイ
```

## DB 変更がある場合

マージ前にマイグレーションを実行する。生成された SQL はコミット対象に含める。

```bash
npx drizzle-kit generate    # src/db/migrations/ に SQL 生成
git add src/db/migrations/  # SQL をコミット
npx drizzle-kit migrate     # Neon に適用
git push
```

## ルール

- **PR は作らない**（自分専用なので不要）
- **Issue は作る**（Claude Code への指示 & 作業記録として使う）
- **feature ブランチは切る**（main を壊さないため）
- **マージ前に最低 `npm run lint && npm run build`** を通す
- **`git merge --ff-only`** を基本にする（履歴をきれいに保つ）
- **マイグレーション SQL はコミット対象**（変更履歴を残す）
