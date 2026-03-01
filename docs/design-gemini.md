# Gemini API連携設計

## 基本構成

| 項目 | 選定 |
|---|---|
| SDK | `@google/genai` |
| モデル | `gemini-2.5-flash` |
| クライアント初期化 | `lib/gemini.ts` に集約 |
| プロンプト | 各 `features/*/actions.ts` に直書き |
| ストリーミング | 不要（一括レスポンス） |

## 用途1: カロリー推定

- ユーザーが食事内容をテキスト入力 → Gemini が JSON で返す
- **Structured Output**（`responseMimeType: 'application/json'` + スキーマ指定）で型安全なレスポンスを取得
- responseSchema と Zod スキーマは `features/meals/schemas.ts` に集約
- さらに **Zod で二段検証**して安全性を担保
- 推定結果はユーザーが修正可能
- `temperature: 0.1`（再現性重視）

### レスポンス例

```json
[
  { "name": "牛丼", "calories": 650, "confidence": "high" },
  { "name": "味噌汁", "calories": 40, "confidence": "high" },
  { "name": "サラダ", "calories": 30, "confidence": "medium" }
]
```

## 用途2: 励ましメッセージ

- 今日のカロリー収支データを渡して一言メッセージを生成
- **キャッシュなし**（毎回生成。自分専用でアクセス頻度が低いためコスト問題なし）
- `temperature: 0.8`（バリエーション重視）
- トーン: フレンドリーでポジティブ、決して責めない

## エラーハンドリング

| 項目 | 方針 |
|---|---|
| タイムアウト | 10秒 |
| リトライ | 429/5xx のみ1回（1秒待ち）。それでも失敗したらフォールバック |
| カロリー推定エラー時 | 「推定できませんでした。手動入力してください」と表示 |
| 励ましメッセージエラー時 | 固定メッセージを表示（「今日も頑張ろう！」等） |
| ログ | `console.error` にエラー種別を付与 |

### ログ例

```ts
console.error('[Gemini] カロリー推定失敗:', { type: 'timeout', model: 'gemini-2.5-flash' })
```
