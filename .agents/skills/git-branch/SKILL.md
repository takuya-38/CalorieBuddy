---
name: git-branch
description: 命名規則に従ったGitブランチの作成。Issue番号と機能名からブランチを作成したいとき、新しいブランチを切りたいとき、ブランチ名の命名に迷ったときに使用する。「ブランチを作って」「ブランチを切って」「/git-branch」などの依頼があった場合に使用する。
---

# Git Branch

ユーザーの日本語入力を分析し、命名規則に従ったブランチを作成する。

## ワークフロー

1. ユーザーの入力からIssue番号（任意）・機能名・プレフィックスを特定
   - プレフィックスは入力内容から推測し、不明な場合のみ確認
   - 不足情報がある場合 → **AskUserQuestion** で確認
2. 切り元ブランチは常に **`main`**
3. **AskUserQuestion** でブランチ名を確認（実行前に必ず承認を得る）
   - 生成したブランチ名を表示
   - 「作成する」「修正する」の選択肢を提示
4. 承認後、ブランチ作成を実行：
   ```bash
   git checkout main && git pull origin main && git checkout -b {ブランチ名}
   ```
5. 作成したブランチ名を表示

## 命名規則

**形式**: `{プレフィックス}/{機能名}`（Issue番号がある場合は `{プレフィックス}/#Issue番号_{機能名}`）

- 日本語の機能名は英語のスネークケースに変換
- **プレフィックス**: `feature` / `fix` / `hotfix` / `refactor` / `docs` / `chore`

## 入出力例

| 日本語入力 | ブランチ名 |
|---|---|
| 食事入力画面を作る | `feature/meal_input` |
| #3 ダッシュボードを実装 | `feature/#3_dashboard` |
| カロリー計算のバグ修正 | `fix/calorie_calculation` |
| #5 DB スキーマ修正 | `fix/#5_db_schema` |
| READMEの更新 | `docs/update_readme` |
