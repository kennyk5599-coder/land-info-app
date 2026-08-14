# land-info-backend

住所と土地面積(坪)から、用途地域・建蔽率・容積率・建築可能概要・半径500m/過去3年の取引実績を返すバックエンドAPI。

データソース: 国土交通省「不動産情報ライブラリ」(reinfolib) の XKT002(用途地域)・XPT001(取引価格ポイント) API、および国土地理院の住所ジオコーディングAPI。

## セットアップ

```bash
npm install
cp .env.example .env   # REINFOLIB_API_KEY を設定
npm run dev
```

## エンドポイント

- `GET /api/health`
- `GET /api/geocode?address=...`
- `POST /api/land-info` — body: `{ "address": "...", "areaTsubo": 30 }` または `{ "lat": ..., "lng": ..., "areaTsubo": 30 }`

## テスト

```bash
npm test
```
