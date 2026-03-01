# 状態管理 / データフェッチ方針

## Server Components / Client Components の境界

- **Server Component がデフォルト**
- `'use client'` は **最小の葉コンポーネントのみ** に限定する（バンドル肥大を防ぐ）
- Client Component 対象: フォーム、グラフ（Recharts）、トグル切替などインタラクションがあるもの

## Server Actions

- `features/*/actions.ts` に 1アクション = 1関数で定義
- フォームからの呼び出しは `useActionState` を基本とする
- 非フォーム操作（即時トグル等）は `useTransition` + action 直接呼び出しを許可

## 更新後の再検証

- 各 Server Action 成功時に、影響する画面へ **`revalidatePath`** を必ず実行する
- 例: `saveMeal` 成功 → `revalidatePath('/')` + `revalidatePath('/meals')`

### `revalidatePath` 対象一覧

| Action | 再検証パス | 理由 |
|---|---|---|
| `saveMeal` | `/`, `/meals` | ダッシュボード集計と食事一覧が更新されるため |
| `saveExercise` | `/`, `/exercise` | ダッシュボード収支と運動一覧が更新されるため |
| `saveSteps` | `/`, `/exercise` | ダッシュボード収支と歩数表示が更新されるため |
| `saveWeight` | `/`, `/weight` | 体重推移とBMR関連表示に影響するため |
| `updateProfile` | `/`, `/settings` | BMR計算に使うプロフィール情報が変わるため |
| `getMotivation` | なし | 保存を伴わない読み取り処理のため |

- 1つの Action が複数画面に影響する場合、**影響先を漏れなく列挙**する
- パス追加時はこの表を同時更新してドキュメントを最新化する

## データフェッチのキャッシュ方針

- **キャッシュなし（毎回クエリ）** で統一
- 自分専用でアクセス頻度が低いためパフォーマンス問題にならない
- 励ましメッセージも毎回生成（design-gemini.md 参照）

### 動的レンダリングの強制

- クエリ関数の先頭で **`import { unstable_noStore as noStore } from 'next/cache'`** → `noStore()` を呼び出す
- これによりページが静的生成されず、常に最新データを取得する
- 全ページ（`/`, `/meals`, `/exercise`, `/weight`, `/settings`）が対象

## 未登録データ時の挙動

- **プロフィール未登録**: ダッシュボード・各入力画面で「先にプロフィールを設定してください」を表示し、`/settings` へ誘導する。カロリー計算は行わない
- **体重未登録（当日）**: 直近の体重記録を BMR 計算に使用する。体重記録が1件もない場合はプロフィール未登録と同様に設定を促す

## フォームバリデーション

- **Zod** を使う（`features/*/schemas.ts` に定義）
- **クライアント側**: フォーム送信前にバリデーション（UX向上）
- **サーバー側**: actions.ts で再検証（信頼できないクライアント入力に備える）
- react-hook-form 等の追加ライブラリは不要
