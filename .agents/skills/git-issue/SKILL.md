---
name: git-issue
description: "GitHub Issue の作成。プロジェクトの docs/ 配下の設計ドキュメント（spec.md, design-ai-workflow.md 等）を参照し、Issue テンプレートに沿った Issue を作成する。トリガー: ユーザーが /git-issue, Issue作って, Issueを立てて と言った時。"
---

# git-issue

プロジェクトの設計ドキュメントを参照し、GitHub Issue を作成する。

## ワークフロー

1. ユーザーの入力から作成したい Issue の内容を特定
   - Phase・ID 指定がある場合 → `docs/design-ai-workflow.md` の Issue一覧から該当を参照
   - 自由記述の場合 → ユーザーの説明をもとに構成
   - 不明な場合 → **AskUserQuestion** で確認
2. 関連する設計ドキュメントを読み、Issue 本文に必要な情報を収集
   - `docs/spec.md` — 機能仕様・データモデル・API設計
   - `docs/design-ai-workflow.md` — Issue一覧・依存関係
   - `docs/design-*.md` — 各設計方針
3. テンプレートに沿って Issue 本文を生成
4. **MUST: AskUserQuestion** で Issue のタイトルと本文を確認
   - 「作成する」「修正する」の選択肢を提示
   - 承認されるまで `gh issue create` を実行しない
5. 承認後、Issue を作成:
   ```bash
   gh issue create --title "<タイトル>" --body "<本文>"
   ```
6. 作成された Issue 番号と URL を報告

## Issue テンプレート

```markdown
## ゴール

何を実現するか（1-2文）

## 参照ドキュメント

- `docs/spec.md` セクション X.X
- `docs/design-*.md` の該当箇所

## 受け入れ基準

- [ ] 具体的に満たすべき条件
- [ ] `npm run lint && npm run build` が通る

## 技術メモ

実装時に参照すべきパターンや制約

## スコープ外

明示的にやらないこと
```

## ルール

- **受け入れ基準は検証可能に**: 「〜ができる」ではなく「〜を入力して保存するとDBに反映される」
- **参照ドキュメントはセクションまで指定**: `docs/spec.md#7.3` のように
- **スコープ外を必ず書く**: 別Issueで対応する機能や、今回やらないことを明記
- **ラベルは付けない**: 自分専用プロジェクトのためラベル管理は不要

## 入出力例

| ユーザー入力 | Issue タイトル |
|---|---|
| P0-1のIssueを作って | プロジェクトセットアップ（Next.js + Tailwind + shadcn/ui + Drizzle） |
| 食事入力画面のIssue | 食事手動入力（/meals 手動モード） |
| P1-2 カロリー計算 | カロリー計算ロジック + テスト（lib/calc.ts） |
| 体重記録の画面を作るIssueを立てて | 体重記録画面（/weight） |
