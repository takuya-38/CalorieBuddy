# DB設計

## UUID生成

- **DB側（`gen_random_uuid()`）で生成**
- PostgreSQL の `pgcrypto` 拡張を有効化して利用する
- アプリ側で生成する理由がない（オフライン対応不要、シングルユーザー）

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## テーブル一覧

| テーブル | 概要 | 備考 |
|---|---|---|
| `profile` | ユーザー基本情報 | シングルレコード |
| `meals` | 食事記録 | 同じ日に複数可 |
| `exercises` | 運動記録 | 同じ日に複数可 |
| `weights` | 体重記録 | date に UNIQUE |
| `steps` | 歩数記録 | date に UNIQUE |

## Drizzle 型マッピング

| 仕様上の型 | Drizzle (pg-core) | 例 |
|---|---|---|
| UUID | `uuid()` | `id` |
| DATE | `date({ mode: 'date' })` | `date`, `birth_date` |
| TIMESTAMP | `timestamp({ withTimezone: true, mode: 'date' })` | `created_at`, `updated_at` |
| INTEGER | `integer()` | `calories`, `steps`, `duration_minutes` |
| DECIMAL | `numeric({ precision, scale })` | `height_cm`, `weight_kg`, `mets_value` |
| BOOLEAN | `boolean()` | `is_ai_estimated` |
| TEXT(enum) | `pgEnum()` + enumカラム | `gender`, `meal_type`, `confidence` |

### enum 定義

- `gender`: `'male' | 'female'`
- `meal_type`: `'breakfast' | 'lunch' | 'dinner' | 'snack'`
- `confidence`: `'high' | 'medium' | 'low'`

## カラム制約ルール

- 基本全カラム **NOT NULL**（任意項目のみ nullable）
- 数値制約: `calories >= 0`、`weight_kg > 0`、`steps >= 0`、`duration_minutes > 0`、`height_cm > 0`
- `created_at`: 全テーブル必須、デフォルト `now()`
- `updated_at`: 全テーブル必須、デフォルト `now()`
- `updated_at` は更新時に必ず現在時刻へ更新する（アプリ側で明示更新）

## テーブル別の必須制約

- `profile`
  - `height_cm`, `birth_date`, `gender` は NOT NULL
  - `target_weight_kg` は nullable
- `meals`
  - `meal_type` は NOT NULL
  - `confidence` は `is_ai_estimated = true` のときのみ設定（手動入力時は NULL）
- `weights`
  - `date` は UNIQUE（1日1件）
- `steps`
  - `date` は UNIQUE（1日1件）

## 日付とタイムゾーン

- DBの保存時刻は `TIMESTAMPTZ`（UTC）で保存
- 日次集計の基準は **Asia/Tokyo (JST)** で統一
- `date` カラムは JST の営業日基準で保存し、`today` 判定も JST で行う

## マイグレーション管理

- **`drizzle-kit generate`** でマイグレーションSQLファイルを生成
- **`drizzle-kit migrate`** で Neon に適用
- マイグレーションファイルは `src/db/migrations/` に出力

```ts
// drizzle.config.ts
export default {
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT!,
  },
}
```

## DBエラーハンドリング方針

| 種別 | 例 | アプリ方針 |
|---|---|---|
| 一時的接続エラー | Neonコールドスタート、ネットワーク瞬断 | 読み取りのみ1回リトライ（200ms待ち） |
| 接続枯渇/タイムアウト | プール上限、クエリ遅延 | ユーザーには「一時的なDBエラー。再試行してください」を表示 |
| 制約違反 | UNIQUE衝突、CHECK違反 | リトライしない。入力エラーとして返却 |
| マイグレーション不整合 | カラム不一致 | 500で失敗させ、ログで即検知して修復 |

- ログには最低限 `action`, `table`, `error_code`, `is_retryable` を含める
- ログプレフィックスは `console.error('[DB] ...', meta)` を統一利用する
