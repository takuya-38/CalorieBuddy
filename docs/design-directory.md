# ディレクトリ構成

## 方針

- API は **Server Actions** ベース（Route Handlers は必要になった時だけ）
- データ取得は **Server Components** で直接 `features/*/queries.ts` を呼ぶ
- `page.tsx` はデータ取得とコンポーネント組み立てのみ。UIロジックは持たない
- **機能単位のコロケーション**（1機能 = 1フォルダで完結）でAI駆動開発に最適化

## 構成

```
src/
├── app/                          # ルーティングのみ
│   ├── layout.tsx
│   ├── page.tsx                  # ダッシュボード (/)
│   ├── meals/
│   │   └── page.tsx              # 食事入力 (/meals)
│   ├── exercise/
│   │   └── page.tsx              # 運動入力 (/exercise)
│   ├── weight/
│   │   └── page.tsx              # 体重記録 (/weight)
│   └── settings/
│       └── page.tsx              # 設定 (/settings)
│
├── features/                     # 機能単位（1機能 = 1フォルダで完結）
│   ├── dashboard/
│   │   ├── components/           # ダッシュボード専用コンポーネント
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── schemas.ts            # Zod スキーマ
│   ├── meals/
│   │   ├── components/           # 食事入力用コンポーネント
│   │   ├── actions.ts            # saveMeal, estimateCalories
│   │   ├── queries.ts            # getMealsByDate 等
│   │   └── schemas.ts
│   ├── exercise/
│   │   ├── components/           # 運動入力用コンポーネント
│   │   ├── actions.ts            # saveExercise, saveSteps
│   │   ├── queries.ts
│   │   └── schemas.ts
│   ├── weight/
│   │   ├── components/           # 体重記録用コンポーネント
│   │   ├── actions.ts            # saveWeight
│   │   ├── queries.ts
│   │   └── schemas.ts
│   └── settings/
│       ├── components/           # 設定用コンポーネント
│       ├── actions.ts            # updateProfile
│       ├── queries.ts
│       └── schemas.ts
│
├── components/                   # 共有UIコンポーネント（機能横断）
│   ├── ui/                       # 汎用UI (ボタン, カード, Input等)
│   └── layout/                   # ナビ, ヘッダー, フッター
│
├── db/                           # スキーマと接続のみ
│   ├── schema.ts                 # Drizzle スキーマ定義
│   └── index.ts                  # DB接続
│
└── lib/                          # 機能横断ユーティリティ
    ├── gemini.ts                 # Gemini APIクライアント
    ├── calc.ts                   # カロリー計算ロジック (BMR, METs等)
    └── constants.ts              # METs値一覧等の定数
```

## 各層の責務

| 層 | 場所 | 責務 |
|---|---|---|
| ページ | `app/**/page.tsx` | データ取得、コンポーネント組み立て |
| 機能 | `features/*/` | 機能ごとのコンポーネント・アクション・クエリ |
| バリデーション | `features/*/schemas.ts` | 入出力スキーマ定義（Zod） |
| 共有UI | `components/` | 機能横断の汎用コンポーネント |
| スキーマ | `db/schema.ts` | テーブル定義 |
| DB接続 | `db/index.ts` | Drizzle クライアント |
| ユーティリティ | `lib/` | ビジネスロジック、外部API、定数 |

## AI駆動開発ルール

- **1ファイル300行以下**を維持する（AIのコンテキスト効率を保つ）
- **named export** を基本とする（AIのシンボル解決精度が上がる）
  - 例外: Next.js 特殊ファイル（`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`）は default export
- **命名規則を統一**（ディレクトリ: kebab-case、コンポーネント: PascalCase）
- **CLAUDE.md にディレクトリ構成マップを書く**（AIが「どこに何を置くか」を即座に判断できる）

## バリデーションルール

- `actions.ts` は DB 更新前に必ず `schemas.ts` で入力検証を行う
- AI レスポンス（JSON）は保存前に必ずスキーマ検証する

## テスト配置ルール

- テストは対象ファイルと同階層に `*.test.ts` で配置する
- MVPでは `lib/calc.ts` のみユニットテストを作成する（`lib/calc.test.ts`）
- 詳細方針は `docs/design-test.md` を参照する

## 補足

- ダッシュボードは初期から取得を分割する（Summary / Trends / Motivation）
  - `page.tsx` はセクションごとに Server Component を分け、`Suspense` でストリーミング表示する
  - 重い処理（週間・月間集計、AIメッセージ）は独立クエリにする
- DB の詳細（Drizzle API）は `db/` と `features/*/queries.ts` 以外に漏らさない
- 新機能追加時は `features/` 配下に新ディレクトリを作成する
