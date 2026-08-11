# kakeikanri（家計管理ツール）

個人のローカル環境で動かす家計管理 Web アプリ。収支の記録・分類、予算管理・アラート、資産推移の可視化を行う。

## 技術スタック

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Prisma](https://www.prisma.io/) + SQLite（ローカルファイル DB）
- Tailwind CSS
- Recharts（グラフ）

## セットアップ

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

## 機能

- **収支の記録・分類**: 取引を日付・金額・種別・カテゴリ・メモで記録し、月ごとに一覧・集計
- **予算管理・アラート**: カテゴリごとに月次予算を設定し、使用率と超過をアラート表示
- **資産推移の可視化**: 口座ごとの残高を記録し、純資産の推移をグラフで確認
