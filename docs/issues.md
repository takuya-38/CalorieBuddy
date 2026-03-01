# CalorieBuddy — GitHub Issue 一覧

> 全14 Issue の詳細定義。Phase単位で Issue 作成 → 実装 → 完了確認を繰り返す。
>
> **注意**: 以下の番号（P0-1 等）はドキュメント管理IDであり、実際の GitHub Issue 番号とは異なる。

---

## Phase 0: プロジェクト初期化

### P0-1: プロジェクトセットアップ

**依存**: なし

#### ゴール

Next.js + Tailwind CSS + shadcn/ui + Drizzle ORM + Vitest の初期構成を完了し、開発の土台を整える。

#### 参照ドキュメント

- `docs/spec.md` セクション2（技術スタック）
- `docs/design-directory.md`（ディレクトリ構成）
- `docs/design-deploy.md`（環境変数）
- `docs/design-test.md`（Vitest設定）

#### 受け入れ基準

- [ ] `npx create-next-app` で Next.js (App Router) プロジェクトが作成されている
- [ ] TypeScript + Tailwind CSS が設定済み
- [ ] shadcn/ui が初期化されている（`npx shadcn@latest init`）
- [ ] Drizzle ORM + `@neondatabase/serverless` がインストールされている
- [ ] `drizzle.config.ts` が `docs/design-db.md` の設定に従って作成されている
- [ ] Vitest がインストール・設定されている（`vitest.config.ts`）
- [ ] `.env.local.example` に `DATABASE_URL`, `DATABASE_URL_DIRECT`, `GEMINI_API_KEY` の3変数がプレースホルダーで定義されている
- [ ] ESLint の設定が Next.js デフォルト + TypeScript 向けに整っている
- [ ] `src/` ディレクトリ構成が `docs/design-directory.md` に従っている（`app/`, `features/`, `components/`, `db/`, `lib/` の空ディレクトリまたはプレースホルダー）
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- Next.js は App Router を使用（Pages Router ではない）
- `src/` ディレクトリを使用する設定にする
- Tailwind CSS は Next.js 作成時に同時セットアップされる
- shadcn/ui のスタイルは `New York` スタイルを使用
- Recharts はこの段階ではインストール不要（P1-3 で追加）
- `@google/genai` もこの段階ではインストール不要（P2-2 で追加）

#### スコープ外

- DB スキーマ定義・マイグレーション（P0-2）
- 共通レイアウト・ナビゲーション UI（P0-3）
- CLAUDE.md の作成（手動で別途対応）

---

### P0-2: DBスキーマ & マイグレーション

**依存**: P0-1

#### ゴール

Drizzle ORM で 5 テーブルのスキーマを定義し、Neon PostgreSQL への初回マイグレーションを実行する。

#### 参照ドキュメント

- `docs/spec.md` セクション7（データモデル）
- `docs/design-db.md`（DB設計全般）
- `docs/design-deploy.md`（Neon接続設定）

#### 受け入れ基準

- [ ] `src/db/schema.ts` に 5 テーブル（`profile`, `weights`, `meals`, `exercises`, `steps`）が定義されている
- [ ] pgEnum が 3 つ定義されている: `gender`（male/female）, `mealType`（breakfast/lunch/dinner/snack）, `confidence`（high/medium/low）
- [ ] UUID は `gen_random_uuid()` でDB側生成（`.defaultRandom()`）
- [ ] `created_at` は全テーブルに `defaultNow()` で設定
- [ ] `updated_at` は全テーブルに `defaultNow()` で設定
- [ ] `weights.date` と `steps.date` に UNIQUE 制約がある
- [ ] 数値カラムに適切な制約がある（`calories >= 0`, `weight_kg > 0`, `steps >= 0`, `duration_minutes > 0`, `height_cm > 0`）
- [ ] `meals.confidence` は nullable（手動入力時は NULL）
- [ ] `profile.target_weight_kg` は nullable
- [ ] DECIMAL 型カラム（`height_cm`, `weight_kg`, `mets_value`）が `numeric({ precision, scale })` で定義されている
- [ ] DATE 型は `date({ mode: 'date' })`、TIMESTAMP 型は `timestamp({ withTimezone: true, mode: 'date' })` で定義されている
- [ ] `src/db/index.ts` に Neon + Drizzle の接続設定が実装されている（`@neondatabase/serverless` のプーリング接続）
- [ ] `npx drizzle-kit generate` でマイグレーションファイルが `src/db/migrations/` に生成される
- [ ] `npx drizzle-kit migrate` で Neon に正常適用できる（手動確認）
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- `drizzle.config.ts` の `out` は `./src/db/migrations` を指定
- マイグレーション時は `DATABASE_URL_DIRECT`（ダイレクト接続）を使用
- アプリ実行時は `DATABASE_URL`（プーリング接続）を使用
- `pgcrypto` 拡張の有効化は Neon ではデフォルトで有効のため、明示不要
- `numeric` の precision/scale は `height_cm(5,1)`, `weight_kg(5,1)`, `mets_value(3,1)`, `target_weight_kg(5,1)` を目安とする

#### スコープ外

- Server Actions の実装（Phase 1 以降）
- Zod バリデーションスキーマ（各機能の Issue で実装）
- DBエラーハンドリングのリトライロジック（各機能の Issue で実装）

---

### P0-3: 共通レイアウト & ナビゲーション

**依存**: P0-1

#### ゴール

App Router のルートレイアウト + モバイルファーストのボトムナビゲーション + 各ページのスケルトンを作成する。

#### 参照ドキュメント

- `docs/spec.md` セクション6（画面構成）
- `docs/design-directory.md`（ディレクトリ構成）
- `docs/design-ui.md`（UIスタイリング方針）

#### 受け入れ基準

- [ ] `src/app/layout.tsx` にルートレイアウトが実装されている（html, body, フォント設定, メタデータ）
- [ ] `src/components/layout/bottom-nav.tsx` にボトムナビゲーションが実装されている
- [ ] ボトムナビに 5 つのリンクがある: ダッシュボード(`/`), 食事(`/meals`), 運動(`/exercise`), 体重(`/weight`), 設定(`/settings`)
- [ ] 各リンクにアイコン + ラベルがあり、現在のページがハイライトされる
- [ ] タップ領域が 44px 以上（Apple HIG 準拠）
- [ ] モバイルファースト（375px 幅で正しく表示される）
- [ ] 5 つのページファイルが作成されている: `src/app/page.tsx`, `src/app/meals/page.tsx`, `src/app/exercise/page.tsx`, `src/app/weight/page.tsx`, `src/app/settings/page.tsx`
- [ ] 各ページは仮のタイトル表示のみ（「ダッシュボード」「食事入力」等のプレースホルダー）
- [ ] ボトムナビは画面下部に固定表示（`fixed bottom-0`）
- [ ] メインコンテンツ領域にボトムナビ分の余白がある（ナビに隠れない）
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- ボトムナビは `'use client'` コンポーネント（`usePathname` でアクティブ判定するため）
- アイコンは `lucide-react`（shadcn/ui に同梱）を使用
- ナビアイコン候補: Home, Utensils, Dumbbell（or Activity）, Scale（or Weight）, Settings
- レイアウトのフォントは `next/font` の `Inter` または `Noto Sans JP` を検討
- デスクトップでの表示はモバイルと同じレイアウトでOK（最適化しない）

#### スコープ外

- 各ページの実際の機能実装（Phase 1 以降）
- ダッシュボードのサマリー表示やグラフ（P3-1, P3-2）
- loading.tsx / error.tsx の実装（必要に応じて各機能 Issue で追加）

---

## Phase 1: 基盤機能

> Phase 0 完了後に Issue を作成する。P1-1, P1-2, P1-3 は並列実行可能。

### P1-1: プロフィール設定画面

**依存**: P0-2

#### ゴール

`/settings` でユーザーのプロフィール（身長・生年月日・性別・目標体重）を入力・保存できるようにする。

#### 参照ドキュメント

- `docs/spec.md` セクション3.5（プロフィール / 設定）
- `docs/spec.md` セクション7.1（profile テーブル）
- `docs/design-state.md`（Server Actions, useActionState, revalidatePath）
- `docs/design-directory.md`（features/ 配置ルール）

#### 受け入れ基準

- [ ] `src/features/settings/schemas.ts` に Zod スキーマが定義されている（`height_cm`: 正の数, `birth_date`: 過去の日付, `gender`: male/female, `target_weight_kg`: nullable正の数）
- [ ] `src/features/settings/actions.ts` に `updateProfile` Server Action が実装されている
- [ ] `updateProfile` は Zod でバリデーション後、profile テーブルに upsert する
- [ ] `updateProfile` 成功時に `revalidatePath('/')` + `revalidatePath('/settings')` を実行する
- [ ] `src/features/settings/queries.ts` に `getProfile` クエリが実装されている
- [ ] `getProfile` の先頭で `noStore()` を呼んでいる
- [ ] `src/features/settings/components/` にプロフィール入力フォームコンポーネントがある
- [ ] フォームは `useActionState` で実装されている
- [ ] フォームにクライアント側 Zod バリデーションがある（送信前チェック）
- [ ] 身長は数値入力（cm）、生年月日はdate入力、性別はラジオボタンまたはセレクト、目標体重は数値入力（任意）
- [ ] 既存のプロフィールがある場合はフォームに初期値が表示される
- [ ] 保存成功時にフィードバック（トーストまたはメッセージ）が表示される
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- profile テーブルはシングルレコード。レコードがなければ INSERT、あれば UPDATE（upsert パターン）
- `updated_at` は更新時にアプリ側で `new Date()` をセットする
- shadcn/ui の `Input`, `Button`, `Label`, `Select` 等を使用
- フォームコンポーネントは `'use client'`
- ページファイル `src/app/settings/page.tsx` は Server Component でデータ取得 → フォームにprops渡し

#### スコープ外

- BMR の計算表示（P3-1 で実装）
- 他画面でのプロフィール未設定時の誘導表示（各機能のIssueで対応）

---

### P1-2: カロリー計算ロジック + テスト

**依存**: P0-2

#### ゴール

`lib/calc.ts` にカロリー計算の純粋関数を実装し、`lib/calc.test.ts` でユニットテストを書く。

#### 参照ドキュメント

- `docs/spec.md` セクション4（カロリー計算ロジック）
- `docs/design-test.md`（テスト方針）
- `docs/design-directory.md`（lib/ 配置ルール）

#### 受け入れ基準

- [ ] `src/lib/constants.ts` に METs 値一覧が定義されている（ウォーキング普通3.5, 速歩5.0, ランニング軽い7.0, 速い11.0, 筋トレ中程度5.0, 高強度8.0, 水泳8.0, サイクリング7.5, ヨガ3.0）
- [ ] `src/lib/calc.ts` に以下の関数が named export されている:
  - `calculateBMR(params: { weightKg: number; heightCm: number; birthDate: Date; gender: 'male' | 'female' }): number` — ハリス・ベネディクト式（改良版）でBMR計算
  - `calculateExerciseCalories(params: { mets: number; weightKg: number; durationMinutes: number }): number` — METs × 体重 × 時間（時間換算）
  - `calculateStepCalories(params: { steps: number; weightKg: number }): number` — 歩数 × 0.3 × 体重 / 1000
  - `getBalanceStatus(balance: number): 'under' | 'balanced' | 'over'` — 収支判定（< -200: under, -200〜200: balanced, > 200: over）
- [ ] BMR計算で年齢は `birthDate` と現在日から算出する（年齢をカラムに持たない）
- [ ] 各関数の戻り値は整数に丸める（`Math.round`）
- [ ] `src/lib/calc.test.ts` に以下のテストケースがある:
  - BMR 男性（例: 70kg, 170cm, 30歳）で期待値と一致
  - BMR 女性（例: 55kg, 158cm, 25歳）で期待値と一致
  - 運動消費 30分（例: ランニング METs7.0, 70kg, 30分 → 245kcal）
  - 運動消費 60分（例: ウォーキング METs3.5, 70kg, 60分 → 245kcal）
  - 歩数消費 0歩 → 0kcal
  - 歩数消費 10,000歩・70kg → 210kcal
  - 収支判定 -201 → 'under'
  - 収支判定 -200 → 'balanced'
  - 収支判定 200 → 'balanced'
  - 収支判定 201 → 'over'
- [ ] `npm run test` が全テスト通過する
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- BMR 男性: `88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)`
- BMR 女性: `447.593 + (9.247 × weight) + (3.098 × height) - (4.330 × age)`
- 運動消費: `METs × weightKg × (durationMinutes / 60)`
- 歩数消費: `steps × 0.3 × weightKg / 1000`
- 年齢計算は誕生日が今年まだ来ていなければ -1 する一般的なロジック
- 関数は全て純粋関数（副作用なし）にする
- テストで「現在日」を使う箇所は、テスト内で明示的な日付を渡すか、日付パラメータを追加する

#### スコープ外

- UI コンポーネント（計算結果の表示は P3-1）
- DB との連携（各画面の Issue で計算関数を呼び出す）
- Gemini API でのカロリー推定（P2-2）

---

### P1-3: 体重記録画面

**依存**: P0-2, P0-3

#### ゴール

`/weight` で日ごとの体重を入力・保存し、推移グラフを表示する。

#### 参照ドキュメント

- `docs/spec.md` セクション3.4（体重記録）
- `docs/spec.md` セクション7.2（weights テーブル）
- `docs/design-state.md`（Server Actions, revalidatePath）
- `docs/design-ui.md`（Recharts グラフ）

#### 受け入れ基準

- [ ] `src/features/weight/schemas.ts` に Zod スキーマが定義されている（`date`: 日付, `weight_kg`: 正の数）
- [ ] `src/features/weight/actions.ts` に `saveWeight` Server Action が実装されている
- [ ] `saveWeight` は Zod バリデーション後、weights テーブルに upsert する（同じ日付なら更新）
- [ ] `saveWeight` 成功時に `revalidatePath('/')` + `revalidatePath('/weight')` を実行する
- [ ] `src/features/weight/queries.ts` に `getWeightHistory` クエリ（直近30日分の体重記録を取得）が実装されている
- [ ] `getWeightHistory` の先頭で `noStore()` を呼んでいる
- [ ] `src/features/weight/components/` に体重入力フォームコンポーネントがある
- [ ] フォームは `useActionState` で実装されている
- [ ] 体重は数値入力（kg, 小数第1位まで）、日付はデフォルトで今日
- [ ] `src/features/weight/components/` に体重推移グラフコンポーネントがある（Recharts の折れ線グラフ）
- [ ] グラフコンポーネントは `'use client'` で、データは親の Server Component から props で受け取る
- [ ] Recharts がプロジェクトにインストールされている
- [ ] 保存成功時にフィードバック表示がある
- [ ] 記録がない場合は「体重記録がありません」等のメッセージを表示
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- Recharts は `'use client'` コンポーネントでのみ使用。データフェッチは Server Component で行う
- 体重のupsertは `onConflictDoUpdate` を使用（`date` UNIQUE 制約を活用）
- グラフの X 軸は日付、Y 軸は体重（kg）
- `updated_at` は更新時にアプリ側でセット
- 日付のデフォルト値は JST の今日

#### スコープ外

- 目標体重との差分表示（ダッシュボードで実装する場合は P3-1）
- ダッシュボード内の体重推移グラフ（P3-2）
- 体重が未登録時の他画面での誘導表示

---

## Phase 2: コア機能

> Phase 1 完了後に Issue を作成する。P2-1 と P2-2 は並列実行可能。P2-4 と P2-5 も並列実行可能。

### P2-1: 食事手動入力

**依存**: P0-2, P0-3

#### ゴール

`/meals` の手動モードで、品名 + kcal + 食事タイプを入力して食事記録を保存できるようにする。

#### 参照ドキュメント

- `docs/spec.md` セクション3.2（食事入力 - 手動モード）
- `docs/spec.md` セクション7.3（meals テーブル）
- `docs/design-state.md`（Server Actions, revalidatePath）

#### 受け入れ基準

- [ ] `src/features/meals/schemas.ts` に手動入力用の Zod スキーマが定義されている（`name`: 非空文字列, `calories`: 0以上の整数, `meal_type`: breakfast/lunch/dinner/snack, `date`: 日付）
- [ ] `src/features/meals/actions.ts` に `saveMeal` Server Action が実装されている
- [ ] `saveMeal` は Zod バリデーション後、meals テーブルに INSERT する
- [ ] 手動入力時は `is_ai_estimated = false`, `confidence = null` で保存する
- [ ] `saveMeal` 成功時に `revalidatePath('/')` + `revalidatePath('/meals')` を実行する
- [ ] `src/features/meals/queries.ts` に `getMealsByDate` クエリ（指定日の食事記録を取得）が実装されている
- [ ] `getMealsByDate` の先頭で `noStore()` を呼んでいる
- [ ] `src/features/meals/components/` に手動入力フォームコンポーネントがある
- [ ] フォームは `useActionState` で実装されている
- [ ] 食事タイプは朝食/昼食/夕食/間食の4択セレクト
- [ ] 日付はデフォルトで今日
- [ ] 当日の食事記録一覧が画面下部に表示される（品名、カロリー、食事タイプ）
- [ ] 保存成功時にフォームがクリアされ、一覧に追加された記録が表示される
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- AIモード/手動モードの切り替えUIは、この Issue では手動モードのみ実装する。トグルUIの枠だけ作っておき、AIモード側は「Coming Soon」等で良い
- `date` カラムは JST 基準
- `updated_at` は INSERT 時に `defaultNow()` で自動設定

#### スコープ外

- AI モードの実装（P2-3）
- 食事記録の編集・削除機能
- カロリー合計の表示（ダッシュボード P3-1 で対応）

---

### P2-2: Gemini API 連携

**依存**: P0-1

#### ゴール

`lib/gemini.ts` に Gemini API クライアントを実装し、食事テキストからカロリーを推定する機能を作る。

#### 参照ドキュメント

- `docs/design-gemini.md`（Gemini API連携設計全般）
- `docs/spec.md` セクション4.4（食事カロリー推定）

#### 受け入れ基準

- [ ] `@google/genai` がプロジェクトにインストールされている
- [ ] `src/lib/gemini.ts` に Gemini クライアントの初期化処理がある（`GEMINI_API_KEY` 環境変数を使用）
- [ ] `src/lib/gemini.ts` に `estimateCaloriesFromText` 関数が実装されている
  - 入力: 食事内容テキスト（string）
  - 出力: `{ name: string; calories: number; confidence: 'high' | 'medium' | 'low' }[]`
  - モデル: `gemini-2.5-flash`
  - Structured Output（`responseMimeType: 'application/json'` + responseSchema）を使用
  - `temperature: 0.1`
- [ ] `src/features/meals/schemas.ts` に Gemini レスポンス用の Zod スキーマ（`geminiCalorieEstimateSchema`）が定義されている
- [ ] Gemini のレスポンスを Zod で二段検証している（Structured Output + Zod parse）
- [ ] タイムアウト 10 秒が設定されている
- [ ] 429/5xx エラー時に 1 回リトライ（1 秒待ち）するロジックがある
- [ ] リトライ失敗・その他エラー時にフォールバック（空配列を返す or エラーメッセージ）
- [ ] エラーログが `console.error('[Gemini] ...', { type, model })` 形式で出力される
- [ ] `src/lib/gemini.ts` に `generateMotivationMessage` 関数が実装されている
  - 入力: カロリー収支データ（摂取, 消費, 収支, ステータス）
  - 出力: string（励ましメッセージ）
  - `temperature: 0.8`
  - エラー時フォールバック: 「今日も頑張ろう！」
- [ ] プロンプトは日本の食事に対応した内容になっている
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- SDK: `@google/genai`（`import { GoogleGenAI } from '@google/genai'`）
- Structured Output は responseSchema にJSON Schemaを指定する方式
- Zod スキーマと responseSchema の整合性を保つ（手動で二重定義する形でOK）
- プロンプト例（カロリー推定）: 「以下の食事内容のカロリーを推定してください。日本の一般的な分量を想定してください。」
- プロンプト例（励まし）: 「あなたはダイエットのサポーターです。以下のデータに基づいて、フレンドリーで前向きな一言メッセージを返してください。決して責めないでください。」
- タイムアウトは `AbortController` + `setTimeout` で実装

#### スコープ外

- UI（食事 AI モードの画面は P2-3）
- Server Action としての統合（P2-3 で `estimateCalories` action を実装）
- 励ましメッセージの画面表示（P3-3）

---

### P2-3: 食事 AI モード

**依存**: P2-1, P2-2

#### ゴール

`/meals` の AI モードで、テキスト入力 → Gemini でカロリー推定 → 確認・修正 → 保存のフローを実装する。

#### 参照ドキュメント

- `docs/spec.md` セクション3.2（食事入力 - AI モード）
- `docs/design-gemini.md`（カロリー推定レスポンス）
- `docs/design-state.md`（Server Actions）

#### 受け入れ基準

- [ ] `/meals` ページに AI モード / 手動モードのトグル切り替え UI がある
- [ ] AI モード画面にテキストエリア（自由入力）がある
- [ ] 「推定する」ボタンを押すと `estimateCalories` Server Action が呼ばれる
- [ ] `src/features/meals/actions.ts` に `estimateCalories` Server Action が実装されている（`lib/gemini.ts` の `estimateCaloriesFromText` を呼ぶ）
- [ ] 推定結果が一覧表示される（品名、推定カロリー、信頼度）
- [ ] ユーザーが各品目のカロリーを修正できる（インライン編集）
- [ ] 食事タイプ（朝食/昼食/夕食/間食）を選択できる
- [ ] 「保存」ボタンで全品目が meals テーブルに保存される（`is_ai_estimated = true`, `confidence` 付き）
- [ ] 推定中はローディング表示がある
- [ ] 推定エラー時は「推定できませんでした。手動入力してください」のメッセージが表示される
- [ ] 保存成功後にフォームがクリアされ、当日の食事一覧に追加される
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- AIモードのフォームは `'use client'` コンポーネント（推定結果の表示・編集にクライアント状態が必要）
- 推定 → 修正 → 保存の2ステップUI（ステート: `idle` → `estimating` → `reviewing` → `saving` → `idle`）
- 修正可能なのはカロリー値のみ（品名・信頼度は変更不可）
- 1回の推定で複数品目が返ってくるため、保存時は `Promise.all` またはトランザクションで一括保存
- 保存時のカロリー値はユーザーが修正した値を使う

#### スコープ外

- 食事記録の編集・削除機能
- 過去の日付への AI 推定入力（日付はデフォルト今日のみ）
- 食事画像からの AI 推定（将来機能）

---

### P2-4: 運動入力

**依存**: P0-2, P0-3, P1-2

#### ゴール

`/exercise` で運動種類 + 時間を入力し、METs 自動計算で消費カロリーを保存する。

#### 参照ドキュメント

- `docs/spec.md` セクション3.3（運動入力）
- `docs/spec.md` セクション4.2（運動消費カロリー）
- `docs/spec.md` セクション7.4（exercises テーブル）
- `docs/design-state.md`（Server Actions, revalidatePath）

#### 受け入れ基準

- [ ] `src/features/exercise/schemas.ts` に運動入力用の Zod スキーマが定義されている（`exercise_type`: 定義済み種類のいずれか, `duration_minutes`: 1以上の整数, `date`: 日付）
- [ ] `src/features/exercise/actions.ts` に `saveExercise` Server Action が実装されている
- [ ] `saveExercise` は Zod バリデーション後、選択された運動種類の METs 値（`lib/constants.ts` から取得）と最新の体重を使って `lib/calc.ts` の `calculateExerciseCalories` で消費カロリーを計算し、exercises テーブルに INSERT する
- [ ] `saveExercise` 成功時に `revalidatePath('/')` + `revalidatePath('/exercise')` を実行する
- [ ] `src/features/exercise/queries.ts` に `getExercisesByDate` クエリ（指定日の運動記録を取得）が実装されている
- [ ] `getExercisesByDate` の先頭で `noStore()` を呼んでいる
- [ ] `src/features/exercise/components/` に運動入力フォームコンポーネントがある
- [ ] フォームは `useActionState` で実装されている
- [ ] 運動種類はセレクト（9種類: ウォーキング普通, ウォーキング速歩, ランニング軽い, ランニング速い, 筋トレ中程度, 筋トレ高強度, 水泳, サイクリング, ヨガ）
- [ ] 時間は分単位で数値入力
- [ ] 当日の運動記録一覧が画面に表示される（運動種類、時間、消費カロリー）
- [ ] 体重が未登録の場合はエラーメッセージを表示し、保存を拒否する
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- 消費カロリーはサーバー側で計算（クライアント側での計算プレビューは任意）
- 体重は直近の weights テーブルから取得（当日なければ最新のレコード）
- 体重が1件も登録されていない場合は「先に体重を登録してください」と表示
- METs 値は `lib/constants.ts` から運動種類をキーに取得

#### スコープ外

- 歩数入力（P2-5）
- 運動記録の編集・削除
- カスタム運動種類の追加

---

### P2-5: 歩数入力

**依存**: P0-2, P0-3, P1-2

#### ゴール

`/exercise` 内に歩数入力フォームを追加し、消費カロリーを自動計算して保存する。

#### 参照ドキュメント

- `docs/spec.md` セクション3.3（運動入力 - 歩数）
- `docs/spec.md` セクション4.3（歩数からの消費カロリー）
- `docs/spec.md` セクション7.5（steps テーブル）
- `docs/design-state.md`（Server Actions, revalidatePath）

#### 受け入れ基準

- [ ] `src/features/exercise/schemas.ts` に歩数入力用の Zod スキーマが定義されている（`steps`: 0以上の整数, `date`: 日付）
- [ ] `src/features/exercise/actions.ts` に `saveSteps` Server Action が実装されている
- [ ] `saveSteps` は Zod バリデーション後、最新の体重を使って `lib/calc.ts` の `calculateStepCalories` で消費カロリーを計算し、steps テーブルに upsert する（同じ日付なら上書き）
- [ ] `saveSteps` 成功時に `revalidatePath('/')` + `revalidatePath('/exercise')` を実行する
- [ ] `src/features/exercise/queries.ts` に `getStepsByDate` クエリ（指定日の歩数記録を取得）が実装されている
- [ ] `getStepsByDate` の先頭で `noStore()` を呼んでいる
- [ ] `/exercise` ページ内に歩数入力セクションがある（運動入力と同じページ）
- [ ] 歩数は数値入力、日付はデフォルトで今日
- [ ] 当日の歩数記録が表示される（歩数 + 消費カロリー）
- [ ] 同じ日に再入力した場合は上書き更新される
- [ ] 体重が未登録の場合はエラーメッセージを表示し、保存を拒否する
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- steps テーブルは `date` UNIQUE のため、upsert は `onConflictDoUpdate` を使用
- 消費カロリー計算: `steps × 0.3 × weightKg / 1000`（`lib/calc.ts` の `calculateStepCalories` を使用）
- 体重の取得ロジックは P2-4 と同じ（直近の weights レコード）
- 歩数入力セクションは運動入力の下に配置する

#### スコープ外

- HealthKit / Google Fit 連携（将来機能）
- 歩数の自動取得
- 歩数の時系列グラフ

---

## Phase 3: ダッシュボード & 統合

> Phase 2 完了後に Issue を作成する。

### P3-1: ダッシュボード・カロリー収支サマリー

**依存**: P1-1, P1-2, P1-3, P2-1, P2-4, P2-5

#### ゴール

`/`（ダッシュボード）に今日のカロリー摂取・消費・収支のサマリーと3段階ステータスを表示する。

#### 参照ドキュメント

- `docs/spec.md` セクション3.1（ダッシュボード）
- `docs/spec.md` セクション4.5（カロリー収支判定）
- `docs/design-directory.md`（ダッシュボードの Suspense 分割）
- `docs/design-state.md`（未登録データ時の挙動）

#### 受け入れ基準

- [ ] `src/features/dashboard/queries.ts` に `getDailySummary` クエリが実装されている
  - 今日の摂取カロリー合計（meals テーブル）
  - 今日の運動消費カロリー合計（exercises テーブル）
  - 今日の歩数消費カロリー（steps テーブル）
  - BMR（profile + 直近体重から計算）
  - 収支 = 摂取 - (BMR + 運動消費 + 歩数消費)
- [ ] `getDailySummary` の先頭で `noStore()` を呼んでいる
- [ ] `src/features/dashboard/components/` にサマリー表示コンポーネントがある
- [ ] サマリーに以下が表示される: 摂取カロリー、BMR、運動消費、歩数消費、収支
- [ ] 収支に基づく 3 段階ステータスが色分きで表示される:
  - `< -200 kcal`: 「まだ食べれる」（緑系）
  - `-200 〜 200 kcal`: 「いい感じ！」（青系）
  - `> 200 kcal`: 「食べ過ぎ」（赤系）
- [ ] `lib/calc.ts` の `getBalanceStatus` を使って判定している
- [ ] プロフィール未登録時は「先にプロフィールを設定してください」と表示し、`/settings` へのリンクを表示
- [ ] 体重未登録時も同様に設定を促す表示
- [ ] ダッシュボードのサマリーは `Suspense` で囲まれている（ストリーミング対応）
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- `page.tsx` は Server Component。`getDailySummary` を直接呼び、結果をコンポーネントにprops渡し
- サマリーコンポーネントは Server Component でOK（インタラクション不要）
- 日付の「今日」判定は JST（Asia/Tokyo）基準
- BMR 計算に必要な体重は、当日の記録がなければ直近の weights レコードを使用
- ダッシュボードの各セクション（サマリー / グラフ / AIメッセージ）は独立した Server Component に分け、`Suspense` で囲む

#### スコープ外

- 週間・月間推移グラフ（P3-2）
- AI 励ましメッセージ（P3-3）
- 過去の日付のサマリー表示

---

### P3-2: 週間・月間推移グラフ

**依存**: P3-1

#### ゴール

ダッシュボード内にカロリー収支と体重の週間・月間推移グラフを追加する。

#### 参照ドキュメント

- `docs/spec.md` セクション3.1（ダッシュボード - 推移グラフ）
- `docs/design-ui.md`（Recharts グラフ仕様）
- `docs/design-directory.md`（Suspense 分割）

#### 受け入れ基準

- [ ] `src/features/dashboard/queries.ts` に `getWeeklySummary` クエリ（直近7日間の日別カロリー収支）が実装されている
- [ ] `src/features/dashboard/queries.ts` に `getMonthlySummary` クエリ（直近30日間の日別カロリー収支）が実装されている
- [ ] 各クエリの先頭で `noStore()` を呼んでいる
- [ ] `src/features/dashboard/components/` にカロリー収支推移グラフコンポーネントがある（Recharts 棒グラフ）
- [ ] `src/features/dashboard/components/` に体重推移グラフコンポーネントがある（Recharts 折れ線グラフ）
- [ ] グラフコンポーネントは `'use client'` で、データは親の Server Component から props で受け取る
- [ ] 週間/月間の切り替えが可能（タブまたはトグル）
- [ ] グラフは `Suspense` で囲まれている（サマリーとは独立してストリーミング）
- [ ] データがない期間は空欄またはゼロ表示
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- Recharts の `BarChart`（カロリー収支）と `LineChart`（体重推移）を使用
- カロリー収支の棒グラフ: X軸=日付、Y軸=kcal、正の値（摂取超過）と負の値（消費超過）を色分け
- 体重推移の折れ線グラフ: X軸=日付、Y軸=kg
- 週間/月間の切り替えは `'use client'` のタブコンポーネントで管理
- クエリは日別集計をSQLで行う（meals, exercises, steps の各日合計）

#### スコープ外

- 詳細な日別ドリルダウン
- グラフの印刷・エクスポート
- カスタム期間選択

---

### P3-3: AI 励ましメッセージ

**依存**: P2-2, P3-1

#### ゴール

ダッシュボードに Gemini API を使った今日のカロリー収支に基づく AI 励ましメッセージを表示する。

#### 参照ドキュメント

- `docs/spec.md` セクション5（AI励ましメッセージ機能）
- `docs/design-gemini.md`（励ましメッセージ仕様）
- `docs/design-directory.md`（Suspense 分割）

#### 受け入れ基準

- [ ] `src/features/dashboard/actions.ts` に `getMotivation` Server Action が実装されている
- [ ] `getMotivation` は `getDailySummary` の結果を `lib/gemini.ts` の `generateMotivationMessage` に渡す
- [ ] `src/features/dashboard/components/` に励ましメッセージ表示コンポーネントがある
- [ ] メッセージはダッシュボードのサマリーセクション付近に表示される
- [ ] メッセージのトーンはフレンドリーでポジティブ（決して責めない）
- [ ] Gemini API エラー時は「今日も頑張ろう！」等の固定フォールバックメッセージが表示される
- [ ] メッセージ表示は `Suspense` で囲まれている（サマリーやグラフとは独立してストリーミング）
- [ ] ローディング中はスケルトンまたはプレースホルダーが表示される
- [ ] `npm run lint && npm run build` が通る

#### 技術メモ

- `getMotivation` は読み取り専用だが、Gemini API を呼ぶため Server Action（または Server Component 内で直接呼び出し）として実装
- `revalidatePath` は不要（保存を伴わない）
- キャッシュなし（毎回生成）
- `Suspense` で独立させることで、API 遅延がダッシュボード全体のレンダリングをブロックしない
- フォールバックメッセージは配列からランダムに選んでもよい

#### スコープ外

- メッセージの履歴保存
- メッセージの再生成ボタン
- メッセージのカスタマイズ設定

---

## 依存関係まとめ

```
P0-1 プロジェクトセットアップ
├── P0-2 DBスキーマ & マイグレーション
│   ├── P1-1 プロフィール設定画面
│   ├── P1-2 カロリー計算ロジック + テスト
│   │   ├── P2-4 運動入力
│   │   └── P2-5 歩数入力
│   ├── P1-3 体重記録画面 (+ P0-3)
│   ├── P2-1 食事手動入力 (+ P0-3)
│   └── P2-4, P2-5 (+ P0-3, P1-2)
├── P0-3 共通レイアウト & ナビゲーション
└── P2-2 Gemini API連携

P2-3 食事AIモード ← P2-1, P2-2

P3-1 ダッシュボード ← P1-1, P1-2, P1-3, P2-1, P2-4, P2-5
├── P3-2 週間・月間推移グラフ
└── P3-3 AI励ましメッセージ ← P2-2
```

## 並列実行ガイド

| Phase | 並列可能なグループ | 前提 |
|-------|-------------------|------|
| Phase 0 | P0-2, P0-3 | P0-1 完了後 |
| Phase 1 | P1-1, P1-2, P1-3 | P0-2, P0-3 完了後 |
| Phase 2 | P2-1, P2-2 / P2-4, P2-5 | Phase 1 完了後 |
| Phase 3 | P3-2, P3-3 | P3-1 完了後 |
