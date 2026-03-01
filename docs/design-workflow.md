# 開発フロー

## 基本フロー

```
1. GitHub Issue を立てる
2. feature ブランチを切る
3. 実装（Claude Code / TAKT）
4. lint & build チェック
5. PR 作成 → セルフマージ
6. 自動デプロイ（Vercel）
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
# Claude Code / TAKT で開発

# 4. チェック
pnpm lint && pnpm build

# 5. push & PR 作成
git push -u origin feature/meal-input
gh pr create --title "feat: 食事入力" --body "Closes #3" --base main

# 6. セルフマージ → Vercel 自動デプロイ
gh pr merge --merge
```

## DB 変更がある場合

PR作成前にマイグレーションを実行する。生成された SQL はコミット対象に含める。

```bash
pnpm drizzle-kit generate    # src/db/migrations/ に SQL 生成
git add src/db/migrations/  # SQL をコミット
pnpm drizzle-kit migrate     # Neon に適用
git push
```

## ルール

- **PR を作る**（変更の可視化・レビューポイントとして）
- **Issue は作る**（Claude Code への指示 & 作業記録として使う）
- **feature ブランチは切る**（main を壊さないため）
- **マージ前に最低 `pnpm lint && pnpm build`** を通す
- **マイグレーション SQL はコミット対象**（変更履歴を残す）
