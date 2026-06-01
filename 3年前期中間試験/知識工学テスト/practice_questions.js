const practiceQuestions = [
  {
    id: "pq_1",
    category: "ai_terms",
    title: "対策問1 知識工学の目的",
    question: "知識工学 (Knowledge Engineering) とは、人間の「何」をコンピュータシステムに埋め込むことで、より高い機能や保守性を実現する工学的アプローチか？漢字2文字で記述しなさい。",
    type: "text",
    answer: "知識",
    explanation: "知識工学は、人間が持つ「知識」をコンピュータに表現・埋め込み、知的な処理を行わせるアプローチです。"
  },
  {
    id: "pq_2",
    category: "ai_terms",
    title: "対策問2 チューリングテストの提案者",
    question: "別の場所にいる人間がコンピュータと会話をし、相手がコンピュータと見抜けなければ人間と同等な知能があると考えるテストを提案した、イギリスの数学者は誰か？（カタカナで入力）",
    type: "text",
    answer: "チューリング",
    explanation: "アラン・チューリング (Alan Turing) は、人工知能の判定基準として「チューリングテスト」を提案しました。"
  },
  {
    id: "pq_3",
    category: "math",
    title: "対策問3 行列のスカラー倍と加算",
    question: "行列 C = [[1, 2], [3, 4]] と 単位行列 E = [[1, 0], [0, 1]] があるとき、行列 3C - 2E の 2行1列目の成分を求めなさい。半角数字で答えなさい。",
    type: "text",
    answer: "9",
    explanation: "Cの2行1列目の成分は 3 です。Eの2行1列目の成分は 0 です。したがって、(3 * 3) - (2 * 0) = 9 - 0 = 9 となります。"
  },
  {
    id: "pq_4",
    category: "math",
    title: "対策問4 行列式 (det) の計算",
    question: "行列 A = [[2, 5], [1, 3]] の行列式 det(A) = ad - bc の値を求めなさい。半角数字で答えなさい。",
    type: "text",
    answer: "1",
    explanation: "a=2, b=5, c=1, d=3 なので、det(A) = 2 * 3 - 5 * 1 = 6 - 5 = 1 です。"
  },
  {
    id: "pq_5",
    category: "math",
    title: "対策問5 逆行列の成分",
    question: "行列 A = [[3, 5], [1, 2]] の逆行列 A^-1 を表す行列 [[a, b], [c, d]] において、成分 b の値を求めなさい。半角の負号および数字で答えなさい。",
    type: "text",
    answer: "-5",
    explanation: "det(A) = 3 * 2 - 5 * 1 = 1。公式より A^-1 = 1/1 * [[2, -5], [-1, 3]] = [[2, -5], [-1, 3]] となります。よって、1行2列目の成分 b は -5 です。"
  },
  {
    id: "pq_6",
    category: "ml_basics",
    title: "対策問6 逆行列が存在する条件",
    question: "正方行列 A に対し逆行列 A^-1 が存在するための必要十分条件は、A の行列式 det(A) の値が「何」でないことか？半角数字で答えなさい。",
    type: "text",
    answer: "0",
    explanation: "逆行列の公式の分母に行列式 det(A) が入るため、行列式が 0 の場合は逆行列が存在しません (正則でない)。"
  },
  {
    id: "pq_7",
    category: "ml_basics",
    title: "対策問7 組合せ爆発",
    question: "問題の大きさ n に対して、取りうる状態数が指数関数的に増加し、全パターンを探索することが不可能になる現象を何というか？漢字4文字で答えなさい。",
    type: "text",
    answer: "組合せ爆発",
    explanation: "ゲームAIや経路探索などにおいて、選択肢の掛け合わせによって探索対象が爆発的に増える現象を「組合せ爆発」と呼びます。"
  },
  {
    id: "pq_8",
    category: "ml_basics",
    title: "対策問8 決定木における分岐の基準",
    question: "ID3アルゴリズムなどの決定木の学習において、分割後の「何」が最も小さくなるような属性（特徴量）を基準に分岐を作成するか？カタカナで答えなさい。",
    type: "text",
    answer: "エントロピー",
    explanation: "決定木では、データの乱雑さ（不純度）を表す「エントロピー」が最も減少する（情報利得が最大になる）属性を選んで分岐を繰り返します。"
  },
  {
    id: "pq_9",
    category: "ml_basics",
    title: "対策問9 エントロピーの計算",
    question: "ある事象が2つの状態（例：コインの表と裏）をとり、それぞれの確率が 1/2 ずつであるとき、この事象のエントロピー（平均情報量）は何ビットになるか？半角数字で答えなさい。",
    type: "text",
    answer: "1",
    explanation: "エントロピー H = - (1/2 * log2(1/2) + 1/2 * log2(1/2)) = - (1/2 * (-1) + 1/2 * (-1)) = 1 ビットとなります。最も不確実性が高い状態です。"
  },
  {
    id: "pq_10",
    category: "understanding",
    title: "対策問10 導関数の計算",
    question: "関数 y = 2x^3 + 5x^2 - 20 を x で微分して得られる導関数 dy/dx として最も適切なものを選択しなさい。",
    type: "choice",
    choices: [
      "1. 6x^2 + 10x - 20",
      "2. 6x^2 + 10x",
      "3. 2x^2 + 5x",
      "4. 6x^3 + 10x^2"
    ],
    answer: 2,
    explanation: "微分の公式 (x^n)' = n * x^(n-1) より、(2x^3)' = 6x^2、(5x^2)' = 10x、定数項 -20 は 0 になります。よって 6x^2 + 10x となります。"
  },
  {
    id: "pq_11",
    category: "understanding",
    title: "対策問11 接線の傾き",
    question: "関数 f(x) = x^2 - 3x + 2 のグラフ上の点 (3, 2) における接線の傾きを求めなさい。半角数字で答えなさい。",
    type: "text",
    answer: "3",
    explanation: "導関数 f'(x) = 2x - 3 です。点(3, 2)における傾きは x=3 を代入して、f'(3) = 2 * 3 - 3 = 3 となります。"
  },
  {
    id: "pq_12",
    category: "understanding",
    title: "対策問12 変数の名称",
    question: "タイタニックデータの決定木による生存予測において、予測の対象となる「生存したか否か(Survived)」は、機械学習モデルにおいて「何変数」と呼ばれるか？漢字4文字で答えなさい。",
    type: "text",
    answer: "目的変数",
    explanation: "予測したいターゲットとなる変数を「目的変数」、その予測のために使われる変数を「説明変数」と呼びます。"
  },
  {
    id: "pq_13",
    category: "r_prog",
    title: "対策問13 Rパッケージの読み込み",
    question: "R言語において、インストールしたパッケージ（例：rpart）を現在のセッションに読み込んで利用できるようにするために使用する関数はどれか？",
    type: "choice",
    choices: [
      "1. install.packages()",
      "2. library()",
      "3. load()",
      "4. import()"
    ],
    answer: 2,
    explanation: "Rでは、`install.packages()`でインストールしたパッケージを、`library()`関数を呼び出すことで読み込んで利用可能にします。"
  },
  {
    id: "pq_14",
    category: "r_prog",
    title: "対策問14 Rの決定木構築関数",
    question: "Rの rpart パッケージにおいて、決定木を学習・構築するために使用される関数名は何か？（すべて半角小文字）",
    type: "text",
    answer: "rpart",
    explanation: "rpartパッケージの `rpart()` 関数を使用します。引数にモデル式やデータ、手法（分類なら method='class'）を指定します。"
  },
  {
    id: "pq_15",
    category: "r_prog",
    title: "対策問15 irisデータセットの部位",
    question: "Rに標準で用意されている iris データセットにおいて、Sepal.Length や Sepal.Width の「Sepal」はアヤメのどの部位を表しているか？",
    type: "choice",
    choices: [
      "1. 花弁 (Petal)",
      "2. がく (Sepal)",
      "3. 葉 (Leaf)",
      "4. 茎 (Stem)"
    ],
    answer: 2,
    explanation: "Sepalは「がく」を表します。アヤメの分類には、がくの長さ (Sepal.Length)、がくの幅 (Sepal.Width)、花弁の長さ (Petal.Length)、花弁の幅 (Petal.Width) の4つの特徴量が用いられます。"
  },
  {
    id: "pq_16",
    category: "description",
    title: "対策問16 過学習とその対策",
    question: "機械学習モデルにおける「過学習（オーバーフィッティング）」とは何か？また、それを防ぐための評価方法を1つ挙げ、120文字以内で説明しなさい。",
    type: "description",
    charLimit: 120,
    answer: "モデルが学習データに過剰に適合し、未知のデータに対する汎化性能が低下する現象。防ぐためには、データを訓練用とテスト用に分割するホールドアウト法や交差検証法が用いられる。",
    keywords: [
      { text: "学習データ", alternative: ["訓練データ", "学習用"] },
      { text: "未知", alternative: ["テストデータ", "新しいデータ"] },
      { text: "汎化", alternative: ["予測精度", "性能"] },
      { text: "ホールドアウト", alternative: ["交差検証", "分割", "評価法"] }
    ],
    explanation: "学習データだけで完璧に正解できても、未知のデータで間違えてしまう現象を過学習と呼びます。これを評価・抑制するためにホールドアウト法や交差検証が使われます。"
  },
  {
    id: "pq_17",
    category: "description",
    title: "対策問17 決定木分析の利点",
    question: "決定木分析（Decision Tree）が他の機械学習モデル（ニューラルネットワークなど）と比較して優れている点（メリット）を、モデルの構造と説明性の観点から80文字以内で説明しなさい。",
    type: "description",
    charLimit: 80,
    answer: "学習結果がIf-Thenルールの木構造で表されるため、人間にとって直感的に理解しやすく、予測の判断根拠（説明性）が極めて高い点。",
    keywords: [
      { text: "木構造", alternative: ["If-Then", "ルール"] },
      { text: "理解", alternative: ["わかりやすい", "直感的"] },
      { text: "説明性", alternative: ["判断根拠", "ブラックボックスでない"] }
    ],
    explanation: "決定木は分岐ルールが可視化されるため、「なぜその予測結果になったのか」という説明性が高く、ブラックボックス化しにくいメリットがあります。"
  }
];

// node.jsで動く場合とブラウザで動く場合の両方に対応
if (typeof module !== 'undefined' && module.exports) {
  module.exports = practiceQuestions;
}
