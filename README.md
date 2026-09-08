# しゅな太郎の穴ぐら暮らし

Three.js + Vite の小さな3Dドールハウス。外部3Dモデルや画像を必要とせず、丸い造形と木目をプログラムで生成します。主人公の名前は「しゅな太郎」に統一しています。

## GitHubにアップロードしてAndroid APKを作る

パソコンにAndroid Studio・Java・pnpmをインストールしなくても、GitHub ActionsがAPKを作ります。GitHubのリポジトリは自分で作成してください。

1. このプロジェクトの中身を、リポジトリのルートにアップロードしてcommit/pushします。`package.json` と `.github` がリポジトリの最上位にある構成にしてください。
2. リポジトリの **Actions → Build Android APK** を開きます。pushごとに自動実行されます。Actionsの有効化を求められた場合は有効にしてください。
3. 緑のチェックが付いた実行を開き、下の **Artifacts → shunataro-android-apk** をダウンロードします。GitHubへのログインが必要です。
4. ZIPを展開し、中の **shunataro.apk** をAndroid端末に渡して開きます。インストール時に求められたら、そのファイルを開いたアプリについて「不明なアプリのインストール」を許可します。

再生成はpush、または **Actions → Build Android APK → Run workflow** で行えます。手動実行ボタンはこのワークフローがデフォルトブランチに入ると使えます。APKの保存期間は30日です。

### アップロードするもの

`src/`、`tests/`、`scripts/`、`android/`、**`.github/workflows/android-apk.yml`**、`.gitignore`、`index.html`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`vite.config.js`、`README.md` を含めます。`.github` は隠しフォルダとして見落としやすいので注意してください。

`node_modules/`、`.pnpm-store/`、`dist/`、`.git/`、Androidの `build/` はアップロード不要です。GitまたはGitHub Desktopからpushすると `.gitignore` に従って除外されます。Web画面にプロジェクトフォルダを丸ごとドラッグして、余分な親フォルダを作らないでください。

### APKについて

- Android 8.0以降、WebGL2が使えるAndroid System WebViewが必要です。
- お部屋・家具・動作・UIをAPKに同梱します。サーバーやインターネット接続は不要です。APKではAndroid内蔵の日本語フォントを使います。
- 生成するのは個人利用向けの **署名済みdebug APK** です。Secretsの設定は不要です。
- 同じ署名で更新しやすいようdebug署名鍵をActionsのキャッシュに保存します。キャッシュ削除・期限切れ・別ブランチでの初回生成などで鍵が変わった場合は、古いアプリをアンインストールしてから入れ直してください。キャッシュによる署名の永続性は保証されません。Google Play公開用の署名設定は含めていません。
- Android用コードは `android/`、自動生成手順は `.github/workflows/android-apk.yml` です。リポジトリ名や所有者名をコードに書く必要はありません。

ローカルでAndroidをビルドする場合は、JDK 17・Gradle 8.11.1・Android SDK 35を用意し、Webビルド後に次を実行します（CIでは自動実行）。

```sh
pnpm build
node scripts/prepare-android.mjs
gradle -p android assembleDebug lintDebug
```

Androidのローカルコンテンツ表示は [WebViewAssetLoaderの公式ガイド](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content) に沿い、ビルド環境は [AGP 8.9の互換構成](https://developer.android.com/build/releases/agp-8-9-0-release-notes) に合わせています。

## ローカル起動

Node.js 22.12以上（または20.19以上）とpnpmを用意して実行します。

```sh
pnpm install
pnpm dev
```

表示されたローカルURLを開きます。保存するとViteがホットリロードします。

```sh
pnpm test
pnpm build
pnpm preview
```

`dist/` が静的配信用ファイルです。npmを使う場合も `npm install`、`npm run dev` で起動できます。

## 操作

- おまかせ：料理・ごはん・読書・昼寝・掃除を自動で繰り返します。
- 家具のクリック、または下部のボタン：指定の行動を一回行います。その後は待機します。「おまかせ」で自動生活に戻ります。
- ドラッグ／タッチ：視点回転。ホイール／ピンチ／＋−：ズーム。家のボタン：視点リセット。
- 一時停止／再開：移動と動作を停止・再開。視点操作は停止中も可能。ボタンにフォーカスがないときはスペースキーも使えます。

## 構造と追加方法

- `src/world/furniture.js`：家具の見た目、クリックID、歩行到達点、向き。
- `src/behavior.js`：行動一覧、時間、自動選択、歩行と待機の状態機械。
- `src/character.js`：犬のパーツ、持ち物、耳・しっぽ・口・手足のアニメーション。
- `src/world/room.js`：床・壁・照明・装飾。
- `src/world/primitives.js`：丸い形状、マテリアル、木目テクスチャ。
- `src/main.js`：レンダラー、カメラ、クリック判定、日本語UI。

家具を追加するときは `createFurniture` に一意のIDと到達点を登録し、`ACTIONS` に同じIDと行動時間を追加します。下部の行動ボタンは自動で追加されます。専用アニメーションは `animateDog` に追加してください。到達点は家具の外側に置きます。歩行は中央の通路を経由する簡易方式で、任意形状の障害物に対する経路探索ではありません。

WebGL2対応ブラウザが必要です。日本語フォントはGoogle Fontsから読み込み、オフラインではシステムのsans-serifにフォールバックします。3Dデータはすべてローカルで生成します。
