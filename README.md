# dviewer — IIIF Viewer (MVP)

IIIF Presentation API (v2 / v3) のマニフェストを読み込み、ページ送り・ディープズーム・ビューポート表示を行うビューアです。

- **一覧画面** `/` — `public/data/manifests.csv` を読み込み、カード / テーブル表示を切替。ページング（12・24・48 件）、絞り込み検索、任意 URL を直接開く。
  表示形式・ページ・件数・検索語は URL（`/?view=table&page=2&size=24&q=…`）と localStorage に保持され、ビューアから戻っても（ブラウザの戻る・ロゴ・「一覧へ戻る」のいずれでも）復元されます。
- **ビューア画面** `/viewer?manifest=<URL>&page=<N>` — サムネイル一覧、ページ移動、拡大・縮小・回転・全画面、ナビゲーター（ミニマップ）と表示領域の座標表示、メタデータパネル

## 技術スタック

| 用途 | 採用 |
| --- | --- |
| フレームワーク | React 19 + TypeScript + Vite |
| デザインシステム | [Fluent 2](https://fluent2.microsoft.design/) — `@fluentui/react-components` (v9) / `@fluentui/react-icons` |
| ディープズーム | OpenSeadragon（IIIF Image API の `info.json` をタイルソースとして使用、サービスがない場合は静的画像） |
| ルーティング | react-router-dom（ページ番号は URL に保持 → 共有・リロード可） |
| CSV | papaparse |
| テスト | Vitest + Testing Library（jsdom） |

## 使い方

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # ユニット / コンポーネントテスト
npm run coverage   # カバレッジ（閾値 80%）
npm run typecheck
npm run lint
npm run build && npm run preview
```

### キーボード操作（ビューア）

| キー | 操作 |
| --- | --- |
| ← / → / PageUp / PageDown | 前 / 次のページ |
| Home / End | 最初 / 最後のページ |
| + / - / 0 | 拡大 / 縮小 / 全体表示（回転リセット） |
| r | 右に 90° 回転 |
| f | 全画面切替 |

## テストデータ（`public/data/manifests.csv`）

| 列 | 必須 | 説明 |
| --- | --- | --- |
| `id` | | 一意な ID（省略時は `row-N`） |
| `title` | ✓ | 表示タイトル |
| `provider` | | 所蔵機関 |
| `manifestUrl` | ✓ | マニフェスト URL（http/https のみ） |
| `iiifVersion` | | `2` または `3` |
| `description` | | 説明 |
| `tags` | | `;` 区切り |

> 値にカンマを含む場合は必ずダブルクォートで囲んでください。不正な行はスキップされ、画面上に警告が表示されます。

同梱データ（32 件）：国立国会図書館 16 件（錦絵・画帖・510 画像の図書など）、Wellcome Collection 4 件、IIIF Cookbook 6 件（静的画像・右→左・巻物・多言語ラベルなど）、Stanford（v2/v3 同一資料）、京都大学、Bodleian、国文学研究資料館、東京大学。
外部サーバーはブラウザから直接取得するため、**CORS を許可しているサーバー**のマニフェストのみ表示できます。

## アーキテクチャ

```
src/
├── domain/          # 純粋関数（React 非依存・テスト容易）
│   ├── types.ts         正規化後のモデル（ManifestEntry / NormalizedManifest / CanvasPage …）
│   ├── manifest.ts      Presentation v2/v3 → NormalizedManifest
│   ├── iiifImage.ts     Image API サービス検出・サムネイル URL 生成
│   ├── language.ts      言語マップ → 表示テキスト（ja > en > none、HTML 除去）
│   ├── catalogCsv.ts    CSV のパースと行単位バリデーション
│   ├── viewer.ts        タイルソース変換・ページ番号・表示領域計算
│   └── url.ts           http(s) 以外の URL を拒否
├── services/        # I/O（fetch、Repository）
├── hooks/           # useManifest / useCatalog / usePageNavigation / useFullscreen …
└── components/      # Atomic Design
    ├── atoms/          IconButton, Thumbnail, VersionBadge, LoadingState, BackToCatalogButton
    ├── molecules/      ManifestCard, PageNavigator, ZoomControls, ViewportStatus, UrlOpenForm …
    ├── organisms/      AppHeader, ManifestGallery, ThumbnailPanel, ViewerToolbar, MetadataPanel, DeepZoomViewer
    ├── templates/      CatalogTemplate, ViewerTemplate（レイアウトのみ）
    └── pages/          CatalogPage, ViewerPage / ViewerScreen, NotFoundPage
```

- 外部データ（マニフェスト JSON・CSV）は `unknown` として受け取り、`domain/` で検証・正規化してから UI に渡します。
- `DeepZoomViewer` は OpenSeadragon を含むため barrel（`organisms/index.ts`）から再エクスポートせず、ビューア画面は遅延読み込みしています。
- スタイルは Fluent の `makeStyles` + デザイントークン（`tokens.*`）のみを使用し、OS のダーク/ライト設定に追従します。

## 既知の制限（MVP）

- IIIF Collection、Range（目次）、アノテーション表示、見開き表示、A/V は未対応
- 認証付き（IIIF Auth）リソースは未対応
