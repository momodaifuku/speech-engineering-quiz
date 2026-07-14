document.addEventListener("DOMContentLoaded", () => {
  // テーマの復元 (ポータルと共通の 'theme' キーを使用)
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  function safeJSONParse(key, defaultValue) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.warn("localStorage parse error for key:", key, e);
      return defaultValue;
    }
  }

  let currentQuestions = [];
  let currentIndex = 0;
  let currentMode = "flashcards";

  // 永続化データ
  let bookmarks = safeJSONParse("econ_term1_bookmarks", []);
  let wrongs = safeJSONParse("econ_term1_wrongs", []);
  let totalAnswered = parseInt(localStorage.getItem("econ_term1_total_answered")) || 0;
  let totalCorrect = parseInt(localStorage.getItem("econ_term1_total_correct")) || 0;
  let currentStreak = parseInt(localStorage.getItem("econ_term1_streak")) || 0;

  // 全問題プール
  const allQuestionsPool = (window.quizData && window.quizData.quiz) ? window.quizData.quiz : [];

  // DOM要素
  const screens = {
    home: document.getElementById("screen-home"),
    learning: document.getElementById("screen-learning"),
    result: document.getElementById("screen-result")
  };

  const btnFlashcards = document.getElementById("card-mode-flashcards");
  const btnReview = document.getElementById("btn-start-review");
  const btnBackHome = document.getElementById("btn-back-home");
  const btnLogoHome = document.getElementById("btn-logo-home");
  const btnResultToHome = document.getElementById("btn-result-to-home");
  const btnRestartQuiz = document.getElementById("btn-restart-quiz");
  
  const btnShowAnswer = document.getElementById("btn-show-answer");
  const btnNext = document.getElementById("btn-next");
  const btnEvalCorrect = document.getElementById("btn-eval-correct");
  const btnEvalWrong = document.getElementById("btn-eval-wrong");
  const btnBookmark = document.getElementById("btn-bookmark");
  const themeToggle = document.getElementById("theme-toggle");
  
  function switchScreen(screenKey) {
    Object.keys(screens).forEach(key => screens[key] && screens[key].classList.remove("active"));
    if (screens[screenKey]) screens[screenKey].classList.add("active");
    if (screenKey === "home") updateHomeStats();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateHomeStats() {
    if (document.getElementById("stat-bookmarks-count")) document.getElementById("stat-bookmarks-count").textContent = bookmarks.length;
    if (document.getElementById("card-stat-bookmarks-count")) document.getElementById("card-stat-bookmarks-count").textContent = bookmarks.length;
    if (document.getElementById("stat-wrongs-count")) document.getElementById("stat-wrongs-count").textContent = wrongs.length;
    if (document.getElementById("card-stat-wrongs-count")) document.getElementById("card-stat-wrongs-count").textContent = wrongs.length;
    if (document.getElementById("stat-total-answered")) document.getElementById("stat-total-answered").textContent = totalAnswered;
    if (document.getElementById("stat-correct-rate")) {
      const rate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
      document.getElementById("stat-correct-rate").textContent = rate + "%";
    }
    if (document.getElementById("stat-streak")) document.getElementById("stat-streak").textContent = currentStreak;
  }

  function startMode(mode) {
    currentMode = mode;
    currentIndex = 0;
    let questionsSrc = [];
    const modeNameIndicator = document.getElementById("current-mode-name");

    if (mode === "flashcards") {
      questionsSrc = [...allQuestionsPool];
      if (modeNameIndicator) modeNameIndicator.textContent = "一問一答モード";
    } else if (mode === "review") {
      const reviewFilter = document.getElementById("review-type") ? document.getElementById("review-type").value : "all";
      if (reviewFilter === "bookmark") {
        questionsSrc = allQuestionsPool.filter(q => bookmarks.includes(q.id));
        if (modeNameIndicator) modeNameIndicator.textContent = "復習：ブックマーク";
      } else if (reviewFilter === "wrong") {
        questionsSrc = allQuestionsPool.filter(q => wrongs.includes(q.id));
        if (modeNameIndicator) modeNameIndicator.textContent = "復習：間違えた問題";
      } else {
        const combinedIds = Array.from(new Set([...bookmarks, ...wrongs]));
        questionsSrc = allQuestionsPool.filter(q => combinedIds.includes(q.id));
        if (modeNameIndicator) modeNameIndicator.textContent = "復習：すべて";
      }
      if (questionsSrc.length === 0) {
        alert("対象の問題がありません！ブックマークを追加するか間違えた問題を作ってください。");
        switchScreen("home");
        return;
      }
    }

    const shuffleToggle = document.getElementById("shuffle-toggle");
    if (shuffleToggle && shuffleToggle.checked) {
      currentQuestions = questionsSrc.sort(() => Math.random() - 0.5);
    } else {
      currentQuestions = questionsSrc;
    }

    switchScreen("learning");
    showQuestion();
  }

  function showQuestion() {
    const feedbackCard = document.getElementById("feedback-card");
    const evalContainer = document.getElementById("self-eval-container");
    
    if (feedbackCard) feedbackCard.classList.add("hidden");
    if (evalContainer) evalContainer.classList.add("hidden");
    if (btnShowAnswer) btnShowAnswer.classList.remove("hidden");
    if (btnNext) btnNext.classList.add("hidden");

    const q = currentQuestions[currentIndex];
    if (!q) return;

    if (btnBookmark) {
      if (bookmarks.includes(q.id)) {
        btnBookmark.classList.add("active");
      } else {
        btnBookmark.classList.remove("active");
      }
    }

    const total = currentQuestions.length;
    if (document.getElementById("quiz-progress-text")) {
      document.getElementById("quiz-progress-text").textContent = `問題 ${currentIndex + 1} / ${total}`;
    }
    if (document.getElementById("quiz-progress-bar")) {
      document.getElementById("quiz-progress-bar").style.width = `${((currentIndex) / total) * 100}%`;
    }

    document.getElementById("question-text").textContent = q.question;
    
    const optionsContainer = document.getElementById("options-container");
    if (optionsContainer) {
      if (q.options && q.options.length > 0) {
        optionsContainer.classList.remove("hidden");
        optionsContainer.innerHTML = "";
        q.options.forEach((opt, idx) => {
          const div = document.createElement("div");
          div.className = "option-item";
          div.style.padding = "12px 16px";
          div.style.border = "2px solid rgba(255,255,255,0.1)";
          div.style.borderRadius = "8px";
          div.style.marginBottom = "8px";
          div.style.cursor = "pointer";
          div.style.transition = "all 0.2s ease";
          div.textContent = opt;
          
          // 選択肢のクリックイベント
          div.addEventListener("click", (e) => {
            e.preventDefault();
            div.classList.toggle("selected");
            if (div.classList.contains("selected")) {
              div.style.borderColor = "var(--accent-blue)";
              div.style.backgroundColor = "rgba(0, 168, 255, 0.1)";
            } else {
              div.style.borderColor = "rgba(255,255,255,0.1)";
              div.style.backgroundColor = "transparent";
            }
          });
          
          optionsContainer.appendChild(div);
        });
      } else {
        optionsContainer.classList.add("hidden");
        optionsContainer.innerHTML = "";
      }
    }
  }

  function revealAnswer() {
    const q = currentQuestions[currentIndex];
    if (btnShowAnswer) btnShowAnswer.classList.add("hidden");
    
    const feedbackCard = document.getElementById("feedback-card");
    if (feedbackCard) feedbackCard.classList.remove("hidden");
    
    const evalContainer = document.getElementById("self-eval-container");
    if (evalContainer) evalContainer.classList.remove("hidden");
    
    if (document.getElementById("answer-text")) {
      document.getElementById("answer-text").textContent = q.answer;
    }
    
    const expContainer = document.getElementById("explanation-container");
    if (expContainer) {
      if (q.explanation) {
        expContainer.classList.remove("hidden");
        document.getElementById("explanation-text").textContent = q.explanation;
      } else {
        expContainer.classList.add("hidden");
      }
    }
  }

  function handleSelfEval(isCorrect) {
    const q = currentQuestions[currentIndex];
    totalAnswered++;
    if (isCorrect) {
      totalCorrect++;
      currentStreak++;
      wrongs = wrongs.filter(id => id !== q.id);
    } else {
      currentStreak = 0;
      if (!wrongs.includes(q.id)) {
        wrongs.push(q.id);
      }
    }

    localStorage.setItem("econ_term1_wrongs", JSON.stringify(wrongs));
    localStorage.setItem("econ_term1_total_answered", totalAnswered);
    localStorage.setItem("econ_term1_total_correct", totalCorrect);
    localStorage.setItem("econ_term1_streak", currentStreak);

    const evalContainer = document.getElementById("self-eval-container");
    if (evalContainer) evalContainer.classList.add("hidden");
    if (btnNext) btnNext.classList.remove("hidden");
  }

  function handleNext() {
    currentIndex++;
    if (currentIndex >= currentQuestions.length) {
      finishMode();
    } else {
      showQuestion();
    }
  }

  function finishMode() {
    switchScreen("result");
    if (document.getElementById("result-score")) {
      document.getElementById("result-score").textContent = `${totalCorrect}/${totalAnswered}`;
    }
    if (document.getElementById("quiz-progress-bar")) {
      document.getElementById("quiz-progress-bar").style.width = `100%`;
    }
  }

  function toggleBookmark() {
    const q = currentQuestions[currentIndex];
    if (!q) return;
    if (bookmarks.includes(q.id)) {
      bookmarks = bookmarks.filter(id => id !== q.id);
      btnBookmark.classList.remove("active");
    } else {
      bookmarks.push(q.id);
      btnBookmark.classList.add("active");
    }
    localStorage.setItem("econ_term1_bookmarks", JSON.stringify(bookmarks));
  }

  function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  // --- Event Listeners (Safeguarded with preventDefault) ---
  if (btnFlashcards) {
    btnFlashcards.addEventListener("click", (e) => { e.preventDefault(); startMode("flashcards"); });
    const innerBtn = btnFlashcards.querySelector(".btn");
    if (innerBtn) innerBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); startMode("flashcards"); });
  }

  if (btnReview) btnReview.addEventListener("click", (e) => { e.preventDefault(); startMode("review"); });
  
  if (btnBackHome) btnBackHome.addEventListener("click", (e) => { e.preventDefault(); switchScreen("home"); });
  if (btnLogoHome) btnLogoHome.addEventListener("click", (e) => { e.preventDefault(); switchScreen("home"); });
  if (btnResultToHome) btnResultToHome.addEventListener("click", (e) => { e.preventDefault(); switchScreen("home"); });
  if (btnRestartQuiz) btnRestartQuiz.addEventListener("click", (e) => { e.preventDefault(); startMode(currentMode); });
  
  if (btnShowAnswer) btnShowAnswer.addEventListener("click", (e) => { e.preventDefault(); revealAnswer(); });
  if (btnEvalCorrect) btnEvalCorrect.addEventListener("click", (e) => { e.preventDefault(); handleSelfEval(true); });
  if (btnEvalWrong) btnEvalWrong.addEventListener("click", (e) => { e.preventDefault(); handleSelfEval(false); });
  if (btnNext) btnNext.addEventListener("click", (e) => { e.preventDefault(); handleNext(); });
  
  if (btnBookmark) btnBookmark.addEventListener("click", (e) => { e.preventDefault(); toggleBookmark(); });
  if (themeToggle) themeToggle.addEventListener("click", (e) => { e.preventDefault(); toggleTheme(); });

  updateHomeStats();
});
