import { Link } from "wouter";

export default function Manual() {
  return (
    <div className="min-h-screen p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-bold">作業マニュアル</h1>
        <p className="text-sm text-muted-foreground">
          ここではアプリの基本的な使い方を説明します。
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">在庫の確認</h2>
        <p>
          ダッシュボードでは現在の在庫状況をグラフで確認できます。低在庫のアラートにも注意してください。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">音声入力</h2>
        <p>
          画面下部のマイクボタンを押すと音声入力モードになります。音声で商品情報を追加・更新できます。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">ロケーションの変更</h2>
        <p>
          ヘッダーの倉庫名をクリックすると、拠点の変更ができます。
        </p>
      </section>

      <div>
        <Link href="/">
          <a className="text-blue-500 underline">ホームに戻る</a>
        </Link>
      </div>
    </div>
  );
}
