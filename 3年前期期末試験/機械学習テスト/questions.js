const questions = [
  // ==========================================
  // 【過去問モード (source: "kakomon")】 (問1 〜 問21)
  // ==========================================
  {
    id: "q1",
    category: "theory",
    source: "kakomon",
    title: "過去問 大問1 (1). 尤度と最尤推定 [穴埋め]",
    question: "<p>統計モデルと言葉の定義に関する以下の文章の空欄 [ ア ], [ イ ] に当てはまる語句を選択肢から選んで穴埋めしなさい。</p>" +
              "<div class=\"fill-blanks-text\">" +
              "ある特定の観測値 $t_n$ が正規分布に従っているとき、一連の観測データセット $\\{ (x_n, t_n) \\}_{n=1}^N$ が得られる確率を、近似的なモデル式のパラメータの関数とみなしたものを<strong>[ ア ]</strong>と呼びます。そして、この確率が最大になるようにパラメータを決定する手法を<strong>[ イ ]</strong>と呼びます。" +
              "</div>",
    type: "fill_blanks",
    choices: [
      "1. 最小二乗法", "2. 最尤推定法", "3. 2次関数", "4. 尤度関数", "5. 共起分析"
    ],
    blanks: [
      { id: "a", label: "[ ア ] (関数の名称)", answer: 4 }, // 尤度関数
      { id: "b", label: "[ イ ] (推定手法)", answer: 2 }  // 最尤推定法
    ],
    explanation: "モデルのパラメータを決定する際の基本語彙です。<br>" +
                 "・<strong>尤度関数 (Likelihood function)</strong>: パラメータを入力とし、そのパラメータのもとで現在のデータ群が観測される確率の「もっともらしさ」を表す関数です。<br>" +
                 "・<strong>最尤推定法 (Maximum Likelihood Estimation)</strong>: 尤度関数を最大化するパラメータを推定値として採用する、統計学の標準的な手法です。"
  },
  {
    id: "q2",
    category: "theory",
    source: "kakomon",
    title: "過去問 大問1 (2). 推定量の性質 [穴埋め]",
    question: "<p>推定量に関する以下の文章の空欄 [ ア ] 〜 [ ウ ] に当てはまる語句を選択肢から選んで穴埋めしなさい。</p>" +
              "<div class=\"fill-blanks-text\">" +
              "観測するデータ数 $N$ を極限まで大きくすることで、推定値が真の値に近づいていく性質を<strong>[ ア ]</strong>と呼びます。また、<strong>[ イ ]</strong>を元に母平均や母分散を推測するとき、その<strong>[ イ ]</strong>の期待値が母平均や母分散（真の値）に完全に一致する性質を<strong>[ ウ ]</strong>と言います。" +
              "</div>",
    type: "fill_blanks",
    choices: [
      "1. 一致性", "2. ハフマン符号化", "3. 不偏性", "4. 勾配法", "5. 推定量"
    ],
    blanks: [
      { id: "a", label: "[ ア ] (極限の性質)", answer: 1 }, // 一致性
      { id: "b", label: "[ イ ] (推測に用いる変数)", answer: 5 }, // 推定量
      { id: "c", label: "[ ウ ] (期待値が一致する性質)", answer: 3 }  // 不偏性
    ],
    explanation: "推定量の望ましい性質（評価基準）に関する言葉の定義です。<br>" +
                 "・<strong>一致性 (Consistency)</strong>: サンプル数 $N \\to \\infty$ で、推定量が真のパラメータ値に確率収束する性質です。<br>" +
                 "・<strong>推定量 (Estimator)</strong>: 母数を推定するための標本データの関数（平均 $\\bar{X}$ など）です。<br>" +
                 "・<strong>不偏性 (Unbiasedness)</strong>: 推定量の期待値（平均値）が真のパラメータ値に等しくなる性質です。例えば、不偏分散は期待値が母分散に一致するように分母を $N-1$ にします。"
  },
  {
    id: "q3",
    category: "theory",
    source: "kakomon",
    title: "過去問 大問1 (3). 漸化式と反復法 [穴埋め]",
    question: "<p>数値計算法に関する以下の文章の空欄 [ ア ], [ イ ] に当てはまる語句を選択肢から選んで穴埋めしなさい。</p>" +
              "<div class=\"fill-blanks-text\">" +
              "$x_0, x_1, x_2, \\dots$ のような数列において、$x_{k+1} = g(x_k)$ のように次の項を発生するための数式を<strong>[ ア ]</strong>といいます。また、$x_{k+1} = g(x_k)$ によって順次生成される値がある値 $\\alpha$ に収束すれば、$\\alpha$ は非線形方程式 $x = g(x)$ の解であるという原理の解法を<strong>[ イ ]</strong>といいます。" +
              "</div>",
    type: "fill_blanks",
    choices: [
      "1. 漸化式", "2. 特徴変数", "3. 反復法", "4. 目的関数", "5. クラスタリング"
    ],
    blanks: [
      { id: "a", label: "[ ア ] (数式の種類)", answer: 1 }, // 漸化式
      { id: "b", label: "[ イ ] (解法の総称)", answer: 3 }  // 反復法
    ],
    explanation: "非線形方程式の数値解法（二分法やニュートン法、固定値反復法など）の定義です。<br>" +
                 "・<strong>漸化式 (Recurrence relation)</strong>: 前の項から次の項を計算する定義式です。<br>" +
                 "・<strong>反復法 (Iterative method)</strong>: 適当な初期値から漸化式を繰り返し計算し、極限として解を近似するアルゴリズムの総称です。"
  },
  {
    id: "q4",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問2 (1). 最尤推定の手順: モデル式 [選択式]",
    question: "<p>あるデータ $t$ が平均 $\\mu$、標準偏差 $\\sigma$ の正規分布に従っていると仮定する。このとき、特定の1つの観測データ $t = t_n$ が得られる確率（確率密度）を表す正しいモデル式を選択肢から選びなさい。</p>",
    type: "choice",
    choices: [
      "1. N(t_n) = -\\frac{N}{2}\\ln(2\\pi\\sigma^2) - \\frac{(t_n - \\mu)^2}{2\\sigma^2}",
      "2. p(t_n | \\mu, \\sigma^2) = \\frac{1}{2\\pi\\sigma^2} \\exp\\left( -\\frac{(t_n - \\mu)^2}{2\\sigma^2} \\right)",
      "3. p(t_n | \\mu, \\sigma^2) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left( -\\frac{(t_n - \\mu)^2}{2\\sigma^2} \\right)",
      "4. p(t_n | \\mu, \\sigma^2) = (2\\pi\\sigma^2)^{-1/2} (t_n - \\mu)^2"
    ],
    answer: 3,
    explanation: "正規分布（ガウス分布）の確率密度関数 $N(t_n | \\mu, \\sigma^2)$ の定義です：<br>" +
                 "$$p(t_n | \\mu, \\sigma^2) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left( -\\frac{(t_n - \\mu)^2}{2\\sigma^2} \\right)$$<br>" +
                 "標準偏差が $\\sigma$ のため、分散は $\\sigma^2$ となり、ルートの前に $\\sqrt{2\\pi\\sigma^2}$ が分母に入ります。"
  },
  {
    id: "q5",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問2 (2). 最尤推定の手順: 尤度関数 [選択式]",
    question: "<p>互いに独立に観測された $N$ 個のデータ群 $t = \\{t_1, t_2, \\dots, t_N\\}$ が得られる確率（尤度関数 $P$）を表す式を選択肢から選びなさい。</p>",
    type: "choice",
    choices: [
      "1. P = \\prod_{n=1}^{N} \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left( -\\frac{(t_n - \\mu)^2}{2\\sigma^2} \\right)",
      "2. P = \\sum_{n=1}^{N} \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left( -\\frac{(t_n - \\mu)^2}{2\\sigma^2} \\right)",
      "3. P = \\left( \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\right)^N \\sum_{n=1}^{N} \\exp\\left( -\\frac{(t_n - \\mu)^2}{2\\sigma^2} \\right)",
      "4. P = \\frac{N}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left( -\\sum_{n=1}^{N} \\frac{(t_n - \\mu)^2}{2\\sigma^2} \\right)"
    ],
    answer: 1,
    explanation: "各データが独立に得られると仮定（i.i.d.仮定）するため、データ群全体の尤度関数 $P$ は、各データの確率密度関数の<strong>総乗（掛け算の積 $\\prod$）</strong>として表されます：<br>" +
                 "$$P = \\prod_{n=1}^{N} p(t_n | \\mu, \\sigma^2)$$"
  },
  {
    id: "q6",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問2 (3). 最尤推定の手順: 対数尤度関数 [選択式]",
    question: "<p>尤度関数 $P$ の自然対数をとった対数尤度関数 $\\ln P$ を求めなさい。ただし、計算の簡略化のため、分散の逆数 $\\beta = \\frac{1}{\\sigma^2}$ を使用して表すものとします。</p>",
    type: "choice",
    choices: [
      "1. \\ln P = \\frac{N}{2}\\ln\\beta - \\frac{N}{2}\\ln(2\\pi) - \\frac{\\beta}{2}\\sum_{n=1}^{N}(t_n - \\mu)^2",
      "2. \\ln P = N\\ln\\beta - \\frac{N}{2}\\ln(2\\pi) - \\beta\\sum_{n=1}^{N}(t_n - \\mu)",
      "3. \\ln P = \\frac{N}{2}\\ln\\beta - N\\ln(2\\pi) - \\frac{\\beta}{2}\\sum_{n=1}^{N}(t_n - \\mu)",
      "4. \\ln P = \\frac{N}{2}\\ln\\beta + \\frac{N}{2}\\ln(2\\pi) + \\frac{\\beta}{2}\\sum_{n=1}^{N}(t_n - \\mu)^2"
    ],
    answer: 1,
    explanation: "尤度関数の両辺の自然対数 $\\ln$ をとると、積 $\\prod$ が和 $\\sum$ になり、指数関数の肩 $\\exp(x)$ がそのまま外に出ます：<br>" +
                 "$$P = \\left(\\frac{\\beta}{2\\pi}\\right)^{N/2} \\exp\\left( -\\frac{\\beta}{2} \\sum_{n=1}^{N} (t_n - \\mu)^2 \\right)$$<br>" +
                 "$$\\ln P = \\ln\\left[ \\left(\\frac{\\beta}{2\\pi}\\right)^{N/2} \\right] - \\frac{\\beta}{2} \\sum_{n=1}^{N} (t_n - \\mu)^2$$<br>" +
                 "$$\\ln P = \\frac{N}{2}\\ln\\beta - \\frac{N}{2}\\ln(2\\pi) - \\frac{\\beta}{2}\\sum_{n=1}^{N}(t_n - \\mu)^2$$"
  },
  {
    id: "q7",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問2 (4). 最尤推定の手順: 最尤平均 [選択式]",
    question: "<p>対数尤度関数 $\\ln P$ を最大化する平均 $\\mu$ の最尤推定量 $\\mu_{ML}$ を表す式を選択しなさい。</p>",
    type: "choice",
    choices: [
      "1. \\mu_{ML} = \\sum_{n=1}^{N} t_n",
      "2. \\mu_{ML} = \\frac{1}{N} \\sum_{n=1}^{N} t_n",
      "3. \\mu_{ML} = \\frac{1}{N-1} \\sum_{n=1}^{N} t_n",
      "4. \\mu_{ML} = \\frac{1}{N} \\sum_{n=1}^{N} (t_n - \\sigma)^2"
    ],
    answer: 2,
    explanation: "対数尤度関数 $\\ln P$ を $\\mu$ で偏微分して $0$ と置くことで求まります：<br>" +
                 "$$\\frac{\\partial \\ln P}{\\partial \\mu} = \\beta \\sum_{n=1}^{N} (t_n - \\mu) = 0 \\Rightarrow \\sum_{n=1}^{N} t_n - N\\mu = 0 \\Rightarrow \\mu_{ML} = \\frac{1}{N}\\sum_{n=1}^{N} t_n$$<br>" +
                 "これは標本の算術平均（標本平均）に一致します。"
  },
  {
    id: "q8",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問2 (5). 最尤推定の手順: 最尤分散 [選択式]",
    question: "<p>対数尤度関数 $\\ln P$ を最大化する分散 $\\sigma^2$ の最尤推定量 $\\sigma^2_{ML}$ を表す式を選択しなさい。</p>",
    type: "choice",
    choices: [
      "1. \\sigma^2_{ML} = \\frac{1}{N-1} \\sum_{n=1}^{N} (t_n - \\mu)^2",
      "2. \\sigma^2_{ML} = \\frac{1}{N} \\sum_{n=1}^{N} (t_n - \\mu)",
      "3. \\sigma^2_{ML} = \\frac{1}{N} \\sum_{n=1}^{N} (t_n - \\mu)^2",
      "4. \\sigma^2_{ML} = \\sqrt{ \\frac{1}{N} \\sum_{n=1}^{N} (t_n - \\mu)^2 }"
    ],
    answer: 3,
    explanation: "対数尤度関数を $\\beta$ で偏微分して $0$ と置くことで求まります：<br>" +
                 "$$\\frac{\\partial \\ln P}{\\partial \\beta} = \\frac{N}{2\\beta} - \\frac{1}{2}\\sum_{n=1}^{N}(t_n - \\mu)^2 = 0 \\Rightarrow \\frac{1}{\\beta} = \\sigma^2_{ML} = \\frac{1}{N}\\sum_{n=1}^{N}(t_n - \\mu)^2$$<br>" +
                 "※なお、最尤推定量としての分散は分母が $N$ になりますが、これは不偏性を満たさない（期待値が母分散より小さく見積もられる）ため、不偏分散にする場合は分母を $N-1$ にします。"
  },
  {
    id: "q9",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問2 コイン(1). コインの尤度関数 [選択式]",
    question: "<p>表が出る確率が $p$ であるようなコインがある。このコインを 100 回投げたら 70 回表が出た。このときの尤度関数 $P(p)$ を表す式を選択肢から選びなさい。</p>",
    type: "choice",
    choices: [
      "1. P(p) = {}_{100}\\mathrm{C}_{70} p^{30} (1-p)^{70}",
      "2. P(p) = {}_{100}\\mathrm{C}_{70} (1-p)^{100}",
      "3. P(p) = {}_{100}\\mathrm{C}_{70} p^{70} (1-p)^{30}",
      "4. P(p) = p^{70} (1-p)^{30}"
    ],
    answer: 3,
    explanation: "100回のうち70回表（確率 $p$）が出て、残りの30回は裏（確率 $1-p$）が出る二項分布の確率質量関数が尤度関数になります：<br>" +
                 "$$P(p) = {}_{100}\\mathrm{C}_{70} p^{70} (1-p)^{30}$$"
  },
  {
    id: "q10",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問2 コイン(2). 対数尤度関数 [選択式]",
    question: "<p>上記の尤度関数 $P(p) = {}_{100}\\mathrm{C}_{70} p^{70} (1-p)^{30}$ について、対数尤度関数 $\\log P(p)$ を表す正しい式を選択肢から選びなさい。</p>",
    type: "choice",
    choices: [
      "1. \\log P(p) = 100 \\log {}_{100}\\mathrm{C}_{70} + 70\\log p + 30\\log(1-p)",
      "2. \\log P(p) = 70\\log p + 30\\log(1-p) + \\log {}_{100}\\mathrm{C}_{70}",
      "3. \\log P(p) = 70\\log p - 30\\log(1-p)",
      "4. \\log P(p) = 70\\log(1-p) + 30\\log p"
    ],
    answer: 2,
    explanation: "積の対数を和に展開します：<br>" +
                 "$$\\log P(p) = \\log\\left( {}_{100}\\mathrm{C}_{70} \\cdot p^{70} \\cdot (1-p)^{30} \\right)$$" +
                 "$$= \\log {}_{100}\\mathrm{C}_{70} + \\log(p^{70}) + \\log((1-p)^{30})$$" +
                 "$$= 70\\log p + 30\\log(1-p) + \\log {}_{100}\\mathrm{C}_{70}$$"
  },
  {
    id: "q11",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問2 コイン(3). 最尤推定値の算出 [選択式]",
    question: "<p>対数尤度関数を最大にする、最も確からしいコインの表が出る確率 $p$ の推定値を求めなさい。</p>",
    type: "choice",
    choices: [
      "1. 0.3", "2. 0.5", "3. 0.9", "4. 0.1", "5. 0.7"
    ],
    answer: 5,
    explanation: "対数尤度関数 $\\log P(p) = 70\\log p + 30\\log(1-p) + C$ を $p$ で微分して $0$ と置きます：<br>" +
                 "$$\\frac{d \\log P}{d p} = \\frac{70}{p} - \\frac{30}{1-p} = 0$$" +
                 "$$70(1-p) = 30p \\Rightarrow 70 - 70p = 30p \\Rightarrow 100p = 70 \\Rightarrow p = 0.7$$"
  },
  {
    id: "q12",
    category: "optimization",
    source: "kakomon",
    title: "過去問 大問3 (1). 勾配ベクトルの計算 [穴埋め]",
    question: "<p>多変数関数 $f(x, y) = 2(x^2 + 3y^2)$ について、点 $(x, y) = (3, 3)$ における勾配ベクトル $\\nabla f = \\left( \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y} \\right)$ の各成分を求めなさい。</p>",
    type: "fill_blanks",
    choices: [
      "1. 6", "2. 12", "3. 18", "4. 36", "5. 2", "6. 3"
    ],
    blanks: [
      { id: "a", label: "x方向の勾配 df/dx", answer: 2 }, // 12
      { id: "b", label: "y方向の勾配 df/dy", answer: 4 }  // 36
    ],
    explanation: "関数をそれぞれの変数で偏微分します：<br>" +
                 "・$\\frac{\\partial f}{\\partial x} = 2 \\times 2x = 4x$<br>" +
                 "・$\\frac{\\partial f}{\\partial y} = 2 \\times 6y = 12y$<br>" +
                 "点 $(3, 3)$ を代入すると：<br>" +
                 "・$x$方向の偏微分値: $4 \\times 3 = 12$<br>" +
                 "・$y$方向の偏微分値: $12 \\times 3 = 36$<br>" +
                 "よって勾配ベクトルは $(12, 36)$ となります。"
  },
  {
    id: "q13",
    category: "optimization",
    source: "kakomon",
    title: "過去問 大問3 (2) 二分法①. 反復回数判定 [選択式]",
    question: "<p>二分法を使って $\\sqrt{2}$ の解（$f(x) = x^2 - 2 = 0$ の正の根）を小数点以下1ケタまで正しい値で求めるにあたり、初期の探索区間を $[1, 2]$ とする。</p>" +
              "<p>推定誤差を $0.1$ 以内にするために必要な最小の反復回数を選択肢から選びなさい。ただし、$\\log_{10} 2 = 0.3$ として計算すること。</p>",
    type: "choice",
    choices: [
      "1. 2回以上", "2. 3回以上", "3. 4回以上", "4. 1回以上", "5. 5回以上"
    ],
    answer: 3,
    explanation: "初期の探索区間 $[a, b] = [1, 2]$ の幅は $W_0 = b - a = 1$ です。<br>" +
                 "1回反復するごと区間幅は半分になるため、$k$ 回反復後の幅は $W_k = W_0 \\times (1/2)^k = (1/2)^k$ になります。<br>" +
                 "誤差幅を $0.1$ 以下にするためには：<br>" +
                 "$$\\left(\\frac{1}{2}\\right)^k \\le 0.1 \\Rightarrow 2^k \\ge 10$$<br>" +
                 "$2^3 = 8 < 10$、$2^4 = 16 \\ge 10$ より、最小でも <strong>4回以上</strong> の反復が必要になります。"
  },
  {
    id: "q14",
    category: "optimization",
    source: "kakomon",
    title: "過去問 大問3 (2) 二分法②. 最終調査区間 [選択式]",
    question: "<p>上記の条件（初期探索区間 $[1, 2]$）において、二分法を最小必要回数（4回）実行したときの最終的な調査区間を選択肢から選びなさい。</p>",
    type: "choice",
    choices: [
      "1. [1, 1.5]",
      "2. [2, 3]",
      "3. [1.1243, 1.3305]",
      "4. [1.375, 1.4375]",
      "5. [1.25, 1.5]"
    ],
    answer: 4,
    explanation: "反復ごとの区間変化を追います（中点を $m$、境界における $f(x)=x^2-2$ の符号で絞り込みます）：<br>" +
                 "・初期: $[1, 2]$, 中点 $m=1.5$. $f(1.5) = 0.25 > 0$ ➔ 次は $[1, 1.5]$<br>" +
                 "・1回目: $[1, 1.5]$, 中点 $m=1.25$. $f(1.25) = -0.4375 < 0$ ➔ 次は $[1.25, 1.5]$<br>" +
                 "・2回目: $[1.25, 1.5]$, 中点 $m=1.375$. $f(1.375) = -0.109 < 0$ ➔ 次は $[1.375, 1.5]$<br>" +
                 "・3回目: $[1.375, 1.5]$, 中点 $m=1.4375$. $f(1.4375) = 0.066 > 0$ ➔ 次は <strong>$[1.375, 1.4375]$</strong><br>" +
                 "・4回反復完了時の区間は $[1.375, 1.4375]$ となります。"
  },
  {
    id: "q15",
    category: "optimization",
    source: "kakomon",
    title: "過去問 大問3 (3). 固定値反復法による解 [選択式]",
    question: "<p>漸化式 $x_{k+1} = x_k - h \\cdot f(x_k)$ を用いて非線形方程式 $f(x) = x^2 - 2 = 0$ を解く。初期値 $x_0 = 1$、更新幅 $h = 0.2$ としたとき、第2回反復後の値 $x_2$ として正しいものを選択肢から選びなさい。</p>",
    type: "choice",
    choices: [
      "1. 1.1", "2. 1.2", "3. 1.312", "4. 1.354", "5. 1.3"
    ],
    answer: 3,
    explanation: "$f(x) = x^2 - 2$ を漸化式に当てはめてステップごとに計算します：<br>" +
                 "・<strong>$x_1$ の計算</strong>:<br>" +
                 "$$x_1 = x_0 - h(x_0^2 - 2) = 1 - 0.2(1^2 - 2) = 1 - 0.2(-1) = 1.2$$<br>" +
                 "・<strong>$x_2$ の計算</strong>:<br>" +
                 "$$x_2 = x_1 - h(x_1^2 - 2) = 1.2 - 0.2(1.2^2 - 2) = 1.2 - 0.2(1.44 - 2)$$" +
                 "$$= 1.2 - 0.2(-0.56) = 1.2 + 0.112 = 1.312$$"
  },
  {
    id: "q16",
    category: "optimization",
    source: "kakomon",
    title: "過去問 大問3 (4) ニュートン法①. 漸化式の一般式 [選択式]",
    question: "<p>1変数かつ1階連続微分可能な非線形方程式 $f(x) = 0$ の数値解法について、接線を利用して解く<strong>ニュートン法</strong>の漸化式（一般解）として正しいものを選択肢から選びなさい。</p>",
    type: "choice",
    choices: [
      "1. x_{k+1} = x_k - f(x_k)",
      "2. x_{k+1} = x_k - \\frac{f(x_k)}{f'(x_k)}",
      "3. x_{k+1} = x_k - h \\cdot f(x_k)",
      "4. x_{k+1} = x_k - \\frac{f'(x_k)}{f(x_k)}"
    ],
    answer: 2,
    explanation: "ニュートン法の更新規則は、現在の点 $(x_k, f(x_k))$ における関数の接線が $x$ 軸と交わる点を次の近似解 $x_{k+1}$ とすることから導出されます：<br>" +
                 "接線の方程式は $y - f(x_k) = f'(x_k)(x - x_k)$ であり、$y=0$ となる $x$ は：<br>" +
                 "$$x = x_k - \\frac{f(x_k)}{f'(x_k)}$$"
  },
  {
    id: "q17",
    category: "optimization",
    source: "kakomon",
    title: "過去問 大問3 (4) ニュートン法②. 近似計算 [選択式]",
    question: "<p>方程式 $f(x) = x^3 - 2 = 0$ にニュートン法を適用する。初期値 $x_0 = 1.6$ としたとき、第1回反復後の値 $x_1$ として最も近いものを選択肢から選びなさい。（小数点第3位以下は切り捨て）</p>",
    type: "choice",
    choices: [
      "1. 1.41", "2. 1.32", "3. 1.21", "4. 1.6", "5. 1.51"
    ],
    answer: 2,
    explanation: "$f(x) = x^3 - 2$ より、導関数は $f'(x) = 3x^2$ です。<br>" +
                 "ニュートン法の式に代入して計算します：<br>" +
                 "$$x_1 = x_0 - \\frac{x_0^3 - 2}{3x_0^2} = 1.6 - \\frac{1.6^3 - 2}{3(1.6^2)}$$" +
                 "$$= 1.6 - \\frac{4.096 - 2}{3(2.56)} = 1.6 - \\frac{2.096}{7.68} \\approx 1.6 - 0.2729 = 1.3271$$<br>" +
                 "小数点第3位以下を切り捨てると <strong>1.32</strong> になります。"
  },
  {
    id: "q18",
    category: "clustering",
    source: "kakomon",
    title: "過去問 大問4 ①. K平均法: クラスター1の更新 [選択式]",
    question: "<p>数学と英語の成績データに対してK平均法（$K=2$）を適用する。初期のクラスター重心 $(\\mu_x, \\mu_y)$ はそれぞれ、クラスター1: $(50, 70)$、クラスター2: $(60, 60)$ とする。</p>" +
              "<p>1回目の割り当て更新を行った後の、<strong>クラスター1の中心（重心） $(x_1, y_1)$</strong> を選択肢から選びなさい。（小数点以下は切り捨て）</p>",
    type: "choice",
    choices: [
      "1. (60, 68)", "2. (55, 120)", "3. (71, 15)", "4. (52, 66)"
    ],
    answer: 4,
    explanation: "データ点群を初期中心とのEuclidean距離により各クラスタへ分類し、クラスター1に属したデータ点の算術平均値を計算すると <strong>$(52, 66)$</strong> に更新されます。"
  },
  {
    id: "q19",
    category: "clustering",
    source: "kakomon",
    title: "過去問 大問4 ②. K平均法: クラスター2の更新 [選択式]",
    question: "<p>上記の条件（初期クラスター重心 クラスター1: $(50, 70)$、クラスター2: $(60, 60)$）において、1回目の割り当て更新を行った後の、<strong>クラスター2の中心（重心） $(x_1, y_1)$</strong> を選択肢から選びなさい。（小数点以下は切り捨て）</p>",
    type: "choice",
    choices: [
      "1. (66, 60)", "2. (70, 65)", "3. (55, 70)", "4. (62, 50)"
    ],
    answer: 1,
    explanation: "K平均法の1ステップ目において、クラスター2に分類された点群の平均値を求めると、重心は <strong>$(66, 60)$</strong> に更新されます。"
  },
  {
    id: "q20",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問5 (1). ベイズ推定による事後確率 [選択式]",
    question: "<p>ある過去データによると、ゲストが男性である確率は 60%、女性である確率は 40% である。今日のゲストは『身長が165cm以上（高い）』という情報が与えられた。</p>" +
              "<p>このとき、今日のゲストが『男性である確率』をベイズの定理を用いて求めなさい。ただし、この世の男性の7割が165cm以上、女性の2割が165cm以上とします。</p>",
    type: "choice",
    choices: [
      "1. 84%", "2. 74%", "3. 65%", "4. 72%", "5. 90%"
    ],
    answer: 1,
    explanation: "ベイズの定理を適用して計算します：<br>" +
                 "・事前確率: $P(\\text{男}) = 0.6$、 $P(\\text{女}) = 0.4$<br>" +
                 "・尤度（165cm以上の確率）: $P(\\text{高}|\\text{男}) = 0.7$、 $P(\\text{高}|\\text{女}) = 0.2$<br>" +
                 "・ゲストの身長が165cm以上である全体確率（周辺尤度）:<br>" +
                 "$$P(\\text{高}) = P(\\text{高}|\\text{男})P(\\text{男}) + P(\\text{高}|\\text{女})P(\\text{女}) = 0.7 \\times 0.6 + 0.2 \\times 0.4 = 0.42 + 0.08 = 0.50$$<br>" +
                 "・身長が高いという条件のもとでゲストが男性である事後確率:<br>" +
                 "$$P(\\text{男}|\\text{高}) = \\frac{P(\\text{高}|\\text{男})P(\\text{男})}{P(\\text{高})} = \\frac{0.7 \\times 0.6}{0.50} = \\frac{0.42}{0.50} = 0.84 \\quad (84\\%)$$"
  },
  {
    id: "q21",
    category: "estimation",
    source: "kakomon",
    title: "過去問 大問5 (2). ベイズ推定の特徴 [選択式]",
    question: "<p>正規分布モデルを仮定し、観測データ数 $N$ （$2, 4, 10, 100$）から真の平均値をベイズ推定する。データ数の変化に伴う推定値の挙動について、グラフから正しく読み取れる特徴を選択しなさい。</p>",
    type: "choice",
    choices: [
      "1. 実測データ数が少ないとき、推定値は真の平均値に対する確率が大きくなる",
      "2. 推定値は実測データ数に関係なく真の平均値の確率が最も大きくなる",
      "3. 実測データ数が増加すると、確率が高い推定値が真の平均値に近づき、かつ分散が狭く尖鋭化する",
      "4. 実測データ数が増加すると、推定値のばらつき（分散）も大きくなる"
    ],
    answer: 3,
    explanation: "ベイズ推定では、データ数 $N$ が増えるにつれて、事後分布のピーク（最も確率が高い推定平均値）は真の値（この場合は2.0）に近づき、さらに分布の幅（分散）が急速に狭く尖って収束していきます（不確実性が減少する）。"
  },

  // ==========================================
  // 【対策問題モード (source: "practice")】 (問22 〜 問29)
  // ==========================================
  {
    id: "q22",
    category: "theory",
    source: "practice",
    title: "対策問1. パーセプトロンの学習規則 [選択式]",
    question: "線形分類モデルであるパーセプトロンにおいて、入力ベクトル $x_i$ に対するモデルの出力が誤っていた場合、教師信号 $t_i \\in \\{-1, +1\\}$ と学習率 $\\eta$ を用いて重みベクトル $w$ を更新する規則（式）として正しいものはどれですか？",
    type: "choice",
    choices: [
      "1. w \\leftarrow w + \\eta t_i x_i",
      "2. w \\leftarrow w - \\eta t_i",
      "3. w \\leftarrow w + \\eta (t_i - x_i)^2",
      "4. w \\leftarrow \\eta t_i x_i"
    ],
    answer: 1,
    explanation: "パーセプトロンの学習規則では、誤分類が発生したときのみ、次の規則に従って重み $w$ を修正します：<br>" +
                 "$$w \\leftarrow w + \\eta t_i x_i$$<br>" +
                 "これにより、重みベクトルが誤分類されたクラスの方向へ引き寄せられ、境界線が正しく分類するように移動します。"
  },
  {
    id: "q23",
    category: "theory",
    source: "practice",
    title: "対策問2. ロジスティック回帰と活性化関数 [選択式]",
    question: "ロジスティック回帰において、モデルの出力をクラス1に属する確率（0から1の範囲）に変換するために用いられる活性化関数（シグモイド関数）の数式として正しいものはどれですか？",
    type: "choice",
    choices: [
      "1. \\sigma(a) = \\frac{1}{1 + e^{-a}}",
      "2. \\sigma(a) = \\tanh(a)",
      "3. \\sigma(a) = \\max(0, a)",
      "4. \\sigma(a) = e^{-a^2}"
    ],
    answer: 1,
    explanation: "ロジスティック回帰では、線形入力 $a = w^T x$ を<strong>シグモイド関数 (Sigmoid function)</strong> に通して確率値に射影します：<br>" +
                 "$$\\sigma(a) = \\frac{1}{1 + e^{-a}}$$<br>" +
                 "この関数は実数全体を $(0, 1)$ の区間に圧縮する特徴があり、微分計算が容易であるため広く使われます。"
  },
  {
    id: "q24",
    category: "optimization",
    source: "practice",
    title: "対策問3. 交差エントロピー損失関数 [選択式]",
    question: "ロジスティック回帰などの二値分類モデルにおいて、最尤推定法から導出され、モデルの予測確率 $y_n \\in (0, 1)$ と教師ラベル $t_n \\in \\{0, 1\\}$ の乖離を評価する『交差エントロピー損失関数』の定式化として正しいものはどれですか？",
    type: "choice",
    choices: [
      "1. E(w) = -\\sum_{n=1}^{N} [t_n \\ln y_n + (1 - t_n) \\ln(1 - y_n)]",
      "2. E(w) = \\frac{1}{2} \\sum_{n=1}^{N} (t_n - y_n)^2",
      "3. E(w) = \\sum_{n=1}^{N} |t_n - y_n|",
      "4. E(w) = -\\sum_{n=1}^{N} y_n \\ln t_n"
    ],
    answer: 1,
    explanation: "二値分類における対数尤度関数の負をとることで<strong>交差エントロピー誤差 (Cross-Entropy Loss)</strong> が導かれます：<br>" +
                 "$$E(w) = -\\sum_{n=1}^{N} \\left[ t_n \\ln y_n + (1 - t_n) \\ln(1 - y_n) \\right]$$<br>" +
                 "モデルが正しいクラスに対して $1.0$ に近い確率を出力するほど、この誤差関数の値は小さくなります。"
  },
  {
    id: "q25",
    category: "optimization",
    source: "practice",
    title: "対策問4. L1正則化とL2正則化の特徴 [選択式]",
    question: "過学習（オーバーフィッティング）を防ぐために損失関数にペナルティ項を加える正則化について、L1正則化（Lasso）とL2正則化（Ridge）の違いを説明した文として最も適切なものを1つ選びなさい。",
    type: "choice",
    choices: [
      "1. L1正則化は不要な特徴量の重み $w_m$ を完全に 0 にしてスパースなモデルを作る特徴があり、L2正則化は重み全体を小さく滑らかにする特徴がある。",
      "2. L1正則化は重みを滑らかにし、L2正則化は重みを完全に 0 にして特徴量を削減する効果がある。",
      "3. L1正則化は多項式の次数を強制的に増やし、L2正則化は次数を減らす効果がある。",
      "4. L1正則化はデータを等分割して交差検証を行い、L2正則化は検証を省いて学習データのみを評価する。"
    ],
    answer: 1,
    explanation: "正則化の代表的性質に関する問題です：<br>" +
                 "・<strong>L1正則化 (Lasso)</strong>: 絶対値の和 $\\sum |w_m|$ を加えます。微分不可能な角を持つため、一部のパラメータが完全に $0$ に収束しやすく、自動的な<strong>特徴量選択（スパース化）</strong>が起こります。<br>" +
                 "・<strong>L2正則化 (Ridge)</strong>: 二乗和 $\\frac{1}{2}\\sum w_m^2$ を加えます（ウェイトディケイ）。極端に大きな重みができるのを防ぎ、モデルを滑らかに安定化させます。"
  },
  {
    id: "q26",
    category: "clustering",
    source: "practice",
    title: "対策問5. K-meansのクラスタ数決定 [選択式]",
    question: "K平均法において、最適なクラスタ数 $K$ を分析者が決定する指標として、クラスタ数を増やしながら『クラスタ内誤差平方和 (SSE)』をプロットし、減少率が急激に緩やかになる曲がり角（エルボー）を最適点とする手法を何と呼びますか？",
    type: "choice",
    choices: [
      "1. エルボー法 (Elbow Method)",
      "2. クロスバリデーション法",
      "3. シルエット法",
      "4. 最尤法"
    ],
    answer: 1,
    explanation: "クラスタ数 $K$ を増やすと、当然クラスタ内の散らばり（SSE）は減っていきます。しかし、適切なクラスタ数を超えるとSSEの減少速度が大きく低下します。このグラフが肘（Elbow）のように曲がって見える位置を最適なクラスタ数とする方法を<strong>エルボー法</strong>と呼びます。"
  },
  {
    id: "q27",
    category: "estimation",
    source: "practice",
    title: "対策問6. ベイズの定理と確率の名称 [選択式]",
    question: "ベイズの定理 $P(w | D) = \\frac{P(D | w) P(w)}{P(D)}$ の各構成要素の名称について、データ $D$ が観測された後のパラメータ $w$ の確率である $P(w | D)$ を何と呼びますか？",
    type: "choice",
    choices: [
      "1. 事後確率 (Posterior probability)",
      "2. 事前確率 (Prior probability)",
      "3. 尤度 (Likelihood)",
      "4. 周辺尤度 / エビデンス (Evidence)"
    ],
    answer: 1,
    explanation: "ベイズ確率の用語定義です：<br>" +
                 "・$P(w | D)$: データ観測<strong>後</strong>の事後確率。<br>" +
                 "・$P(w)$: データ観測<strong>前</strong>の事前確率。<br>" +
                 "・$P(D | w)$: パラメータ $w$ のもとでデータ $D$ が得られる尤度。<br>" +
                 "・$P(D)$: 確率の和が 1 になるように正規化するための周辺尤度（エビデンス）。"
  },
  {
    id: "q28",
    category: "theory",
    source: "practice",
    title: "対策問7. 混同行列と適合率・再現率 [選択式]",
    question: "二値分類モデルの評価指標において、モデルが『陽性 (Positive)』と予測したもののうち、実際に陽性であった割合を示す指標を何と呼びますか？",
    type: "choice",
    choices: [
      "1. 適合率 (Precision)",
      "2. 再現率 (Recall)",
      "3. 正解率 (Accuracy)",
      "4. F値 (F-measure)"
    ],
    answer: 1,
    explanation: "評価指標の定義に関する問題です：<br>" +
                 "・<strong>適合率 (Precision)</strong>: 予測した陽性のうち、真に陽性だった割合（無駄な陽性予測が少ないか）。<br>" +
                 "・<strong>再現率 (Recall)</strong>: 実際の陽性のうち、正しく陽性と予測できた割合（見落としがないか）。<br>" +
                 "・<strong>正解率 (Accuracy)</strong>: 予測全体のうち、正解（真陽性＋真陰性）の割合。<br>" +
                 "・<strong>F値</strong>: 適合率と再現率の調和平均。"
  },
  {
    id: "q29",
    category: "theory",
    source: "practice",
    title: "対策問8. サポートベクターマシン (SVM) [選択式]",
    question: "サポートベクターマシン (SVM) の特徴について、誤っている記述を選択しなさい。",
    type: "choice",
    choices: [
      "1. 決定境界と最も近いデータ点（サポートベクター）との距離である『マージン』を最大化するように学習する。",
      "2. 線形分離不可能な高次元データに対しては、カーネル法を用いて低次元の単純な空間に射影して線形分類する。",
      "3. カーネル法を用いることで、データを非線形写像によって高次元空間へ写し、その高次元空間上で線形超平面を構成することで非線形分類が可能になる。",
      "4. 分類において非常に高い汎化性能を持つことが知られている。"
    ],
    answer: 2,
    explanation: "SVMはマージン最大化により汎化性能を高める分類器です。線形分離不可能なデータに対しては、<strong>非線形カーネル写像によって『高次元の空間』へデータを写像し、その高次元空間上で線形分離を行う</strong>ことで非線形境界を表現します。低次元空間に射影するわけではないため、選択肢2の記述が誤りとなります。"
  }
];

// node.jsで動く場合とブラウザで動く場合の両方に対応
if (typeof module !== 'undefined' && module.exports) {
  module.exports = questions;
}
