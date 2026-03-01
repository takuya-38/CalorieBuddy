# AI駆動開発ワークフロー

> TAKT + GitHub Issue + Claude Code による自動化開発フロー
>
> 2026年3月2日

---

## 1. 概要

設計ドキュメントが完了した状態から、AI駆動で実装を進めるためのワークフロー定義。
[TAKT](https://github.com/nrslib/takt) を使い、**実装→レビュー→修正の自動ループ**を回す。

### 採用理由

- **ベビーシッター問題の解消**: AIにコードを書かせても、人間が品質チェック・修正指示を繰り返すのでは時間短縮にならない
- **1エージェント1責務**: 実装とレビューを分離し、Lost in the Middle / Context Rot を防止
- **構造で制御**: プロンプトではなくYAMLワークフローで品質を担保

参考: [Claude Code と Codex のオーケストレーション（Zenn）](https://zenn.dev/nrs/articles/db4120beb0e601)

---

## 2. ツールセットアップ

### 2.1 TAKT インストール

```bash
npm install -g takt
```

### 2.2 グローバル設定

`~/.takt/config.yaml`:

```yaml
provider: claude
model: opus
language: ja
```

※ `provider: claude` は Claude Code CLI を経由するため、別途APIキーは不要。Claude Code の認証がそのまま使われる。

### 2.3 プロジェクトレベル設定

`.takt/config.yaml`:

```yaml
# プロジェクト固有の設定があればここに記載
```

### 2.4 ディレクトリ構造

```
~/.takt/                   # グローバル
├── config.yaml            # プロバイダー・モデル設定
├── pieces/                # カスタムワークフロー
├── personas/              # カスタムペルソナ（Markdown）
├── facets/                # ファセットプロンプト
└── repertoire/            # 追加パッケージ

.takt/                     # プロジェクトレベル
├── config.yaml
├── tasks.yaml             # 保留タスクリスト
├── tasks/                 # 個別タスク仕様
└── runs/                  # 実行ログ・レポート
```

---

## 3. GitHub Issue 設計

### 3.1 Issue記述テンプレート

AIが「何をすれば完了か」を判断できるよう、受け入れ基準を具体的に書く。

```markdown
## ゴール

何を実現するか（1-2文）

## 参照ドキュメント

- `docs/spec.md` セクション X
- `docs/design-*.md` の該当箇所

## 受け入れ基準

- [ ] 具体的に満たすべき条件1
- [ ] 具体的に満たすべき条件2
- [ ] `npm run lint && npm run build` が通る

## 技術メモ

実装時に参照すべきパターンや制約

## スコープ外

明示的にやらないこと
```

### 3.2 Issue分割の原則

| 原則 | 説明 |
|------|------|
| **1 Issue = 1セッション完結** | AIエージェントが1回の実行で完了できる粒度 |
| **依存関係を明示** | `blocked by #N` で前提Issueを記載 |
| **レイヤー順に進める** | DB → ロジック → UI → 統合の順 |
| **受け入れ基準は具体的に** | 曖昧な「〜ができる」ではなく、検証可能な条件を書く |
| **スコープ外を明記** | AIが余計な作業に走らないよう境界を定義 |

### 3.3 Issue分割の粒度目安

- **小さすぎ**: 1関数の追加だけ → Issue管理のオーバーヘッドが大きい
- **ちょうど良い**: 1画面・1機能・1レイヤーの実装 → 300行以下のファイルが数個
- **大きすぎ**: 複数画面をまたぐ実装 → コンテキストが溢れてAIの品質が下がる

---

## 4. Issue 一覧（実装順）

> **注意**: 以下の番号（P0-1 等）はドキュメント内の管理IDであり、実際のGitHub Issue番号とは異なる。
> `takt add` 時は GitHub 上の実Issue番号を使うこと。

### Phase 0: プロジェクト初期化

| ID | タイトル | 概要 | 依存 |
|----|---------|------|------|
| P0-1 | プロジェクトセットアップ | Next.js + Tailwind CSS + shadcn/ui + Drizzle ORM の初期構成、ESLint設定 | なし |
| P0-2 | DBスキーマ & マイグレーション | Drizzle ORMスキーマ定義（5テーブル）+ Neon接続 + 初回マイグレーション | P0-1 |
| P0-3 | 共通レイアウト & ナビゲーション | App Routerルートレイアウト + モバイルファーストのボトムナビ + 各ページのスケルトン | P0-1 |

**並列化**: P0-2 と P0-3 は P0-1 完了後に並列実行可能

### Phase 1: 基盤機能

| ID | タイトル | 概要 | 依存 |
|----|---------|------|------|
| P1-1 | プロフィール設定画面 | `/settings` — 身長・生年月日・性別・目標体重の入力フォーム + Server Action | P0-2 |
| P1-2 | カロリー計算ロジック + テスト | `lib/calc.ts` — BMR・METs消費・歩数消費・収支判定 + `lib/calc.test.ts` | P0-2 |
| P1-3 | 体重記録画面 | `/weight` — 体重入力フォーム + 推移グラフ（Recharts） | P0-2, P0-3 |

**並列化**: P1-1, P1-2, P1-3 は全て並列実行可能（P0-2, P0-3 完了後）

### Phase 2: コア機能

| ID | タイトル | 概要 | 依存 |
|----|---------|------|------|
| P2-1 | 食事手動入力 | `/meals` 手動モード — 品名+kcal入力フォーム + 食事タイプ選択 + Server Action | P0-2, P0-3 |
| P2-2 | Gemini API連携 | `lib/gemini.ts` — カロリー推定 + Structured Output + Zodバリデーション + エラーハンドリング | P0-1 |
| P2-3 | 食事AIモード | `/meals` AIモード — テキスト入力 → AI推定 → 確認・修正 → 保存 | P2-1, P2-2 |
| P2-4 | 運動入力 | `/exercise` — 運動種類選択 + 時間入力 + METs自動計算 | P0-2, P0-3, P1-2 |
| P2-5 | 歩数入力 | `/exercise` 内 — 歩数入力 + 消費カロリー自動計算 | P0-2, P0-3, P1-2 |

**並列化**: P2-1 と P2-2 は並列実行可能。P2-4 と P2-5 も並列実行可能

### Phase 3: ダッシュボード & 統合

| ID | タイトル | 概要 | 依存 |
|----|---------|------|------|
| P3-1 | ダッシュボード・カロリー収支サマリー | `/` — 今日の摂取・消費・収支 + ステータス表示（3段階判定） | P1-1, P1-2, P1-3, P2-1, P2-4, P2-5 |
| P3-2 | 週間・月間推移グラフ | ダッシュボード内 — Rechartsでカロリー収支 + 体重の推移グラフ | P3-1 |
| P3-3 | AI励ましメッセージ | ダッシュボード内 — Gemini APIで今日のデータに基づくメッセージ生成 | P2-2, P3-1 |

### 依存関係図

```
P0-1 プロジェクトセットアップ
├── P0-2 DBスキーマ
│   ├── P1-1 プロフィール設定
│   ├── P1-2 カロリー計算ロジック
│   │   ├── P2-4 運動入力
│   │   └── P2-5 歩数入力
│   ├── P1-3 体重記録
│   └── P2-1 食事手動入力
│       └── P2-3 食事AIモード ← P2-2
├── P0-3 共通レイアウト
│   ├── P1-3, P2-1, P2-4, P2-5
│   └── ...
└── P2-2 Gemini API連携
    ├── P2-3 食事AIモード
    └── P3-3 AI励ましメッセージ

P3-1 ダッシュボード ← P1-1, P1-2, P1-3, P2-1, P2-4, P2-5
├── P3-2 推移グラフ
└── P3-3 AI励ましメッセージ
```

---

## 5. TAKT ワークフロー

### 5.1 推奨ピース

| ピース | 用途 |
|--------|------|
| `default-mini` | 通常のIssue（UI・API実装） |
| `default-test-first-mini` | テストを含むIssue（#5 カロリー計算ロジック） |

カスタムが必要な場合:

```bash
takt eject default-mini
# ~/.takt/pieces/default-mini.yaml を編集
```

### 5.2 ワークフローの流れ

```
plan (計画)
  ↓ Planning complete
implement (実装)  ← edit: true
  ↓ Implementation complete
review (レビュー) ← edit: false
  ├─ Approved → COMPLETE
  └─ Needs fix → implement (修正ループ)
```

### 5.3 基本的な使い方

```bash
# 単一Issue実行
takt #4

# 複数Issueをキューに入れて実行
takt add #4
takt add #5
takt add #6
takt run

# 結果確認
takt list
# → merge / retry / instruct / delete を選択

# ピースの切り替え
takt switch
```

### 5.4 カスタムペルソナ（任意）

`~/.takt/personas/calorie-reviewer.md`:

```markdown
あなたはCalorieBuddyプロジェクトのコードレビュアーです。
以下の観点でレビューしてください:

- docs/design-directory.md のルール遵守（1ファイル300行以下、named export等）
- Server Components / Client Components の境界が適切か
- Zodバリデーションが漏れなく実装されているか
- エラーハンドリングが設計通りか（docs/design-gemini.md 参照）
```

---

## 6. 開発フローの全体像

### 6.1 TAKT 利用時のフロー

```
1. GitHub Issue を作成（テンプレートに沿って）
2. takt add #N でキューに追加
3. takt run で自動実行
   - plan → implement → review → fix loop → COMPLETE
   - worktree 隔離で main を保護
4. takt list で結果確認
   - merge: 成功 → 次のステップへ
   - retry: 失敗 → 再実行
   - instruct: 追加指示を与えて再実行
5. 品質ゲート（必須）
   - npm run lint && npm run build を実行
   - テスト対象の場合は npm run test も実行
   - 失敗した場合はマージしない
6. /git-push でmainにマージ & デプロイ
```

### 6.2 手動（Claude Code 直接）の場合

TAKTを使わず Claude Code で直接実装する場合は [design-workflow.md](./design-workflow.md) のフローに従う。

```bash
# 1. Issue確認
gh issue view #N

# 2. ブランチ作成
git checkout main && git pull
git checkout -b feature/issue-title

# 3. 実装（Claude Code）

# 4. チェック & マージ
npm run lint && npm run build
git checkout main && git pull
git merge --ff-only feature/issue-title
git push
```

### 6.3 使い分け

| 状況 | 推奨 |
|------|------|
| 明確な仕様のIssue（大半のケース） | TAKT 自動実行 |
| 対話しながら進めたい設計判断 | Claude Code 直接 |
| デバッグ・調査作業 | Claude Code 直接 |
| 複数Issueのバッチ処理 | TAKT キュー実行 |

---

## 7. AI駆動開発のベストプラクティス

### 7.1 コンテキスト管理

| 課題 | 対策 |
|------|------|
| **Lost in the Middle** | 長いコンテキストの中間部分をAIが見落とす → Issueを小さく保ち、参照ドキュメントを明示 |
| **Context Rot** | セッションが長くなると初期の指示を忘れる → 1 Issue = 1セッションで完結させる |
| **コンテキスト汚染** | 実装中にレビュー観点が混ざる → TAKTで実装とレビューを別エージェントに分離 |

### 7.2 Issue記述のコツ

- **受け入れ基準を検証可能に**: 「〜ができる」ではなく「〜のフォームに入力して保存ボタンを押すとDBに保存される」
- **参照ドキュメントを明示**: `docs/spec.md#7.3` のようにセクションまで指定
- **技術的制約を書く**: 「Server Componentで実装」「useActionStateを使う」等
- **スコープ外を明記**: 「グラフ表示は #13 で実装するためここでは不要」

### 7.3 CLAUDE.md の活用

プロジェクトルートの `CLAUDE.md` に以下を記載しておくと、TAKTでもClaude Code直接でもAIが一貫した判断をする:

```markdown
# CalorieBuddy

## ディレクトリ構成
（design-directory.md から要約）

## コーディングルール
- 1ファイル300行以下
- named export 基本（Next.js特殊ファイルのみ default export）
- Server Components / Client Components の境界ルール

## 技術スタック
Next.js (App Router) / React 19 / Tailwind CSS + shadcn/ui / Drizzle ORM / Neon / Gemini API
```

### 7.4 品質チェックポイント

各Issue完了時に最低限確認すること:

- [ ] `npm run lint` が通る
- [ ] `npm run build` が通る
- [ ] テスト対象の場合 `npm run test` が通る
- [ ] design-directory.md のルール（300行制限、named export等）を遵守
- [ ] 新しいファイルが正しいディレクトリに配置されている

---

## 8. 推奨する進行順序

### 基本方針: Phaseごとに Issue作成 → 実装 を繰り返す

Issue は**一気に全部作らない**。Phase単位で作成→実装→完了確認を繰り返す。

理由:
- 前のPhaseの実装結果（実際のパス・コンポーネント名等）を踏まえて、次のIssueを具体的に書ける
- 受け入れ基準が「想像」ではなく「実コードに基づいた検証可能な条件」になる
- 粒度が大きすぎた/小さすぎた場合に次のPhaseで補正できる

### 進行フロー

```
Phase 0 の Issue 3つ作成 → takt run → 品質ゲート → マージ → 完了確認
  ↓
Phase 1 の Issue 3つ作成 → takt run → 品質ゲート → マージ → 完了確認
  ↓
Phase 2 の Issue 5つ作成 → takt run → 品質ゲート → マージ → 完了確認
  ↓
Phase 3 の Issue 3つ作成 → takt run → 品質ゲート → マージ → 完了確認
```

### Step 1: 環境構築（済）

```bash
npm install -g takt
# ~/.takt/config.yaml 設定済み
```

### Step 2: Phase 0 — プロジェクト初期化

```bash
# Phase 0 の Issue を作成（P0-1, P0-2, P0-3）
gh issue create --title "プロジェクトセットアップ" --body "..."
gh issue create --title "DBスキーマ & マイグレーション" --body "..."
gh issue create --title "共通レイアウト & ナビゲーション" --body "..."

# P0-1 を実行（他の全てが依存）
takt #<P0-1の実Issue番号>

# 品質ゲート & マージ
takt list  # → merge

# P0-2 と P0-3 を並列実行
takt add #<P0-2の実Issue番号>
takt add #<P0-3の実Issue番号>
takt run

# 品質ゲート & マージ
```

### Step 3: Phase 1 — 基盤機能

Phase 0 の実装結果を踏まえて P1-1, P1-2, P1-3 の Issue を作成。
並列実行可能なものはまとめてキューに入れる。

### Step 4: Phase 2 — コア機能

Phase 1 の実装結果を踏まえて P2-1〜P2-5 の Issue を作成。

### Step 5: Phase 3 — ダッシュボード & 統合

Phase 2 の実装結果を踏まえて P3-1〜P3-3 の Issue を作成。

---

## 9. 参考リンク

### TAKT 関連

- [TAKT GitHub リポジトリ](https://github.com/nrslib/takt)
- [TAKT README](https://github.com/nrslib/takt/blob/main/README.md)
- [TAKT ワークフロー仕様](https://github.com/nrslib/takt/blob/main/docs/workflows.md)
- [Claude Code と Codex のオーケストレーション（Zenn記事）](https://zenn.dev/nrs/articles/db4120beb0e601)

### AI駆動開発 参考

- [Claude Code Best Practices（公式ドキュメント）](https://code.claude.com/docs/en/best-practices)
- [Claude Code Best Practices（コミュニティ）](https://rosmur.github.io/claudecode-best-practices/)
- [CCPM — Claude Code Project Management](https://github.com/automazeio/ccpm) — PRD→Epic→Task分解 + GitHub Issue連携 + worktree並列実行
- [claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow) — Requirements→Design→Tasks→Implementation の自動化ワークフロー
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) — Claude Code のスキル・フック・プラグイン集

### 設計思想

- **1エージェント1責務**: 実装とレビューを分離することで精度向上（TAKT記事より）
- **構造で制御**: プロンプトではなくYAMLワークフローで品質を担保
- **No Vibe Coding**: 全コードが仕様にトレース可能であるべき（CCPM思想）
