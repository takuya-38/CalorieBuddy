---
name: git-push
description: "feature ブランチから main へのマージ & プッシュを実行するワークフロー。トリガー: ユーザーが /git-push, mainにマージして, デプロイして, pushして と言った時。lint・build チェック → main リベース → ff-only マージ → push を一連で行う。DB マイグレーションがある場合は push 前に検知して実行する。"
---

# git-push

feature ブランチの変更を main にマージして push する。

## 前提条件チェック

1. 現在のブランチが main でないことを確認（main なら中止）
2. 未コミットの変更がないことを確認（あればユーザーに確認）

## 手順

### 1. lint & build

```bash
npm run lint && npm run build
```

失敗したら中止。エラー内容を報告。

### 2. DB マイグレーション確認

`src/db/schema.ts` に main との差分があるか確認:

```bash
git diff main -- src/db/schema.ts
```

変更がある場合、ユーザーに「スキーマ変更あり。マイグレーション実行しますか？」と確認。承認されたら:

```bash
npx drizzle-kit generate
git add src/db/migrations/
git commit -m "db: add migration"
npx drizzle-kit migrate
```

### 3. main にマージ

```bash
git checkout main
git pull origin main
git merge --ff-only <feature-branch>
```

`--ff-only` 失敗時（main が先に進んでいる場合）:

```bash
git checkout <feature-branch>
git rebase main
# コンフリクトがあればユーザーに報告して中止
git checkout main
git merge --ff-only <feature-branch>
```

### 4. push

```bash
git push origin main
```

### 5. 完了報告

以下を報告:

- マージしたブランチ名
- push したコミット数
- DB マイグレーションの有無
- Vercel で自動デプロイされる旨
