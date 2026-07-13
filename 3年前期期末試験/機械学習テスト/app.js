// --- State & LocalStorage Keys ---
const STORAGE_KEYS = {
  BOOKMARKS: "ml_study_bookmarks",
  WRONG: "ml_study_wrong",
  HISTORY: "ml_study_history" // { questionId: "correct" | "wrong" }
};

let quizState = {
  currentCourse: 'kakomon', // 'kakomon', 'practice'
  currentMode: 'all', // 'all', 'wrong', 'bookmarked', 'category'
  currentCategory: '',
  activeQuestions: [],
  currentIndex: 0,
  score: 0,
  wrongAddedCount: 0,
  userSelection: null, // Used for choice selection index
  isAnswered: false
};

// --- App Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  updateHeaderStats();
  renderQuestionSelector();
  goToHome();
});

// --- LocalStorage Utilities ---
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WRONG)) {
    localStorage.setItem(STORAGE_KEYS.WRONG, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify({}));
  }
}

function getBookmarks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) || [];
}

function getWrongQuestions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG)) || [];
}

function getHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || {};
}

function saveHistory(questionId, status) {
  const history = getHistory();
  history[questionId] = status;
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

function updateHeaderStats() {
  const bookmarks = getBookmarks();
  const wrongs = getWrongQuestions();
  
  // Filter count based on active course
  const activeCourseQuestionIds = questions
    .filter(q => q.source === quizState.currentCourse)
    .map(q => q.id);
  
  const filteredBookmarks = bookmarks.filter(id => activeCourseQuestionIds.includes(id));
  const filteredWrongs = wrongs.filter(id => activeCourseQuestionIds.includes(id));
  
  const bCount = document.querySelector("#header-bookmark-count .count");
  const wCount = document.querySelector("#header-wrong-count .count");
  
  if (bCount) bCount.textContent = filteredBookmarks.length;
  if (wCount) wCount.textContent = filteredWrongs.length;
}

// --- Switch Learning Course (Kakomon vs Practice) ---
function switchCourse(course) {
  // Map UI tabs (final_past / final_lecture) to internal sources (kakomon / practice)
  if (course === 'final_past' || course === 'kakomon') {
    quizState.currentCourse = 'kakomon';
  } else {
    quizState.currentCourse = 'practice';
  }
  
  // Update Tab active classes
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  
  if (quizState.currentCourse === 'kakomon') {
    const tab = document.getElementById("tab-final_past");
    if (tab) tab.classList.add("active");
  } else {
    const tab = document.getElementById("tab-final_lecture");
    if (tab) tab.classList.add("active");
  }
  
  updateHeaderStats();
  renderQuestionSelector();
}

// --- Home Screen: Question Selector ---
function renderQuestionSelector() {
  const container = document.getElementById("question-list-container");
  if (!container) return;
  container.innerHTML = "";
  
  const history = getHistory();
  
  // Filter questions based on selected course
  const activeCourseQuestions = questions.filter(q => q.source === quizState.currentCourse);
  
  activeCourseQuestions.forEach((q) => {
    const btn = document.createElement("button");
    btn.className = "q-select-btn";
    
    // Check solved history and apply styles
    if (history[q.id] === "correct") {
      btn.classList.add("solved-correct");
    } else if (history[q.id] === "wrong") {
      btn.classList.add("solved-wrong");
    }
    
    // Split title to fit nicely (e.g. "過去問 大問1")
    const shortLabel = q.title.split(".")[0];
    
    btn.innerHTML = `
      <span class="q-id">${shortLabel}</span>
      <span class="q-title" title="${q.title}">${q.title}</span>
    `;
    
    btn.onclick = () => {
      startQuizFromQuestion(q.id);
    };
    
    container.appendChild(btn);
  });
}

// --- Screen Navigation ---
function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  
  const target = document.getElementById(screenId);
  target.style.display = "block";
  target.offsetHeight;
  target.classList.add("active");
}

// --- Go to Home Screen ---
function goToHome() {
  switchScreen("screen-home");
  updateHeaderStats();
  renderQuestionSelector();
}

// --- Quiz State Controls ---
function startQuiz(mode, category = '') {
  quizState.currentMode = mode;
  quizState.currentCategory = category;
  quizState.score = 0;
  quizState.wrongAddedCount = 0;
  quizState.currentIndex = 0;
  quizState.isAnswered = false;
  
  const courseQuestions = questions.filter(q => q.source === quizState.currentCourse);
  
  let list = [];
  if (mode === 'all') {
    list = [...courseQuestions];
  } else if (mode === 'category') {
    list = courseQuestions.filter(q => q.category === category);
  } else if (mode === 'wrong') {
    const wrongIds = getWrongQuestions();
    list = courseQuestions.filter(q => wrongIds.includes(q.id));
  } else if (mode === 'bookmarked') {
    const bookmarkedIds = getBookmarks();
    list = courseQuestions.filter(q => bookmarkedIds.includes(q.id));
  }
  
  if (list.length === 0) {
    let msg = "該当する問題がありません。";
    if (mode === 'wrong') msg = "要復習（間違えた）問題はありません！";
    if (mode === 'bookmarked') msg = "ブックマークした問題はありません！";
    alert(msg);
    return;
  }
  
  quizState.activeQuestions = list;
  showQuestion(0);
  switchScreen("screen-quiz");
}

function startQuizFromQuestion(questionId) {
  quizState.currentMode = 'all';
  quizState.currentCategory = '';
  quizState.score = 0;
  quizState.wrongAddedCount = 0;
  quizState.isAnswered = false;
  
  const courseQuestions = questions.filter(q => q.source === quizState.currentCourse);
  quizState.activeQuestions = [...courseQuestions];
  
  const targetIndex = courseQuestions.findIndex(q => q.id === questionId);
  quizState.currentIndex = targetIndex >= 0 ? targetIndex : 0;
  
  showQuestion(quizState.currentIndex);
  switchScreen("screen-quiz");
}

// --- Render Question Details ---
function showQuestion(index) {
  quizState.currentIndex = index;
  quizState.isAnswered = false;
  quizState.userSelection = null;
  
  const q = quizState.activeQuestions[index];
  
  // Progress Info
  const progressPercent = (index / quizState.activeQuestions.length) * 100;
  document.getElementById("quiz-progress-bar").style.width = `${progressPercent}%`;
  document.getElementById("quiz-progress-text").textContent = `${index + 1} / ${quizState.activeQuestions.length}`;
  
  // Category badge
  const categoryNames = {
    theory: "言葉の定義・基礎知識",
    estimation: "最尤推定・ベイズ推定",
    optimization: "解の推定・非線形最適化",
    clustering: "K平均法クラスタリング"
  };
  const categoryBadge = document.getElementById("quiz-category-badge");
  categoryBadge.textContent = categoryNames[q.category] || "機械学習";
  categoryBadge.className = `badge cat-badge-${q.category}`;
  
  // Bookmark button state
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
  document.getElementById("quiz-question-text").innerHTML = q.question;
  
  // Clean feedback details
  document.getElementById("quiz-feedback-card").classList.add("hidden");
  document.getElementById("btn-submit-answer").classList.remove("hidden");
  document.getElementById("keyword-feedback-area").classList.add("hidden");
  
  renderAnswerArea(q);
  
  // Trigger MathJax rendering for LaTeX equations
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
    
    q.blanks.forEach(blank => {
      const row = document.createElement("div");
      row.className = "blank-item-row";
      
      const label = document.createElement("span");
      label.className = "blank-label";
      label.textContent = blank.label;
      
      const select = document.createElement("select");
      select.className = "blank-select";
      select.id = `blank-select-${blank.id}`;
      
      // Default placeholder option
      const defOpt = document.createElement("option");
      defOpt.value = "";
      defOpt.textContent = `空欄 ${blank.label} の語句を選択してください`;
      select.appendChild(defOpt);
      
      q.choices.forEach((choice, index) => {
        const opt = document.createElement("option");
        opt.value = index + 1;
        opt.textContent = choice;
        select.appendChild(opt);
      });
      
      row.appendChild(label);
      row.appendChild(select);
      wrapper.appendChild(row);
    });
    
    container.appendChild(wrapper);
  }
  else if (q.type === "description") {
    const wrapper = document.createElement("div");
    const textarea = document.createElement("textarea");
    textarea.className = "input-text-glow";
    textarea.placeholder = "ここに記述解答を入力してください（ポイントとなるキーワードを含めてください）";
    textarea.id = "quiz-textarea-input";
    
    // Characters limit tracking
    if (q.charLimit) {
      const counter = document.createElement("div");
      counter.className = "sorting-tip";
      counter.style.textAlign = "right";
      counter.style.marginTop = "5px";
      counter.id = "char-counter";
      counter.textContent = `0 / ${q.charLimit} 文字`;
      
      textarea.addEventListener("input", () => {
        counter.textContent = `${textarea.value.length} / ${q.charLimit} 文字`;
        if (textarea.value.length > q.charLimit) {
          counter.style.color = "var(--neon-pink)";
        } else {
          counter.style.color = "var(--text-muted)";
        }
      });
      
      wrapper.appendChild(textarea);
      wrapper.appendChild(counter);
    } else {
      wrapper.appendChild(textarea);
    }
    
    container.appendChild(wrapper);
    textarea.focus();
  }
}

// --- Choice interaction ---
function selectChoice(index, element) {
  if (quizState.isAnswered) return;
  
  document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.classList.remove("selected");
  });
  
  element.classList.add("selected");
  quizState.userSelection = index;
}

// --- Bookmark controls ---
function toggleBookmarkCurrent() {
  const q = quizState.activeQuestions[quizState.currentIndex];
  const bookmarks = getBookmarks();
  const btnBookmark = document.getElementById("btn-bookmark");
  
  const idx = bookmarks.indexOf(q.id);
  if (idx > -1) {
    bookmarks.splice(idx, 1);
    btnBookmark.classList.remove("active");
    btnBookmark.innerHTML = '<i class="fa-regular fa-star"></i>';
  } else {
    bookmarks.push(q.id);
    btnBookmark.classList.add("active");
    btnBookmark.innerHTML = '<i class="fa-solid fa-star"></i>';
  }
  
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  updateHeaderStats();
}

// --- String Normalization Utility ---
function normalizeText(text) {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    // Convert full-width alphanumeric to half-width
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    // Replace all types of spaces/tabs/newlines
    .replace(/\s+/g, "")
    // Convert Japanese prolonged sound mark and wave dashes
    .replace(/[ー〜〜]/g, "-");
}

// --- Answer Verification Logic ---
function submitAnswer() {
  if (quizState.isAnswered) return;
  
  const q = quizState.activeQuestions[quizState.currentIndex];
  let isCorrect = false;
  let partialScore = 0; // 0: Wrong, 1: Partial, 2: Full
  let userRawAnswer = "";
  let correctDisplayAnswer = "";
  
  if (q.type === "choice") {
    if (quizState.userSelection === null) {
      alert("選択肢を1つ選択してください。");
      return;
    }
    isCorrect = (quizState.userSelection === q.answer);
    userRawAnswer = q.choices[quizState.userSelection - 1];
    correctDisplayAnswer = q.choices[q.answer - 1];
  } 
  else if (q.type === "fill_blanks") {
    let allFilled = true;
    let correctCount = 0;
    const userAnsArray = [];
    const correctAnsArray = [];
    
    q.blanks.forEach(blank => {
      const select = document.getElementById(`blank-select-${blank.id}`);
      const val = parseInt(select.value);
      if (!select.value) {
        allFilled = false;
      }
      if (val === blank.answer) {
        correctCount++;
      }
      userAnsArray.push(`[${blank.label}]: ${val ? q.choices[val - 1] : "未選択"}`);
      correctAnsArray.push(`[${blank.label}]: ${q.choices[blank.answer - 1]}`);
    });
    
    if (!allFilled) {
      alert("すべての空欄を選択してください。");
      return;
    }
    
    isCorrect = (correctCount === q.blanks.length);
    userRawAnswer = userAnsArray.join("<br>");
    correctDisplayAnswer = correctAnsArray.join("<br>");
  }
  else if (q.type === "description") {
    const textareaVal = document.getElementById("quiz-textarea-input").value;
    if (!textareaVal.trim()) {
      alert("記述解答を入力してください。");
      return;
    }
    
    const normInput = normalizeText(textareaVal);
    let matchCount = 0;
    const matchResults = [];
    
    q.keywords.forEach(kw => {
      // Check original keyword text and alternatives
      const termsToCheck = [kw.text, ...(kw.alternative || [])];
      const hasMatch = termsToCheck.some(term => normalizeText(term).length > 0 && normInput.includes(normalizeText(term)));
      
      if (hasMatch) {
        matchCount++;
        matchResults.push({ text: kw.text, matched: true });
      } else {
        matchResults.push({ text: kw.text, matched: false });
      }
    });
    
    const coverage = q.keywords.length > 0 ? (matchCount / q.keywords.length) : 1.0;
    
    if (coverage === 1.0) {
      isCorrect = true;
      partialScore = 2;
    } else if (coverage >= 0.5) {
      isCorrect = true;
      partialScore = 1;
    } else {
      isCorrect = false;
      partialScore = 0;
    }
    
    userRawAnswer = textareaVal;
    correctDisplayAnswer = q.answer;
    
    renderKeywordFeedback(matchResults);
  }
  
  quizState.isAnswered = true;
  document.getElementById("btn-submit-answer").classList.add("hidden");
  
  // Update state records and persistence
  const wrongs = getWrongQuestions();
  
  if (isCorrect) {
    if (q.type !== "description" || partialScore >= 1) {
      quizState.score++;
      saveHistory(q.id, "correct");
      
      // Remove from wrong list since answered correctly
      const wrongIdx = wrongs.indexOf(q.id);
      if (wrongIdx > -1) {
        wrongs.splice(wrongIdx, 1);
        localStorage.setItem(STORAGE_KEYS.WRONG, JSON.stringify(wrongs));
      }
    }
  } else {
    saveHistory(q.id, "wrong");
    // Add to wrong list if not already there
    if (!wrongs.includes(q.id)) {
      wrongs.push(q.id);
      localStorage.setItem(STORAGE_KEYS.WRONG, JSON.stringify(wrongs));
      quizState.wrongAddedCount++;
    }
  }
  
  // Render feedback details panel
  const feedbackCard = document.getElementById("quiz-feedback-card");
  const statusText = document.getElementById("feedback-status-text");
  const statusIcon = document.querySelector("#feedback-status i");
  
  feedbackCard.classList.remove("correct-panel", "wrong-panel", "partial-panel");
  feedbackCard.classList.remove("hidden");
  
  if (q.type === "description") {
    if (partialScore === 2) {
      feedbackCard.classList.add("correct-panel");
      statusText.textContent = "正解！ 重要なポイントがすべて含まれています。";
      statusIcon.className = "fa-solid fa-circle-check";
    } else if (partialScore === 1) {
      feedbackCard.classList.add("partial-panel");
      statusText.textContent = "ほぼ正解！ 重要なポイントの半分以上が含まれています。";
      statusIcon.className = "fa-solid fa-circle-exclamation";
    } else {
      feedbackCard.classList.add("wrong-panel");
      statusText.textContent = "不正解。重要なポイントが不足しています。";
      statusIcon.className = "fa-solid fa-circle-xmark";
    }
  } else {
    if (isCorrect) {
      feedbackCard.classList.add("correct-panel");
      statusText.textContent = "正解！";
      statusIcon.className = "fa-solid fa-circle-check";
    } else {
      feedbackCard.classList.add("wrong-panel");
      statusText.textContent = "不正解...";
      statusIcon.className = "fa-solid fa-circle-xmark";
    }
  }
  
  document.getElementById("feedback-user-answer").innerHTML = userRawAnswer;
  document.getElementById("feedback-correct-answer").innerHTML = correctDisplayAnswer;
  document.getElementById("feedback-explanation-text").innerHTML = q.explanation;
}

function renderKeywordFeedback(matchResults) {
  const area = document.getElementById("keyword-feedback-area");
  const container = document.getElementById("keyword-match-list");
  if (!container) return;
  container.innerHTML = "";
  area.classList.remove("hidden");
  
  matchResults.forEach(res => {
    const span = document.createElement("span");
    span.className = `keyword-tag ${res.matched ? 'matched' : 'missed'}`;
    span.innerHTML = `
      <i class="fa-solid ${res.matched ? 'fa-check' : 'fa-xmark'}"></i>
      ${res.text}
    `;
    container.appendChild(span);
  });
}

function nextQuestion() {
  const nextIdx = quizState.currentIndex + 1;
  if (nextIdx < quizState.activeQuestions.length) {
    showQuestion(nextIdx);
  } else {
    showResults();
  }
}

// --- Result Screen Handling ---
function showResults() {
  document.getElementById("result-score").textContent = quizState.score;
  document.getElementById("result-total").textContent = quizState.activeQuestions.length;
  
  const percentage = quizState.activeQuestions.length > 0 
    ? Math.round((quizState.score / quizState.activeQuestions.length) * 100)
    : 0;
  document.getElementById("result-percentage").textContent = `${percentage}%`;
  
  document.getElementById("result-wrong-added").textContent = quizState.wrongAddedCount;
  
  // Calculate active course bookmarks total
  const activeCourseQuestionIds = questions
    .filter(q => q.source === quizState.currentCourse)
    .map(q => q.id);
  const filteredBookmarks = getBookmarks().filter(id => activeCourseQuestionIds.includes(id));
  document.getElementById("result-bookmarks-total").textContent = filteredBookmarks.length;
  
  switchScreen("screen-result");
}

function restartQuiz() {
  quizState.score = 0;
  quizState.wrongAddedCount = 0;
  quizState.currentIndex = 0;
  quizState.isAnswered = false;
  
  showQuestion(0);
  switchScreen("screen-quiz");
}
