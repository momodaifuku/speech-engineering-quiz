// --- Local Storage Keys ---
const STORAGE_KEYS = {
  HISTORY: "hcd_study_history", // { questionId: "correct" | "wrong" }
  BOOKMARKS: "hcd_bookmarks",   // [questionId, ...]
  WRONG_LIST: "hcd_wrong_list"  // [questionId, ...]
};

// --- App State ---
let quizState = {
  activeQuestions: [],
  currentIndex: 0,
  selectedChoiceIndex: null, // For single choice
  userAnswers: [],          // For multiple blanks or essay
  wrongCount: 0
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateHeaderStats();
  renderQuestionList();
  
  // Theme Toggle click event
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleTheme);
  }
});

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  const icon = document.querySelector("#theme-toggle-btn i");
  if (savedTheme === "light") {
    document.documentElement.classList.add("light-mode");
    document.documentElement.setAttribute("data-theme", "light");
    if (icon) {
      icon.className = "fa-solid fa-sun";
    }
  } else {
    document.documentElement.classList.remove("light-mode");
    document.documentElement.setAttribute("data-theme", "dark");
    if (icon) {
      icon.className = "fa-solid fa-moon";
    }
  }
}

function toggleTheme() {
  const isLight = document.documentElement.classList.contains("light-mode");
  const icon = document.querySelector("#theme-toggle-btn i");
  if (isLight) {
    document.documentElement.classList.remove("light-mode");
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    if (icon) icon.className = "fa-solid fa-moon";
  } else {
    document.documentElement.classList.add("light-mode");
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    if (icon) icon.className = "fa-solid fa-sun";
  }
}

// --- Local Storage Helpers ---
function getHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || {};
}

function saveHistory(questionId, status) {
  const history = getHistory();
  history[questionId] = status;
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  
  // Update wrong list
  let wrongList = JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_LIST)) || [];
  if (status === "wrong") {
    if (!wrongList.includes(questionId)) {
      wrongList.push(questionId);
    }
  } else if (status === "correct") {
    wrongList = wrongList.filter(id => id !== questionId);
  }
  localStorage.setItem(STORAGE_KEYS.WRONG_LIST, JSON.stringify(wrongList));
  updateHeaderStats();
}

function getBookmarks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) || [];
}

function toggleBookmark(questionId) {
  let bookmarks = getBookmarks();
  if (bookmarks.includes(questionId)) {
    bookmarks = bookmarks.filter(id => id !== questionId);
  } else {
    bookmarks.push(questionId);
  }
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  updateHeaderStats();
  return bookmarks.includes(questionId);
}

// --- Header Stats ---
function updateHeaderStats() {
  const bookmarks = getBookmarks();
  const wrongList = JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_LIST)) || [];
  
  const bCount = document.querySelector("#header-bookmark-count .count");
  const wCount = document.querySelector("#header-wrong-count .count");
  
  if (bCount) bCount.textContent = bookmarks.length;
  if (wCount) wCount.textContent = wrongList.length;
}

// --- Question List Render (Home Screen) ---
function renderQuestionList() {
  const container = document.getElementById("question-list-container");
  if (!container) return;
  
  container.innerHTML = "";
  const history = getHistory();
  const bookmarks = getBookmarks();
  
  questions.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.className = "q-select-btn";
    btn.onclick = () => startQuizFromQuestion(index);
    
    // Status Icon
    let statusIcon = "";
    if (history[q.id] === "correct") {
      statusIcon = '<i class="fa-solid fa-circle-check"></i>';
    } else if (history[q.id] === "wrong") {
      statusIcon = '<i class="fa-solid fa-circle-xmark"></i>';
    } else {
      statusIcon = '<i class="fa-regular fa-circle"></i>';
    }
    
    // Bookmark marker
    const bookmarkStar = bookmarks.includes(q.id) ? ' <i class="fa-solid fa-star" style="color: var(--neon-yellow);"></i>' : '';
    
    btn.innerHTML = `
      <span class="q-num">${q.title.split(" ")[0]} ${q.title.split(" ")[1]}</span>
      <span class="q-title">${q.title}${bookmarkStar}</span>
      <span class="q-status">${statusIcon}</span>
    `;
    container.appendChild(btn);
  });
}

// --- Quiz Flow Controls ---
function startQuiz(mode, categoryName = null) {
  const bookmarks = getBookmarks();
  const wrongList = JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_LIST)) || [];
  
  let list = [];
  if (mode === "all") {
    list = [...questions];
  } else if (mode === "category") {
    // Map HCD main categories to HCD fields in questions
    if (categoryName === "hcd_process") {
      list = questions.filter(q => ["hcd_process", "principles", "user_evaluation"].includes(q.category));
    } else if (categoryName === "ux_periods") {
      list = questions.filter(q => ["ux_periods", "user_analysis", "user_model", "essay_ux"].includes(q.category));
    } else if (categoryName === "usability_def") {
      list = questions.filter(q => ["usability_def", "context_of_use", "essay_context"].includes(q.category));
    } else if (categoryName === "evaluation_methods") {
      list = questions.filter(q => ["evaluation_methods", "ka_method"].includes(q.category));
    } else {
      list = questions.filter(q => q.category === categoryName);
    }
  } else if (mode === "wrong") {
    list = questions.filter(q => wrongList.includes(q.id));
  } else if (mode === "bookmarked") {
    list = questions.filter(q => bookmarks.includes(q.id));
  }
  
  if (list.length === 0) {
    alert("該当する問題がありません！");
    return;
  }
  
  quizState.activeQuestions = list;
  quizState.currentIndex = 0;
  quizState.wrongCount = 0;
  
  switchScreen("screen-quiz");
  showQuestion(0);
}

function startQuizFromQuestion(questionIndex) {
  quizState.activeQuestions = [...questions];
  quizState.currentIndex = questionIndex;
  quizState.wrongCount = 0;
  
  switchScreen("screen-quiz");
  showQuestion(questionIndex);
}

function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
  
  if (screenId === "screen-home") {
    renderQuestionList();
  }
}

function goToHome() {
  if (confirm("学習を中断してホームに戻りますか？")) {
    switchScreen("screen-home");
  }
}

// --- Question Presentation ---
function showQuestion(index) {
  const q = quizState.activeQuestions[index];
  if (!q) return;
  
  // Progress Bar & Info
  const progressText = document.getElementById("quiz-progress-text");
  const progressBar = document.getElementById("quiz-progress-bar");
  const categoryBadge = document.getElementById("quiz-category-badge");
  
  progressText.textContent = `${index + 1} / ${quizState.activeQuestions.length}`;
  progressBar.style.width = `${((index + 1) / quizState.activeQuestions.length) * 100}%`;
  
  // Format Category Label
  const categoryMap = {
    hcd_process: "HCDプロセス",
    ux_periods: "UX期間モデル",
    usability_def: "ユーザビリティの定義",
    principles: "HCDの原則",
    context_of_use: "利用状況の定義",
    user_evaluation: "ユーザー評価",
    user_analysis: "ユーザー分析",
    user_model: "ユーザーモデル",
    evaluation_methods: "評価手法",
    ka_method: "KA法",
    essay_ux: "UXとUXDの違い",
    essay_context: "利用状況の記述"
  };
  categoryBadge.textContent = categoryMap[q.category] || "人間中心設計";
  
  // Bookmark state
  const bookmarks = getBookmarks();
  const btnBookmark = document.getElementById("btn-bookmark");
  if (bookmarks.includes(q.id)) {
    btnBookmark.classList.add("active");
    btnBookmark.innerHTML = '<i class="fa-solid fa-star"></i>';
  } else {
    btnBookmark.classList.remove("active");
    btnBookmark.innerHTML = '<i class="fa-regular fa-star"></i>';
  }
  
  // Question text
  document.getElementById("quiz-question-title").textContent = q.title;
  
  // Resolve base path dynamically to support folder redirects and file:// loading
  let questionHtml = q.question;
  let basePath = "";
  const href = window.location.href;
  
  if (href.startsWith("file://")) {
    basePath = href.substring(0, href.lastIndexOf("/") + 1);
  } else {
    let path = window.location.pathname;
    if (path.endsWith(".html")) {
      path = path.substring(0, path.lastIndexOf("/") + 1);
    }
    if (!path.endsWith("/人間中心設計テスト/")) {
      if (path.endsWith("/人間中心設計テスト")) {
        path = path + "/";
      } else {
        path = path + "人間中心設計テスト/";
      }
    }
    basePath = path;
  }
  
  questionHtml = questionHtml.replace(/extracted_images\//g, basePath + "extracted_images/");
  document.getElementById("quiz-question-text").innerHTML = questionHtml;
  
  // Clean feedback card
  document.getElementById("quiz-feedback-card").classList.add("hidden");
  document.getElementById("btn-submit-answer").classList.remove("hidden");
  document.getElementById("keyword-feedback-area").classList.add("hidden");
  
  // Reset state variables
  quizState.selectedChoiceIndex = null;
  quizState.userAnswers = [];
  
  renderAnswerArea(q);

  // Trigger MathJax rendering
  if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
    window.MathJax.typesetPromise();
  }
}

function renderAnswerArea(q) {
  const container = document.getElementById("quiz-answer-area");
  container.innerHTML = "";
  
  if (q.type === "choice") {
    const listDiv = document.createElement("div");
    listDiv.className = "choice-btn-list";
    
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.innerHTML = `
        <span class="choice-bullet"></span>
        <span class="choice-text">${choice}</span>
      `;
      btn.onclick = () => selectChoice(idx + 1, btn);
      listDiv.appendChild(btn);
    });
    
    container.appendChild(listDiv);
  } 
  else if (q.type === "fill_blanks") {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "10px";
    
    q.blanks.forEach((blank, idx) => {
      const row = document.createElement("div");
      row.className = "blank-item-row";
      
      const label = document.createElement("span");
      label.className = "blank-label";
      label.textContent = blank.label;
      
      const select = document.createElement("select");
      select.className = "blank-select";
      select.id = `blank-select-${idx}`;
      
      // Default placeholder
      const optDefault = document.createElement("option");
      optDefault.value = "";
      optDefault.textContent = "-- 選択肢を選ぶ --";
      select.appendChild(optDefault);
      
      q.choices.forEach(choice => {
        const opt = document.createElement("option");
        opt.value = choice.split(".")[0].trim(); // Index number
        opt.textContent = choice;
        select.appendChild(opt);
      });
      
      row.appendChild(label);
      row.appendChild(select);
      wrapper.appendChild(row);
    });
    
    container.appendChild(wrapper);
  } 
  else if (q.type === "essay") {
    if (q.id === "q10_1") {
      // Special HCD KA card question with 2 inputs (Voice and Value)
      const kaBox = document.createElement("div");
      kaBox.className = "ka-card-inputs";
      kaBox.innerHTML = `
        <div class="ka-input-group">
          <label>心の声（ユーザーの主観的・一人称の本音）</label>
          <textarea id="ka-voice-input" class="essay-textarea ka-textarea" placeholder="心の声を入力してください... (例：〜したいが、〜は面倒だ)"></textarea>
        </div>
        <div class="ka-input-group" style="margin-top: 15px;">
          <label>価値（本質的・客観的価値、名詞止め）</label>
          <textarea id="ka-value-input" class="essay-textarea ka-textarea" placeholder="本質的価値を入力してください... (例：〜という価値、〜な嬉しさ)"></textarea>
        </div>
      `;
      container.appendChild(kaBox);
    } else {
      // Regular essay question
      const textarea = document.createElement("textarea");
      textarea.className = "essay-textarea";
      textarea.placeholder = "200〜400文字程度を目安に回答を入力してください。解答後にキーワード判定と模範解答が表示されます...";
      textarea.id = "essay-input";
      container.appendChild(textarea);
    }
  }
}

function selectChoice(index, btn) {
  quizState.selectedChoiceIndex = index;
  document.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
}

function toggleBookmarkCurrent() {
  const q = quizState.activeQuestions[quizState.currentIndex];
  if (!q) return;
  const isBookmarked = toggleBookmark(q.id);
  const btnBookmark = document.getElementById("btn-bookmark");
  
  if (isBookmarked) {
    btnBookmark.classList.add("active");
    btnBookmark.innerHTML = '<i class="fa-solid fa-star"></i>';
  } else {
    btnBookmark.classList.remove("active");
    btnBookmark.innerHTML = '<i class="fa-regular fa-star"></i>';
  }
}

// --- Answer Verification ---
function submitAnswer() {
  const q = quizState.activeQuestions[quizState.currentIndex];
  if (!q) return;
  
  let isCorrect = false;
  let userAnsStr = "";
  let correctAnsStr = "";
  
  const feedbackStatus = document.getElementById("feedback-status");
  const feedbackStatusText = document.getElementById("feedback-status-text");
  const feedbackUserAns = document.getElementById("feedback-user-answer");
  const feedbackCorrectAns = document.getElementById("feedback-correct-answer");
  const feedbackExplanation = document.getElementById("feedback-explanation-text");
  
  const userBox = document.getElementById("comparison-user-box");
  const correctBox = document.getElementById("comparison-correct-box");
  
  // 1. Single Choice Verification
  if (q.type === "choice") {
    if (quizState.selectedChoiceIndex === null) {
      alert("選択肢を選んでください！");
      return;
    }
    
    isCorrect = (quizState.selectedChoiceIndex === q.answer);
    userAnsStr = q.choices[quizState.selectedChoiceIndex - 1];
    correctAnsStr = q.choices[q.answer - 1];
    
    userBox.style.display = "block";
    correctBox.style.display = "block";
  }
  // 2. Multiple Blanks Dropdowns Verification
  else if (q.type === "fill_blanks") {
    let allFilled = true;
    let blankAnswers = [];
    isCorrect = true; // Assume true, check if any is wrong
    
    q.blanks.forEach((blank, idx) => {
      const select = document.getElementById(`blank-select-${idx}`);
      if (!select || select.value === "") {
        allFilled = false;
      } else {
        const val = select.value;
        const correctVal = blank.correct;
        const isBlankCorrect = (val === correctVal);
        
        blankAnswers.push({
          label: blank.label,
          userVal: val,
          correctVal: correctVal,
          isCorrect: isBlankCorrect
        });
        
        if (!isBlankCorrect) {
          isCorrect = false;
        }
      }
    });
    
    if (!allFilled) {
      alert("すべての空欄を選択してください！");
      return;
    }
    
    // Format answers string
    userAnsStr = blankAnswers.map(a => `${a.label}: 選択肢 ${a.userVal} (${a.isCorrect ? '○' : '×'})`).join("<br>");
    correctAnsStr = q.blanks.map(b => `${b.label}: 選択肢 ${b.correct} (${q.choices[parseInt(b.correct) - 1]})`).join("<br>");
    
    userBox.style.display = "block";
    correctBox.style.display = "block";
  }
  // 3. Essay/Text Verification with Keywords Matching
  else if (q.type === "essay") {
    let textInput = "";
    if (q.id === "q10_1") {
      const voice = document.getElementById("ka-voice-input").value.trim();
      const value = document.getElementById("ka-value-input").value.trim();
      if (!voice || !value) {
        alert("心の声と価値の両方を入力してください！");
        return;
      }
      textInput = `【心の声】: ${voice}\n【価値】: ${value}`;
    } else {
      textInput = document.getElementById("essay-input").value.trim();
      if (!textInput) {
        alert("解答を入力してください！");
        return;
      }
    }
    
    // Auto evaluate essay
    const matchResults = checkKeywords(textInput, q.keywords);
    const matchedCount = matchResults.filter(r => r.matched).length;
    
    // If half or more keywords matched, mark as correct (for status count purposes)
    isCorrect = (matchedCount >= Math.ceil(q.keywords.length / 2.5));
    
    userAnsStr = textInput;
    correctAnsStr = q.modelAnswer;
    
    // Show keyword matches UI
    renderKeywordFeedback(matchResults);
    
    userBox.style.display = "block";
    correctBox.style.display = "block";
  }
  
  // Save history state
  saveHistory(q.id, isCorrect ? "correct" : "wrong");
  if (!isCorrect) {
    quizState.wrongCount++;
  }
  
  // Present Feedback Card
  if (isCorrect) {
    feedbackStatus.className = "feedback-status correct";
    feedbackStatusText.textContent = q.type === "essay" ? "判定完了（合格レベル！）" : "正解！";
  } else {
    feedbackStatus.className = "feedback-status wrong";
    feedbackStatusText.textContent = q.type === "essay" ? "判定完了（語句不足・再確認要）" : "不正解...";
  }
  
  feedbackUserAns.innerHTML = userAnsStr.replace(/\n/g, "<br>");
  feedbackCorrectAns.innerHTML = correctAnsStr.replace(/\n/g, "<br>");
  feedbackExplanation.innerHTML = q.explanation;
  
  document.getElementById("quiz-feedback-card").classList.remove("hidden");
  document.getElementById("btn-submit-answer").classList.add("hidden");
  
  // Scroll feedback card into view smoothly
  document.getElementById("quiz-feedback-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Essay Keywords Checker
function checkKeywords(text, keywords) {
  const cleanText = text.toLowerCase();
  return keywords.map(kw => {
    // Basic regex search supporting Japanese boundary matchings
    const regex = new RegExp(kw.toLowerCase(), 'i');
    return {
      word: kw,
      matched: regex.test(cleanText)
    };
  });
}

function renderKeywordFeedback(results) {
  const container = document.getElementById("keyword-match-list");
  container.innerHTML = "";
  
  results.forEach(res => {
    const badge = document.createElement("span");
    badge.className = `keyword-badge ${res.matched ? 'matched' : ''}`;
    badge.innerHTML = `
      <i class="fa-solid ${res.matched ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
      ${res.word}
    `;
    container.appendChild(badge);
  });
  
  document.getElementById("keyword-feedback-area").classList.remove("hidden");
}

// --- Navigation ---
function nextQuestion() {
  quizState.currentIndex++;
  if (quizState.currentIndex < quizState.activeQuestions.length) {
    showQuestion(quizState.currentIndex);
  } else {
    showResults();
  }
}

// --- Result Presentation ---
function showResults() {
  switchScreen("screen-result");
  
  const total = quizState.activeQuestions.length;
  const correctNum = total - quizState.wrongCount;
  const pct = Math.round((correctNum / total) * 100);
  
  document.getElementById("result-score").textContent = correctNum;
  document.getElementById("result-total").textContent = total;
  document.getElementById("result-percentage").textContent = `${pct}%`;
  
  document.getElementById("result-wrong-added").textContent = quizState.wrongCount;
  document.getElementById("result-bookmarks-total").textContent = getBookmarks().length;
}

function restartQuiz() {
  quizState.currentIndex = 0;
  quizState.wrongCount = 0;
  switchScreen("screen-quiz");
  showQuestion(0);
}
