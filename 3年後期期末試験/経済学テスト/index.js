// ==========================================================================
// 経済学テスト対策アプリ - index.js
// 制御ロジック & 動的SVGグラフ描画エンジン
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------------
  // 1. アプリケーション状態管理
  // ------------------------------------------------------------------------
  let currentMode = "quiz"; // 'quiz' or 'flashcards' or 'review'
  let currentIndex = 0;
  let score = 0;
  let currentQuestions = [];
  let userAnswers = {}; // 穴埋め用の回答一時保存用 { "gapIndex": "selectedValue" }
  let selectedOption = null; // 単一選択用の選択肢保存用
  let wrongQuestions = []; // 間違えた問題の記録
  let questionStatuses = {}; // 問題ごとの解答状況を保存用 { q_id: 'correct' | 'wrong' }

  // localStorageの安全な取得ヘルパー
  function safeJSONParse(key, defaultValue) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.warn("localStorage parse error for key:", key, e);
      return defaultValue;
    }
  }

  // 永続化用のデータ
  let bookmarks = safeJSONParse("econ_bookmarks", []);
  let wrongs = safeJSONParse("econ_wrongs", []);
  let masteredIds = safeJSONParse("econ_mastered", []); // 3回以上正解した問題
  let correctCounts = safeJSONParse("econ_correct_counts", {}); // 各問題の正解回数
  let currentStreak = parseInt(localStorage.getItem("econ_streak")) || 0; // 連続正解数
  let totalAnswered = parseInt(localStorage.getItem("econ_total_answered")) || 0; // 総解答数
  let totalCorrect = parseInt(localStorage.getItem("econ_total_correct")) || 0; // 総正解数
  let allQuestionsPool = []; // 全問題のプール（復習・検索用）

  // ------------------------------------------------------------------------
  // 2. DOM要素の取得
  // ------------------------------------------------------------------------
  const screens = {
    home: document.getElementById("screen-home"),
    learning: document.getElementById("screen-learning"),
    result: document.getElementById("screen-result"),
    cheatsheet: document.getElementById("screen-cheatsheet")
  };

  const btnQuiz = document.getElementById("card-mode-quiz");
  const btnFlashcards = document.getElementById("card-mode-flashcards");
  const btnBackHome = document.getElementById("btn-back-home");
  const btnLogoHome = document.getElementById("btn-logo-home");
  const btnSubmit = document.getElementById("btn-submit");
  const btnNext = document.getElementById("btn-next");
  const btnThemeToggle = document.getElementById("theme-toggle");
  
  const btnRestartQuiz = document.getElementById("btn-restart-quiz");
  const btnResultToHome = document.getElementById("btn-result-to-home");

  const modeNameIndicator = document.getElementById("current-mode-name");
  const progressText = document.getElementById("quiz-progress-text");
  const percentageText = document.getElementById("quiz-percentage-text");
  const progressBar = document.getElementById("quiz-progress-bar");

  const questionSection = document.getElementById("question-section");
  const questionText = document.getElementById("question-text");
  const answerFormContainer = document.getElementById("answer-form-container");

  const feedbackCard = document.getElementById("feedback-card");
  const feedbackIcon = document.getElementById("feedback-icon");
  const feedbackTitle = document.getElementById("feedback-title");
  const explanationText = document.getElementById("explanation-text");

  const graphPanel = document.getElementById("graph-panel");
  const graphTitle = document.getElementById("graph-title");
  const graphContainer = document.getElementById("graph-container");
  const legendContainer = document.getElementById("graph-legend-container");

  // 追加機能用DOM
  const shuffleToggle = document.getElementById("shuffle-toggle");
  const btnOpenNav = document.getElementById("btn-open-nav");
  const btnCloseNav = document.getElementById("btn-close-nav");
  const navModal = document.getElementById("nav-modal");
  const navGridContainer = document.getElementById("nav-grid-container");

  // ブックマーク・復習モード用DOM
  const btnBookmark = document.getElementById("btn-bookmark");
  const btnStartReview = document.getElementById("btn-start-review");
  const reviewTypeSelect = document.getElementById("review-type");
  const statBookmarksCount = document.getElementById("stat-bookmarks-count");
  const statWrongsCount = document.getElementById("stat-wrongs-count");

  // ------------------------------------------------------------------------
  // 3. 画面遷移と初期化
  // ------------------------------------------------------------------------
  function switchScreen(screenKey) {
    Object.keys(screens).forEach(key => {
      screens[key].classList.remove("active");
    });
    screens[screenKey].classList.add("active");
    if (screenKey === "home") {
      updateHomeStats();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ホーム画面のブックマーク・弱点問題数を更新
  function updateHomeStats() {
    if (document.getElementById("stat-bookmarks-count")) {
      document.getElementById("stat-bookmarks-count").textContent = bookmarks.length;
    }
    if (document.getElementById("card-stat-bookmarks-count")) {
      document.getElementById("card-stat-bookmarks-count").textContent = bookmarks.length;
    }
    if (document.getElementById("stat-wrongs-count")) {
      document.getElementById("stat-wrongs-count").textContent = wrongs.length;
    }
    if (document.getElementById("card-stat-wrongs-count")) {
      document.getElementById("card-stat-wrongs-count").textContent = wrongs.length;
    }
    // ダッシュボード統計の更新
    const totalQCount = allQuestionsPool.length || (quizData.quiz.length + quizData.flashcards.length);
    if (document.getElementById("stat-total-answered")) {
      document.getElementById("stat-total-answered").textContent = totalAnswered;
    }
    if (document.getElementById("stat-correct-rate")) {
      const rate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
      document.getElementById("stat-correct-rate").textContent = rate + "%";
    }
    if (document.getElementById("stat-streak")) {
      document.getElementById("stat-streak").textContent = currentStreak;
    }
    if (document.getElementById("stat-mastered")) {
      document.getElementById("stat-mastered").textContent = masteredIds.length;
    }
    // 習得率バー
    const masteryPct = totalQCount > 0 ? Math.min(100, Math.round((masteredIds.length / totalQCount) * 100)) : 0;
    if (document.getElementById("stat-mastery-pct")) {
      document.getElementById("stat-mastery-pct").textContent = masteryPct + "%";
    }
    if (document.getElementById("stat-mastery-bar")) {
      document.getElementById("stat-mastery-bar").style.width = masteryPct + "%";
    }
  }

  // 全問題プール（復習・検索用）の初期化
  function initializeAllQuestionsPool() {
    const allAnswers = quizData.flashcards.map(fc => fc.answer);

    const fcQuestions = quizData.flashcards.map(fc => {
      // 自分以外の答えからランダムに2つ抽出してダミーにする
      const otherAnswers = allAnswers.filter(ans => ans !== fc.answer);
      const shuffledOthers = otherAnswers.sort(() => Math.random() - 0.5);
      const dummy1 = shuffledOthers[0] || "逆の関係を説明したもの";
      const dummy2 = shuffledOthers[1] || "政府の過剰介入による非効率性の説明";

      return {
        id: fc.id,
        section: fc.category,
        question: fc.question,
        type: "select",
        options: [
          fc.answer,
          dummy1,
          dummy2
        ].sort(() => Math.random() - 0.5),
        answer: fc.answer,
        explanation: fc.explanation,
        flashcardRaw: fc
      };
    });
    allQuestionsPool = [...quizData.quiz, ...fcQuestions];
  }
  initializeAllQuestionsPool();
  updateHomeStats();

  // 配列をシャッフルするヘルパー関数 (Fisher-Yates)
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function startMode(mode, reviewFilter = "all") {
    currentMode = mode;
    currentIndex = 0;
    score = 0;
    wrongQuestions = [];
    questionStatuses = {}; // 各問題の解答状況をリセット
    
    let questionsSrc = [];
    if (mode === "quiz") {
      questionsSrc = quizData.quiz;
      modeNameIndicator.textContent = "小テスト完全再現";
    } else if (mode === "flashcards") {
      // フラッシュカードを一問一答クイズに変換して出題
      questionsSrc = allQuestionsPool.filter(q => q.id.startsWith("f_"));
      modeNameIndicator.textContent = "一問一答フラッシュカード";
    } else if (mode === "review") {
      // 復習モード
      if (reviewFilter === "bookmark") {
        questionsSrc = allQuestionsPool.filter(q => bookmarks.includes(q.id));
        modeNameIndicator.textContent = "復習：ブックマーク";
      } else if (reviewFilter === "wrong") {
        questionsSrc = allQuestionsPool.filter(q => wrongs.includes(q.id));
        modeNameIndicator.textContent = "復習：間違えた問題";
      } else {
        // すべて（重複排除）
        const combinedIds = Array.from(new Set([...bookmarks, ...wrongs]));
        questionsSrc = allQuestionsPool.filter(q => combinedIds.includes(q.id));
        modeNameIndicator.textContent = "復習：ブックマーク＋間違えた問題";
      }

      if (questionsSrc.length === 0) {
        alert("対象の問題がありません。まずはクイズ中にブックマークを追加するか、間違えてみましょう！");
        switchScreen("home");
        return;
      }
    }

    // シャッフルトグルがONならシャッフルする
    if (shuffleToggle && shuffleToggle.checked) {
      currentQuestions = shuffleArray(questionsSrc);
    } else {
      currentQuestions = [...questionsSrc];
    }

    switchScreen("learning");
    showQuestion();
  }

  // ------------------------------------------------------------------------
  // 4. クイズの描画処理
  // ------------------------------------------------------------------------
  function showQuestion() {
    // 状態クリア
    selectedOption = null;
    userAnswers = {};
    feedbackCard.classList.add("hidden");
    btnSubmit.classList.remove("hidden");
    btnNext.classList.add("hidden");

    const q = currentQuestions[currentIndex];

    // ブックマークボタンの点灯状態更新
    if (btnBookmark) {
      if (bookmarks.includes(q.id)) {
        btnBookmark.classList.add("active");
      } else {
        btnBookmark.classList.remove("active");
      }
    }

    // プログレス更新
    const total = currentQuestions.length;
    progressText.textContent = `問題 ${currentIndex + 1} / ${total}`;
    const solvedCount = Object.keys(questionStatuses).length;
    const pct = Math.round((solvedCount / total) * 100);
    percentageText.textContent = `${pct}%`;
    progressBar.style.width = `${pct}%`;

    // テキスト設定
    questionSection.textContent = q.section;
    questionText.textContent = q.question;

    // 回答フォーム生成
    answerFormContainer.innerHTML = "";

    if (q.type === "select") {
      const list = document.createElement("div");
      list.className = "options-list";
      q.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        
        const indexSpan = document.createElement("span");
        indexSpan.className = "option-index";
        indexSpan.textContent = String.fromCharCode(65 + idx); // A, B, C, D...
        
        const textSpan = document.createElement("span");
        textSpan.textContent = opt;

        btn.appendChild(indexSpan);
        btn.appendChild(textSpan);

        btn.addEventListener("click", () => {
          document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          selectedOption = opt;
        });

        list.appendChild(btn);
      });
      answerFormContainer.appendChild(list);

    } else if (q.type === "fill-gap") {
      const wrapper = document.createElement("div");
      wrapper.className = "fill-gap-text";
      
      // [1] や [2] などをセレクトボックスに置換
      let rawText = q.text;
      const regex = /\[(\d+)\]/g;
      let lastIndex = 0;
      let match;
      
      while ((match = regex.exec(rawText)) !== null) {
        const gapNum = match[1];
        // マッチ前のテキストを追加
        wrapper.appendChild(document.createTextNode(rawText.substring(lastIndex, match.index)));
        
        // セレクトボックスの作成
        const select = document.createElement("select");
        select.className = "gap-select";
        select.dataset.gap = gapNum;
        
        // デフォルトの空白オプション
        const defOpt = document.createElement("option");
        defOpt.value = "";
        defOpt.textContent = `選択 [${gapNum}]`;
        select.appendChild(defOpt);
        
        // 選択肢の追加
        q.gaps[gapNum].options.forEach(opt => {
          const o = document.createElement("option");
          o.value = opt;
          o.textContent = opt;
          select.appendChild(o);
        });

        // 状態保存
        select.addEventListener("change", (e) => {
          userAnswers[gapNum] = e.target.value;
        });

        wrapper.appendChild(select);
        lastIndex = regex.lastIndex;
      }
      // 残りのテキストを追加
      wrapper.appendChild(document.createTextNode(rawText.substring(lastIndex)));
      answerFormContainer.appendChild(wrapper);

    } else if (q.type === "text") {
      const textarea = document.createElement("textarea");
      textarea.className = "text-answer-input";
      textarea.placeholder = "ここにあなたの考えや解答を記述してください（記述式の問題です。送信後、解説を確認できます）。";
      textarea.addEventListener("input", (e) => {
        selectedOption = e.target.value;
      });
      answerFormContainer.appendChild(textarea);
    }

    // グラフの描画
    const learningLayout = document.querySelector(".learning-layout");
    if (q.graph) {
      graphPanel.classList.remove("hidden");
      if (learningLayout) learningLayout.classList.remove("no-graph");
      drawGraph(q.graph);
    } else {
      graphPanel.classList.add("hidden");
      if (learningLayout) learningLayout.classList.add("no-graph");
    }
  }

  // ------------------------------------------------------------------------
  // 5. 解答判定とフィードバック
  // ------------------------------------------------------------------------
  function checkAnswer() {
    const q = currentQuestions[currentIndex];
    let isCorrect = true;

    if (q.type === "select") {
      if (!selectedOption) {
        alert("選択肢を選んでください。");
        return;
      }
      isCorrect = (selectedOption === q.answer);

    } else if (q.type === "fill-gap") {
      // 全ての穴埋めが選択されているか確認
      const gapKeys = Object.keys(q.gaps);
      let allFilled = true;
      gapKeys.forEach(k => {
        if (!userAnswers[k]) allFilled = false;
      });

      if (!allFilled) {
        alert("すべての空欄を選択してください。");
        return;
      }

      // 正誤チェック
      gapKeys.forEach(k => {
        if (userAnswers[k] !== q.gaps[k].answer) {
          isCorrect = false;
        }
      });

    } else if (q.type === "text") {
      // 記述式は空白でなければ正解（解説提示が目的）とする
      if (!selectedOption || selectedOption.trim() === "") {
        alert("回答を入力してください。");
        return;
      }
      isCorrect = true;
    }

    // 解答状況を記録
    questionStatuses[q.id] = isCorrect ? 'correct' : 'wrong';

    // 総解答数・正解数の更新
    totalAnswered++;
    localStorage.setItem("econ_total_answered", totalAnswered);
    if (isCorrect) {
      totalCorrect++;
      currentStreak++;
      localStorage.setItem("econ_total_correct", totalCorrect);
      localStorage.setItem("econ_streak", currentStreak);
      // 正解回数の累計更新 → 3回以上で習得済みに
      correctCounts[q.id] = (correctCounts[q.id] || 0) + 1;
      localStorage.setItem("econ_correct_counts", JSON.stringify(correctCounts));
      if (correctCounts[q.id] >= 3 && !masteredIds.includes(q.id)) {
        masteredIds.push(q.id);
        localStorage.setItem("econ_mastered", JSON.stringify(masteredIds));
      }
    } else {
      currentStreak = 0;
      localStorage.setItem("econ_streak", currentStreak);
    }

    // 弱点克服リストの更新
    if (isCorrect) {
      if (wrongs.includes(q.id)) {
        wrongs = wrongs.filter(id => id !== q.id);
        localStorage.setItem("econ_wrongs", JSON.stringify(wrongs));
      }
    } else {
      if (!wrongs.includes(q.id)) {
        wrongs.push(q.id);
        localStorage.setItem("econ_wrongs", JSON.stringify(wrongs));
      }
    }
    updateHomeStats();

    // フィードバック表示
    showFeedback(isCorrect);
  }

  function showFeedback(isCorrect) {
    const q = currentQuestions[currentIndex];
    
    // UI制御
    btnSubmit.classList.add("hidden");
    btnNext.classList.remove("hidden");
    feedbackCard.classList.remove("hidden");

    if (isCorrect) {
      feedbackCard.classList.remove("wrong");
      feedbackIcon.textContent = "✓";
      feedbackTitle.textContent = "正解！";
    } else {
      feedbackCard.classList.add("wrong");
      feedbackIcon.textContent = "✗";
      
      // 正解の文字列を生成してフィードバックに表示
      let correctMsg = "不正解です。";
      if (q.type === "select") {
        correctMsg += ` 正解: ${q.answer}`;
      } else if (q.type === "fill-gap") {
        correctMsg += " 正しい組み合わせ: ";
        Object.keys(q.gaps).forEach(k => {
          correctMsg += `[${k}] ${q.gaps[k].answer}  `;
        });
      }
      feedbackTitle.textContent = correctMsg;
    }

    explanationText.textContent = q.explanation;
    
    // 正答時にグラフに変化や強調を加える（必要に応じて再描画）
    if (q.graph) {
      drawGraph(q.graph, true); // true: 解答後の描画モード
    }
  }

  function handleNext() {
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }

  // ------------------------------------------------------------------------
  // 6. 結果画面の描画
  // ------------------------------------------------------------------------
  function showResults() {
    // 解答状況から最新のスコアと要復習問題を再集計する
    score = 0;
    wrongQuestions = [];
    currentQuestions.forEach(q => {
      const status = questionStatuses[q.id];
      if (status === "correct") {
        score++;
      } else if (status === "wrong") {
        wrongQuestions.push(q);
      }
    });

    switchScreen("result");

    const total = currentQuestions.length;
    document.getElementById("result-score").textContent = `${score} / ${total}`;
    
    const rate = Math.round((score / total) * 100);
    const rateEl = document.getElementById("result-rate");
    rateEl.textContent = `${rate}%`;
    
    const wrongCountEl = document.getElementById("result-wrong-count");
    wrongCountEl.textContent = `${total - score}問`;

    // 評価テキスト
    let subtitle = "";
    if (rate === 100) subtitle = "素晴らしい！完璧です！この調子で本番も満点を目指しましょう。";
    else if (rate >= 80) subtitle = "合格ライン到達！間違えた問題を復習して、さらに理解を深めましょう。";
    else subtitle = "もう一息！間違えた問題の解説をよく読んで、再度チャレンジしてみましょう。";
    document.getElementById("result-subtitle").textContent = subtitle;

    // 間違えた問題リストの作成
    const listContainer = document.getElementById("wrong-questions-list");
    listContainer.innerHTML = "";

    if (wrongQuestions.length === 0) {
      listContainer.innerHTML = '<div class="glass-panel" style="text-align:center;color:var(--color-success)">🎉 間違えた問題はありません！完璧な仕上がりです！</div>';
      return;
    }

    wrongQuestions.forEach((q, idx) => {
      const item = document.createElement("div");
      item.className = "wrong-item";
      
      const header = document.createElement("div");
      header.className = "wrong-item-header";
      header.innerHTML = `<span>${q.section}</span><span>タップして解説を表示</span>`;
      
      const title = document.createElement("div");
      title.className = "wrong-item-title";
      title.textContent = `${idx + 1}. ${q.question.substring(0, 100)}${q.question.length > 100 ? '...' : ''}`;
      
      const explanation = document.createElement("div");
      explanation.className = "wrong-item-explanation";
      
      // 正解情報
      let answerInfo = "";
      if (q.type === "select") {
        answerInfo = `<strong>正解:</strong> ${q.answer}<br>`;
      } else if (q.type === "fill-gap") {
        answerInfo = "<strong>正解の組み合わせ:</strong> ";
        Object.keys(q.gaps).forEach(k => {
          answerInfo += `[${k}] ${q.gaps[k].answer}  `;
        });
        answerInfo += "<br>";
      }

      explanation.innerHTML = `${answerInfo}<strong>解説:</strong> ${q.explanation}`;

      item.appendChild(header);
      item.appendChild(title);
      item.appendChild(explanation);

      item.addEventListener("click", () => {
        item.classList.toggle("open");
      });

      listContainer.appendChild(item);
    });
  }

  // ------------------------------------------------------------------------
  // 7. 動的SVGグラフ描画エンジン
  // ------------------------------------------------------------------------
  function drawGraph(type, solved = false) {
    const svg = document.getElementById("economic-svg");
    svg.innerHTML = ""; // クリア

    // グラフの定数と変換関数
    const width = 400;
    const height = 400;
    const padding = 50;
    
    // 数量(q), 価格(p)からSVG座標(X, Y)への変換
    // 0〜100 の仮想座標を 50〜350 にマッピング
    function getX(q) {
      return padding + (q / 100) * (width - 2 * padding);
    }
    function getY(p) {
      return (height - padding) - (p / 100) * (height - 2 * padding);
    }

    // 軸とグリッドラインの描画関数
    function drawBaseAxes(xLabel = "数量 (Q)", yLabel = "価格 (P)") {
      // X軸
      const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
      xAxis.setAttribute("x1", getX(0));
      xAxis.setAttribute("y1", getY(0));
      xAxis.setAttribute("x2", getX(100));
      xAxis.setAttribute("y2", getY(0));
      xAxis.setAttribute("class", "axis");
      svg.appendChild(xAxis);

      // Y軸
      const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
      yAxis.setAttribute("x1", getX(0));
      yAxis.setAttribute("y1", getY(0));
      yAxis.setAttribute("x2", getX(0));
      yAxis.setAttribute("y2", getY(100));
      yAxis.setAttribute("class", "axis");
      svg.appendChild(yAxis);

      // X軸矢印
      const xArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      xArrow.setAttribute("d", `M ${getX(100)} ${getY(0)-4} L ${getX(100)+8} ${getY(0)} L ${getX(100)} ${getY(0)+4} Z`);
      xArrow.setAttribute("fill", "var(--text-secondary)");
      svg.appendChild(xArrow);

      // Y軸矢印
      const yArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      yArrow.setAttribute("d", `M ${getX(0)-4} ${getY(100)} L ${getX(0)} ${getY(100)-8} L ${getX(0)+4} ${getY(100)} Z`);
      yArrow.setAttribute("fill", "var(--text-secondary)");
      svg.appendChild(yArrow);

      // ラベル
      const xText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      xText.setAttribute("x", getX(100) - 20);
      xText.setAttribute("y", getY(0) + 20);
      xText.textContent = xLabel;
      svg.appendChild(xText);

      const yText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      yText.setAttribute("x", getX(0) - 40);
      yText.setAttribute("y", getY(100) - 5);
      yText.textContent = yLabel;
      svg.appendChild(yText);
      
      // 原点 '0'
      const originText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      originText.setAttribute("x", getX(0) - 15);
      originText.setAttribute("y", getY(0) + 15);
      originText.textContent = "0";
      svg.appendChild(originText);
    }

    // 補助線（点線）の描画
    function drawDashedGuide(q, p, qLabel = "", pLabel = "") {
      const lineX = document.createElementNS("http://www.w3.org/2000/svg", "line");
      lineX.setAttribute("x1", getX(q));
      lineX.setAttribute("y1", getY(p));
      lineX.setAttribute("x2", getX(0));
      lineX.setAttribute("y2", getY(p));
      lineX.setAttribute("class", "grid-line");
      svg.appendChild(lineX);

      const lineY = document.createElementNS("http://www.w3.org/2000/svg", "line");
      lineY.setAttribute("x1", getX(q));
      lineY.setAttribute("y1", getY(p));
      lineY.setAttribute("x2", getX(q));
      lineY.setAttribute("y2", getY(0));
      lineY.setAttribute("class", "grid-line");
      svg.appendChild(lineY);

      if (pLabel) {
        const textP = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textP.setAttribute("x", getX(0) - 35);
        textP.setAttribute("y", getY(p) + 4);
        textP.textContent = pLabel;
        svg.appendChild(textP);
      }

      if (qLabel) {
        const textQ = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textQ.setAttribute("x", getX(q) - 10);
        textQ.setAttribute("y", getY(0) + 18);
        textQ.textContent = qLabel;
        svg.appendChild(textQ);
      }
    }

    // 凡例を描く
    function drawLegend(items) {
      legendContainer.innerHTML = "";
      items.forEach(item => {
        const el = document.createElement("div");
        el.className = "legend-item";
        el.innerHTML = `
          <span class="legend-color" style="background-color: ${item.color}"></span>
          <span>${item.label}</span>
        `;
        legendContainer.appendChild(el);
      });
    }

    // 各グラフ種別の描画
    if (type === "rice-market") {
      graphTitle.textContent = "コメの市場モデル";
      drawBaseAxes();

      // 需要曲線 (D)
      const d = document.createElementNS("http://www.w3.org/2000/svg", "line");
      d.setAttribute("x1", getX(10)); d.setAttribute("y1", getY(80));
      d.setAttribute("x2", getX(90)); d.setAttribute("y2", getY(20));
      d.setAttribute("class", "demand-curve");
      svg.appendChild(d);
      
      const dText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      dText.setAttribute("x", getX(90) + 5); dText.setAttribute("y", getY(20));
      dText.textContent = "需要 (D)";
      svg.appendChild(dText);

      // 供給曲線 (S)
      const s = document.createElementNS("http://www.w3.org/2000/svg", "line");
      s.setAttribute("x1", getX(10)); s.setAttribute("y1", getY(20));
      s.setAttribute("x2", getX(90)); s.setAttribute("y2", getY(80));
      s.setAttribute("class", "supply-curve");
      svg.appendChild(s);

      const sText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      sText.setAttribute("x", getX(90) + 5); sText.setAttribute("y", getY(80));
      sText.textContent = "供給 (S)";
      svg.appendChild(sText);

      // 均衡点 (50, 50) => コメ価格2500円、取引量55kgに対応
      drawDashedGuide(50, 50, "55kg", "2500円");

      const eq = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eq.setAttribute("cx", getX(50)); eq.setAttribute("cy", getY(50));
      eq.setAttribute("class", "equilibrium-point");
      svg.appendChild(eq);

      const eqText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      eqText.setAttribute("x", getX(50) + 8); eqText.setAttribute("y", getY(50) - 8);
      eqText.textContent = "E (均衡点)";
      svg.appendChild(eqText);

      drawLegend([
        { color: "var(--color-primary)", label: "需要曲線 (消費者の行動)" },
        { color: "var(--color-accent)", label: "供給曲線 (農家の行動)" }
      ]);

    } else if (type === "rice-market-shift") {
      graphTitle.textContent = "備蓄米の放出による市場の変化";
      drawBaseAxes();

      // 需要曲線 (D)
      const d = document.createElementNS("http://www.w3.org/2000/svg", "line");
      d.setAttribute("x1", getX(10)); d.setAttribute("y1", getY(80));
      d.setAttribute("x2", getX(90)); d.setAttribute("y2", getY(20));
      d.setAttribute("class", "demand-curve");
      svg.appendChild(d);

      // 供給曲線 S1 (通常)
      const s1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      s1.setAttribute("x1", getX(10)); s1.setAttribute("y1", getY(20));
      s1.setAttribute("x2", getX(90)); s1.setAttribute("y2", getY(80));
      s1.setAttribute("stroke", "var(--color-accent)");
      s1.setAttribute("stroke-width", "2");
      s1.setAttribute("fill", "none");
      s1.setAttribute("opacity", "0.5");
      svg.appendChild(s1);

      // 供給曲線 S2 (備蓄米放出後 - 右シフト)
      const s2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      s2.setAttribute("x1", getX(25)); s2.setAttribute("y1", getY(20));
      s2.setAttribute("x2", getX(95)); s2.setAttribute("y2", getY(72));
      s2.setAttribute("stroke", "var(--color-accent)");
      s2.setAttribute("stroke-width", "3.5");
      s2.setAttribute("fill", "none");
      svg.appendChild(s2);

      const s2Text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      s2Text.setAttribute("x", getX(95) + 5); s2Text.setAttribute("y", getY(72));
      s2Text.textContent = "S2 (放出後)";
      svg.appendChild(s2Text);

      // シフトの矢印
      const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      arrow.setAttribute("d", `M ${getX(40)} ${getY(43)} L ${getX(52)} ${getY(41)}`);
      arrow.setAttribute("stroke", "var(--color-success)");
      arrow.setAttribute("stroke-width", "2");
      arrow.setAttribute("marker-end", "url(#arrow)");
      svg.appendChild(arrow);
      
      // 矢印用定義
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
      marker.setAttribute("id", "arrow");
      marker.setAttribute("viewBox", "0 0 10 10");
      marker.setAttribute("refX", "5");
      marker.setAttribute("refY", "5");
      marker.setAttribute("markerWidth", "6");
      marker.setAttribute("markerHeight", "6");
      marker.setAttribute("orient", "auto-start-reverse");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
      path.setAttribute("fill", "var(--color-success)");
      marker.appendChild(path);
      defs.appendChild(marker);
      svg.appendChild(defs);

      // 初期均衡点 E1 (50, 50)
      const eq1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eq1.setAttribute("cx", getX(50)); eq1.setAttribute("cy", getY(50));
      eq1.setAttribute("r", "4");
      eq1.setAttribute("fill", "var(--text-muted)");
      svg.appendChild(eq1);
      
      // 新しい均衡点 E2 (60, 42.5)
      drawDashedGuide(60, 42.5, "取引量増", "価格下落");

      const eq2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eq2.setAttribute("cx", getX(60)); eq2.setAttribute("cy", getY(42.5));
      eq2.setAttribute("class", "equilibrium-point");
      svg.appendChild(eq2);

      drawLegend([
        { color: "var(--color-primary)", label: "需要曲線 (D)" },
        { color: "rgba(236, 72, 153, 0.5)", label: "初期供給 (S1)" },
        { color: "var(--color-accent)", label: "追加供給 (S2: 備蓄米放出後)" }
      ]);

    } else if (type === "labor-market-free") {
      graphTitle.textContent = "労働市場（政府介入なし・完全競争時）";
      drawBaseAxes("労働時間 (L)", "賃金 (W)");

      // 消費者余剰 (A+B+D) と生産者余剰 (C+F) の描画
      // 均衡点は (50, 50)。需要：(10, 90)〜(90, 10)。供給：(10, 10)〜(90, 90)。
      
      // 消費者余剰領域（上部三角形）
      // ポリゴン頂点: (10, 90) -> (50, 50) -> (10, 50)
      // 原点は左下なので、正確には (0, P_max)〜(Q*, P*)〜(0, P*)
      const cs = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      cs.setAttribute("points", `${getX(10)},${getY(90)} ${getX(50)},${getY(50)} ${getX(10)},${getY(50)}`);
      cs.setAttribute("class", "surplus-consumer");
      svg.appendChild(cs);

      // 生産者余剰領域（下部三角形）
      // ポリゴン頂点: (10, 10) -> (50, 50) -> (10, 50)
      const ps = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      ps.setAttribute("points", `${getX(10)},${getY(10)} ${getX(50)},${getY(50)} ${getX(10)},${getY(50)}`);
      ps.setAttribute("class", "surplus-producer");
      svg.appendChild(ps);

      // 需要曲線 (D: 企業)
      const d = document.createElementNS("http://www.w3.org/2000/svg", "line");
      d.setAttribute("x1", getX(10)); d.setAttribute("y1", getY(90));
      d.setAttribute("x2", getX(90)); d.setAttribute("y2", getY(10));
      d.setAttribute("class", "demand-curve");
      svg.appendChild(d);

      // 供給曲線 (S: 労働者)
      const s = document.createElementNS("http://www.w3.org/2000/svg", "line");
      s.setAttribute("x1", getX(10)); s.setAttribute("y1", getY(10));
      s.setAttribute("x2", getX(90)); s.setAttribute("y2", getY(90));
      s.setAttribute("class", "supply-curve");
      svg.appendChild(s);

      // 均衡ガイド
      drawDashedGuide(50, 50, "Q* (雇用量)", "P* (均衡賃金)");

      // 均衡点
      const eq = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eq.setAttribute("cx", getX(50)); eq.setAttribute("cy", getY(50));
      eq.setAttribute("class", "equilibrium-point");
      svg.appendChild(eq);

      // アルファベット配置 (問題2.2解読用)
      // A (Wより上でDの下)
      const textA = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textA.setAttribute("x", getX(15)); textA.setAttribute("y", getY(70));
      textA.setAttribute("font-size", "14px");
      textA.textContent = "A";
      svg.appendChild(textA);

      // B (WとP*の間)
      const textB = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textB.setAttribute("x", getX(22)); textB.setAttribute("y", getY(58));
      textB.setAttribute("font-size", "14px");
      textB.textContent = "B";
      svg.appendChild(textB);

      // C (P*と供給曲線Sの間)
      const textC = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textC.setAttribute("x", getX(22)); textC.setAttribute("y", getY(42));
      textC.setAttribute("font-size", "14px");
      textC.textContent = "C";
      svg.appendChild(textC);

      // D (Q1からQ*の間の需要曲線下の三角形)
      const textD = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textD.setAttribute("x", getX(42)); textD.setAttribute("y", getY(54));
      textD.setAttribute("font-size", "14px");
      textD.textContent = "D";
      svg.appendChild(textD);

      // F (Q1からQ*の間の供給曲線上の三角形)
      const textF = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textF.setAttribute("x", getX(42)); textF.setAttribute("y", getY(46));
      textF.setAttribute("font-size", "14px");
      textF.textContent = "F";
      svg.appendChild(textF);

      drawLegend([
        { color: "rgba(59, 130, 246, 0.25)", label: "消費者余剰 (A+B+D: 企業の得)" },
        { color: "rgba(236, 72, 153, 0.25)", label: "生産者余剰 (C+F: 労働者の得)" },
        { color: "transparent", label: "※合計 A+B+C+D+F が社会的総余剰" }
      ]);

    } else if (type === "labor-market-minwage") {
      graphTitle.textContent = "労働市場（最低賃金規制時）";
      drawBaseAxes("労働時間 (L)", "賃金 (W)");

      // 最低賃金 W = 65 (P*=50 の上)
      // 取引量は Q1 = 35 に制限される。
      
      // 消費者余剰 (A) 
      const cs = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      cs.setAttribute("points", `${getX(10)},${getY(90)} ${getX(35)},${getY(65)} ${getX(10)},${getY(65)}`);
      cs.setAttribute("class", "surplus-consumer");
      svg.appendChild(cs);

      // 生産者余剰 (B+C)
      const ps = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      ps.setAttribute("points", `${getX(10)},${getY(10)} ${getX(35)},${getY(35)} ${getX(35)},${getY(65)} ${getX(10)},${getY(65)}`);
      ps.setAttribute("class", "surplus-producer");
      svg.appendChild(ps);

      // 死荷重 (D+F) - 取引されなくなった部分の損失
      const dw = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      dw.setAttribute("points", `${getX(35)},${getY(65)} ${getX(50)},${getY(50)} ${getX(35)},${getY(35)}`);
      dw.setAttribute("class", "deadweight-loss");
      svg.appendChild(dw);

      // 需要曲線 (D: 企業)
      const d = document.createElementNS("http://www.w3.org/2000/svg", "line");
      d.setAttribute("x1", getX(10)); d.setAttribute("y1", getY(90));
      d.setAttribute("x2", getX(90)); d.setAttribute("y2", getY(10));
      d.setAttribute("class", "demand-curve");
      svg.appendChild(d);

      // 供給曲線 (S: 労働者)
      const s = document.createElementNS("http://www.w3.org/2000/svg", "line");
      s.setAttribute("x1", getX(10)); s.setAttribute("y1", getY(10));
      s.setAttribute("x2", getX(90)); s.setAttribute("y2", getY(90));
      s.setAttribute("class", "supply-curve");
      svg.appendChild(s);

      // 最低賃金の規制線 W
      const wLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      wLine.setAttribute("x1", getX(0)); wLine.setAttribute("y1", getY(65));
      wLine.setAttribute("x2", getX(80)); wLine.setAttribute("y2", getY(65));
      wLine.setAttribute("stroke", "var(--color-error)");
      wLine.setAttribute("stroke-width", "2");
      wLine.setAttribute("stroke-dasharray", "5,5");
      svg.appendChild(wLine);

      const wText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      wText.setAttribute("x", getX(80) + 5); wText.setAttribute("y", getY(65) + 4);
      wText.setAttribute("fill", "var(--color-error)");
      wText.textContent = "最低賃金 (W)";
      svg.appendChild(wText);

      // 規制下の需要量 Q1 と供給量 Q2
      drawDashedGuide(35, 65, "Q1 (需要量)", "");
      drawDashedGuide(65, 65, "Q2 (供給量)", "");

      // アルファベット
      const textA = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textA.setAttribute("x", getX(15)); textA.setAttribute("y", getY(75));
      textA.textContent = "A";
      svg.appendChild(textA);

      const textB = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textB.setAttribute("x", getX(20)); textB.setAttribute("y", getY(58));
      textB.textContent = "B";
      svg.appendChild(textB);

      const textC = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textC.setAttribute("x", getX(20)); textC.setAttribute("y", getY(42));
      textC.textContent = "C";
      svg.appendChild(textC);

      const textD = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textD.setAttribute("x", getX(42)); textD.setAttribute("y", getY(54));
      textD.textContent = "D";
      svg.appendChild(textD);

      const textF = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textF.setAttribute("x", getX(42)); textF.setAttribute("y", getY(46));
      textF.textContent = "F";
      svg.appendChild(textF);

      // 超過供給ブラケット（失業）
      const bracket = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bracket.setAttribute("d", `M ${getX(35)} ${getY(65)-15} L ${getX(35)} ${getY(65)-25} L ${getX(65)} ${getY(65)-25} L ${getX(65)} ${getY(65)-15}`);
      bracket.setAttribute("stroke", "var(--text-primary)");
      bracket.setAttribute("stroke-width", "1");
      bracket.setAttribute("fill", "none");
      svg.appendChild(bracket);

      const unempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      unempText.setAttribute("x", getX(43)); unempText.setAttribute("y", getY(65) - 30);
      unempText.setAttribute("font-size", "10px");
      unempText.textContent = "超過供給（失業）";
      svg.appendChild(unempText);

      drawLegend([
        { color: "rgba(59, 130, 246, 0.25)", label: "消費者余剰 (A: 減少)" },
        { color: "rgba(236, 72, 153, 0.25)", label: "生産者余剰 (B+C: 労働者へ配分)" },
        { color: "rgba(148, 163, 184, 0.35)", label: "死荷重 (D+F: 余剰の純損失)" }
      ]);

    } else if (type === "negative-externality") {
      graphTitle.textContent = "負の外部性のある市場とピグー税";
      drawBaseAxes();

      // 需要曲線 D
      const d = document.createElementNS("http://www.w3.org/2000/svg", "line");
      d.setAttribute("x1", getX(10)); d.setAttribute("y1", getY(85));
      d.setAttribute("x2", getX(90)); d.setAttribute("y2", getY(15));
      d.setAttribute("class", "demand-curve");
      svg.appendChild(d);

      // 私的限界費用 (PMC)
      const pmc = document.createElementNS("http://www.w3.org/2000/svg", "line");
      pmc.setAttribute("x1", getX(10)); pmc.setAttribute("y1", getY(15));
      pmc.setAttribute("x2", getX(90)); pmc.setAttribute("y2", getY(65));
      pmc.setAttribute("class", "supply-curve");
      svg.appendChild(pmc);
      
      const pmcText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      pmcText.setAttribute("x", getX(90) + 5); pmcText.setAttribute("y", getY(65));
      pmcText.textContent = "私的費用 (PMC)";
      svg.appendChild(pmcText);

      // 社会的限界費用 (SMC = PMC + 外部費用)
      const smc = document.createElementNS("http://www.w3.org/2000/svg", "line");
      smc.setAttribute("x1", getX(10)); smc.setAttribute("y1", getY(40));
      smc.setAttribute("x2", getX(90)); smc.setAttribute("y2", getY(90));
      smc.setAttribute("stroke", "var(--color-secondary)");
      smc.setAttribute("stroke-width", "3");
      smc.setAttribute("fill", "none");
      svg.appendChild(smc);

      const smcText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      smcText.setAttribute("x", getX(90) + 5); smcText.setAttribute("y", getY(90));
      smcText.textContent = "社会的費用 (SMC)";
      svg.appendChild(smcText);

      // 私的均衡点 E1
      // 交点は (62.5, 39) あたり
      const q1 = 62.5;
      const p1 = 39;
      
      // 社会的最適点 E*
      // 交点は (48, 51) あたり
      const qStar = 48;
      const pStar = 51;

      // 死荷重 (H) のポリゴン (E*, E1でのSMC上の点, E1の交点)
      // PMC上のE1 (q1, p1) に対応するSMC上のY座標は p1 + 25 = 64
      const hSurplus = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      hSurplus.setAttribute("points", `${getX(qStar)},${getY(pStar)} ${getX(q1)},${getY(p1)} ${getX(q1)},${getY(p1+25)}`);
      hSurplus.setAttribute("class", "deadweight-loss");
      svg.appendChild(hSurplus);

      const hText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      hText.setAttribute("x", getX(57)); hText.setAttribute("y", getY(50));
      hText.setAttribute("font-weight", "bold");
      hText.textContent = "H (死荷重)";
      svg.appendChild(hText);

      // ガイド線
      drawDashedGuide(q1, p1, "q1 (過大生産)", "p1");
      drawDashedGuide(qStar, pStar, "q* (最適量)", "p*");

      // 均衡点プロット
      const eq1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eq1.setAttribute("cx", getX(q1)); eq1.setAttribute("cy", getY(p1));
      eq1.setAttribute("r", "4");
      eq1.setAttribute("fill", "var(--text-muted)");
      svg.appendChild(eq1);

      const eqStar = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eqStar.setAttribute("cx", getX(qStar)); eqStar.setAttribute("cy", getY(pStar));
      eqStar.setAttribute("class", "equilibrium-point");
      svg.appendChild(eqStar);

      const eqStarText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      eqStarText.setAttribute("x", getX(qStar) - 20); eqStarText.setAttribute("y", getY(pStar) - 10);
      eqStarText.textContent = "E* (最適)";
      svg.appendChild(eqStarText);

      // ピグー税の矢印 (解答後または解説時に強調表示)
      if (solved) {
        const taxArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
        taxArrow.setAttribute("d", `M ${getX(30)} ${getY(27.5)} L ${getX(30)} ${getY(52.5)}`);
        taxArrow.setAttribute("stroke", "var(--color-success)");
        taxArrow.setAttribute("stroke-width", "3");
        taxArrow.setAttribute("marker-end", "url(#arrow-tax)");
        svg.appendChild(taxArrow);

        // 矢印定義
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", "arrow-tax");
        marker.setAttribute("viewBox", "0 0 10 10");
        marker.setAttribute("refX", "5"); marker.setAttribute("refY", "5");
        marker.setAttribute("markerWidth", "5"); marker.setAttribute("markerHeight", "5");
        marker.setAttribute("orient", "auto-start-reverse");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        path.setAttribute("fill", "var(--color-success)");
        marker.appendChild(path);
        defs.appendChild(marker);
        svg.appendChild(defs);

        const taxText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        taxText.setAttribute("x", getX(33)); taxText.setAttribute("y", getY(40));
        taxText.setAttribute("fill", "var(--color-success)");
        taxText.setAttribute("font-weight", "bold");
        taxText.textContent = "ピグー税";
        svg.appendChild(taxText);
      }

      drawLegend([
        { color: "var(--color-primary)", label: "需要曲線 / 限界便益 (D)" },
        { color: "var(--color-accent)", label: "私的限界費用 (PMC: 企業負担)" },
        { color: "var(--color-secondary)", label: "社会的限界費用 (SMC: 外部費用込み)" },
        { color: "rgba(148, 163, 184, 0.35)", label: "死荷重 (H)" }
      ]);
    }
  }

  // ------------------------------------------------------------------------
  // 8. テーマ切り替え機能 (ダーク/ライト)
  // ------------------------------------------------------------------------
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = (currentTheme === "dark") ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    
    // 現在のグラフがあれば再描画してカラーテーマを合わせる
    const q = currentQuestions[currentIndex];
    if (q && q.graph && screens.learning.classList.contains("active")) {
      drawGraph(q.graph, btnSubmit.classList.contains("hidden"));
    }
  }

  // ------------------------------------------------------------------------
  // 9. イベントリスナのバインド
  // ------------------------------------------------------------------------
  if (btnQuiz) {
    btnQuiz.addEventListener("click", () => startMode("quiz"));
    const innerQuizBtn = btnQuiz.querySelector(".btn");
    if (innerQuizBtn) innerQuizBtn.addEventListener("click", (e) => { e.stopPropagation(); startMode("quiz"); });
  }

  if (btnFlashcards) {
    btnFlashcards.addEventListener("click", () => startMode("flashcards"));
    const innerFlashBtn = btnFlashcards.querySelector(".btn");
    if (innerFlashBtn) innerFlashBtn.addEventListener("click", (e) => { e.stopPropagation(); startMode("flashcards"); });
  }
  
  btnBackHome.addEventListener("click", () => switchScreen("home"));
  btnLogoHome.addEventListener("click", () => switchScreen("home"));
  btnResultToHome.addEventListener("click", () => switchScreen("home"));

  btnSubmit.addEventListener("click", checkAnswer);
  btnNext.addEventListener("click", handleNext);
  btnThemeToggle.addEventListener("click", toggleTheme);

  btnRestartQuiz.addEventListener("click", () => {
    startMode(currentMode);
  });

  // チートシートモードのボタン
  const btnCheatsheet = document.getElementById("card-mode-cheatsheet");
  if (btnCheatsheet) {
    btnCheatsheet.addEventListener("click", () => switchScreen("cheatsheet"));
    const cheatBtn = btnCheatsheet.querySelector(".btn-cheat");
    if (cheatBtn) cheatBtn.addEventListener("click", (e) => { e.stopPropagation(); switchScreen("cheatsheet"); });
  }

  // チートシート「ホームへ戻る」ボタン
  const btnCheatsheetBack = document.getElementById("btn-cheatsheet-back");
  if (btnCheatsheetBack) {
    btnCheatsheetBack.addEventListener("click", () => switchScreen("home"));
  }

  // チートシートのタブ切り替え
  const cheatsheetTabs = document.getElementById("cheatsheet-tabs");
  if (cheatsheetTabs) {
    cheatsheetTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".cs-tab");
      if (!tab) return;
      // タブをアクティブ化
      document.querySelectorAll(".cs-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      // 対応パネルを表示
      const targetId = tab.dataset.tab;
      document.querySelectorAll(".cs-panel").forEach(p => p.classList.remove("active"));
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add("active");
    });
  }

  // ------------------------------------------------------------------------
  // 10. 問題一覧ナビゲーター機能
  // ------------------------------------------------------------------------
  function renderNavigator() {
    if (!navGridContainer) return;
    navGridContainer.innerHTML = "";
    currentQuestions.forEach((q, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-item";
      btn.textContent = idx + 1;
      
      // 解答状態のクラス付与
      const status = questionStatuses[q.id];
      if (status === "correct") {
        btn.classList.add("correct");
      } else if (status === "wrong") {
        btn.classList.add("wrong");
      }
      
      if (idx === currentIndex) {
        btn.classList.add("current");
      }
      
      btn.addEventListener("click", () => {
        currentIndex = idx;
        showQuestion();
        navModal.classList.remove("active");
      });
      
      navGridContainer.appendChild(btn);
    });
  }

  if (btnOpenNav) {
    btnOpenNav.addEventListener("click", () => {
      renderNavigator();
      navModal.classList.add("active");
    });
  }
  if (btnCloseNav) {
    btnCloseNav.addEventListener("click", () => {
      navModal.classList.remove("active");
    });
  }
  if (navModal) {
    navModal.addEventListener("click", (e) => {
      if (e.target === navModal) {
        navModal.classList.remove("active");
      }
    });
  }

  // ブックマークのトグル処理
  if (btnBookmark) {
    btnBookmark.addEventListener("click", () => {
      const q = currentQuestions[currentIndex];
      if (!q) return;

      if (bookmarks.includes(q.id)) {
        bookmarks = bookmarks.filter(id => id !== q.id);
        btnBookmark.classList.remove("active");
      } else {
        bookmarks.push(q.id);
        btnBookmark.classList.add("active");
      }
      localStorage.setItem("econ_bookmarks", JSON.stringify(bookmarks));
      updateHomeStats();
    });
  }

  // 復習モード開始
  if (btnStartReview) {
    btnStartReview.addEventListener("click", () => {
      const filterVal = reviewTypeSelect ? reviewTypeSelect.value : "all";
      startMode("review", filterVal);
    });
  }
});
