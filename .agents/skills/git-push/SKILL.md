---
name: git-push
description: "feature ブランチから PR を作成するワークフロー。トリガー: ユーザーが /git-push, PRを作って, デプロイして, pushして と言った時。lint・build チェック → push → PR作成 を一連で行う。DB マイグレーションがある場合は push 前に検知して実行する。"
---

# git-push

feature ブランチの変更をリモートに push し、main への PR を作成する。

## 前提条件チェック

1. 現在のブランチが main でないことを確認（main なら中止）
2. 未コミットの変更がないことを確認（あればユーザーに確認）

## 手順

### 1. lint & build

```bash
pnpm lint && pnpm build
```

失敗したら中止。エラー内容を報告。

### 2. DB マイグレーション確認

`src/db/schema.ts` に main との差分があるか確認:

```bash
git diff main -- src/db/schema.ts
```

変更がある場合、ユーザーに「スキーマ変更あり。マイグレーション実行しますか？」と確認。承認されたら:

```bash
pnpm drizzle-kit generate
git add src/db/migrations/
git commit -m "db: add migration"
pnpm drizzle-kit migrate
```

### 3. push

```bash
git push -u origin <current-branch>
```

### 4. PR 作成

対応する Issue 番号をブランチ名から推測する（例: `feat/#2_db-schema` → `#2`）。

```bash
gh pr create --title "<type>: <日本語サマリー>" --body "$(cat <<'EOF'
## Summary
- <変更内容を箇条書き>

## 対応Issue
Closes #<issue-number>

## 確認済み
- `pnpm lint` / `pnpm type-check` / `pnpm build` / `pnpm test run` すべて通過

## Test plan
- [ ] <テスト手順>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --base main
```

### 5. 完了報告

以下を報告:

- 作成した PR の URL
- 変更したコミット数
- DB マイグレーションの有無
- マージ後 Vercel で自動デプロイされる旨
