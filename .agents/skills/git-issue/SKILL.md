---
name: git-issue
description: "GitHub Issue の作成。プロジェクトの docs/ 配下の設計ドキュメント（spec.md, issues.md 等）を参照し、Issue テンプレートに沿った Issue を作成する。トリガー: ユーザーが /git-issue, Issue作って, Issueを立てて と言った時。"
---

# git-issue

プロジェクトの設計ドキュメントを参照し、GitHub Issue を作成する。

## データソース

- **`docs/issues.md`** — 全 Issue の詳細定義（ゴール・受け入れ基準・技術メモ・スコープ外）。**最優先で参照する**
- `docs/design-ai-workflow.md` — Phase構成・依存関係図・並列実行ガイド
- `docs/spec.md` — 機能仕様・データモデル・API設計
- `docs/design-*.md` — 各設計方針の詳細

## ワークフロー

### 単体作成（1 Issue）

1. ユーザーの入力から作成したい Issue を特定
   - Phase・ID 指定がある場合（例: `P0-1`） → **`docs/issues.md`** の該当セクションを読む
   - 自由記述の場合 → ユーザーの説明をもとに `docs/issues.md` やその他設計ドキュメントから構成
   - 不明な場合 → **AskUserQuestion** で確認
2. `docs/issues.md` から該当 Issue の全文（ゴール・参照ドキュメント・受け入れ基準・技術メモ・スコープ外）を取得
3. 依存関係がある場合、既存の GitHub Issue 番号を `gh issue list` で確認し、`blocked by #N` を本文末尾に追加
4. **MUST: AskUserQuestion** で Issue のタイトルと本文をプレビュー表示して確認
   - 「作成する」「修正する」の選択肢を提示
   - 承認されるまで `gh issue create` を実行しない
5. 承認後、Issue を作成:
   ```bash
   gh issue create --title "<タイトル>" --body "$(cat <<'EOF'
   <本文>
   EOF
   )"
   ```
6. 作成された Issue 番号と URL を報告

### バッチ作成（Phase 単位）

ユーザーが「Phase 0 の Issue を全部作って」「Phase 1 をまとめて」等と指示した場合:

1. `docs/issues.md` から該当 Phase の全 Issue を読み取る
2. 依存関係の順序に従い、依存が少ない Issue から順に作成する
3. 各 Issue について **1件ずつ AskUserQuestion で確認**してから作成する
4. 前の Issue で払い出された GitHub Issue 番号を、後続 Issue の `blocked by #N` に反映する
5. 全件完了後、作成した Issue 一覧（番号・タイトル・URL）をまとめて報告

## Issue テンプレート

```markdown
## ゴール

何を実現するか（1-2文）

## 依存

blocked by #N（依存 Issue がある場合のみ）

## 参照ドキュメント

- `docs/spec.md` セクション X.X
- `docs/design-*.md` の該当箇所

## 受け入れ基準

- [ ] 具体的に満たすべき条件
- [ ] `pnpm lint && pnpm build` が通る

## 技術メモ

実装時に参照すべきパターンや制約

## スコープ外

明示的にやらないこと
```

## ルール

- **`docs/issues.md` をまず読む**: ID 指定時は issues.md の内容をそのまま使い、不足があれば他の設計ドキュメントで補完
- **受け入れ基準は検証可能に**: 「〜ができる」ではなく「〜を入力して保存するとDBに反映される」
- **参照ドキュメントはセクションまで指定**: `docs/spec.md` セクション7.3 のように
- **スコープ外を必ず書く**: 別 Issue で対応する機能や、今回やらないことを明記
- **依存関係は実 Issue 番号で記載**: `blocked by #N` の形式。`gh issue list` で既存 Issue を確認してから番号を埋める
- **ラベルは付けない**: 自分専用プロジェクトのためラベル管理は不要
- **品質ゲートは `pnpm`**: `pnpm lint && pnpm build`（npm ではなく pnpm）

## 入出力例

| ユーザー入力 | 動作 |
|---|---|
| `P0-1` | `docs/issues.md` の P0-1 セクションを読み、Issue 作成 |
| `Phase 0 全部作って` | P0-1, P0-2, P0-3 を依存順に1件ずつ確認→作成 |
| `食事入力画面のIssue` | issues.md から P2-1 を特定し、Issue 作成 |
| `P1-2 カロリー計算` | issues.md の P1-2 セクションを読み、Issue 作成 |
| `体重記録の画面を作るIssue` | issues.md から P1-3 を特定し、Issue 作成 |
