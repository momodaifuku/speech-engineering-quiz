// --- State & LocalStorage Keys ---
const STORAGE_KEYS = {
  BOOKMARKS: "speech_engineering_bookmarks",
  WRONG: "speech_engineering_wrong",
  HISTORY: "speech_engineering_history" // { questionId: "correct" | "wrong" }
};

let quizState = {
  currentMode: 'all', // 'all', 'wrong', 'bookmarked', 'category'
  currentCategory: '',
  activeQuestions: [],
  currentIndex: 0,
  score: 0,
  wrongAddedCount: 0,
  userSelection: null, // Used for choice or custom input values
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
  
  document.querySelector("#header-bookmark-count .count").textContent = bookmarks.length;
  document.querySelector("#header-wrong-count .count").textContent = wrongs.length;
}

// --- Home Screen: Question Selector ---
function renderQuestionSelector() {
  const container = document.getElementById("question-list-container");
  container.innerHTML = "";
  
  const history = getHistory();
  
  questions.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.className = "q-select-btn";
    
    // Check solved history
    if (history[q.id] === "correct") {
      btn.classList.add("solved-correct");
    } else if (history[q.id] === "wrong") {
      btn.classList.add("solved-wrong");
    }
    
    // Label generation (e.g., "問題1", "問題3 (1)")
    let shortLabel = "";
    if (q.title.includes("(")) {
      const parts = q.title.split(" ");
      shortLabel = parts[0] + " " + parts[1].replace(".", "");
    } else {
      shortLabel = q.title.split(".")[0];
    }
    
    btn.innerHTML = `
      <span class="q-id">${shortLabel}</span>
      <span class="q-title" title="${q.question}">${q.question}</span>
    `;
    
    btn.onclick = () => {
      startQuizFromQuestion(index);
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
  target.offsetHeight; // Force reflow
  target.classList.add("active");
}

function goToHome() {
  switchScreen("screen-home");
  updateHeaderStats();
  renderQuestionSelector();
}

// --- Quiz Logic ---
function startQuiz(mode, category = '') {
  quizState.currentMode = mode;
  quizState.currentCategory = category;
  quizState.score = 0;
  quizState.wrongAddedCount = 0;
  quizState.currentIndex = 0;
  quizState.isAnswered = false;
  
  let list = [];
  if (mode === 'all') {
    list = [...questions];
  } else if (mode === 'category') {
    list = questions.filter(q => q.category === category);
  } else if (mode === 'wrong') {
    const wrongIds = getWrongQuestions();
    list = questions.filter(q => wrongIds.includes(q.id));
  } else if (mode === 'bookmarked') {
    const bookmarkedIds = getBookmarks();
    list = questions.filter(q => bookmarkedIds.includes(q.id));
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

function startQuizFromQuestion(questionIndex) {
  quizState.currentMode = 'all';
  quizState.currentCategory = '';
  quizState.score = 0;
  quizState.wrongAddedCount = 0;
  quizState.isAnswered = false;
  
  quizState.activeQuestions = [...questions];
  quizState.currentIndex = questionIndex;
  
  showQuestion(questionIndex);
  switchScreen("screen-quiz");
}

function showQuestion(index) {
  quizState.currentIndex = index;
  quizState.isAnswered = false;
  quizState.userSelection = null;
  
  const q = quizState.activeQuestions[index];
  
  // Progress UI
  const progressPercent = (index / quizState.activeQuestions.length) * 100;
  document.getElementById("quiz-progress-bar").style.width = `${progressPercent}%`;
  document.getElementById("quiz-progress-text").textContent = `${index + 1} / ${quizState.activeQuestions.length}`;
  
  // Category badge
  const categoryNames = {
    basic: "音声の基礎・分類",
    anatomy: "発声・呼吸の生理",
    acoustics: "音響・信号処理"
  };
  const categoryBadge = document.getElementById("quiz-category-badge");
  categoryBadge.textContent = categoryNames[q.category] || "音声工学";
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
  
  // Question Title & Text
  document.getElementById("quiz-question-title").textContent = q.title;
  document.getElementById("quiz-question-text").textContent = q.question;
  
  // Hide feedback panels, show submit button
  document.getElementById("quiz-feedback-card").classList.add("hidden");
  document.getElementById("btn-submit-answer").classList.remove("hidden");
  
  renderAnswerArea(q);
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
  else if (q.type === "text") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "input-text-glow";
    input.placeholder = "ここに解答を入力してください";
    input.id = "quiz-text-input";
    
    // Add enter key listener
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") submitAnswer();
    });
    
    container.appendChild(input);
    input.focus();
  } 
  else if (q.type === "fill_blanks") {
    const wrapper = document.createElement("div");
    
    q.blanks.forEach(blank => {
      const row = document.createElement("div");
      row.className = "blank-item-row";
      
      const label = document.createElement("span");
      label.className = "blank-label";
      label.textContent = blank.label;
      
      const select = document.createElement("select");
      select.className = "blank-select";
      select.id = `blank-select-${blank.id}`;
      
      // Default option
      const defOpt = document.createElement("option");
      defOpt.value = "";
      defOpt.textContent = `空欄 [ ${blank.label} ] の選択肢`;
      select.appendChild(defOpt);
      
      blank.choices.forEach((choice, index) => {
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

// --- Text Normalization Helper ---
function normalizeText(text) {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    // Convert full-width alphanumeric/kana to half-width where appropriate
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    // Replace spaces
    .replace(/\s+/g, "")
    // Convert full-width brackets, hyphens or Japanese marks if any
    .replace(/ー/g, "-")
    // ひらがなの揺らぎを吸収したい場合の追加処理（基本は完全一致で十分）
    .replace(/[（）()]/g, ""); // カッコの除去
}

// --- Answer Verification ---
function submitAnswer() {
  if (quizState.isAnswered) return;
  
  const q = quizState.activeQuestions[quizState.currentIndex];
  let isCorrect = false;
  let userRawAnswer = "";
  let correctDisplayAnswer = "";
  
  if (q.type === "choice") {
    if (quizState.userSelection === null) {
      alert("選択肢を1つ選んでください。");
      return;
    }
    isCorrect = (quizState.userSelection === q.answer);
    userRawAnswer = q.choices[quizState.userSelection - 1];
    correctDisplayAnswer = q.choices[q.answer - 1];
  } 
  else if (q.type === "text") {
    const inputVal = document.getElementById("quiz-text-input").value;
    if (!inputVal.trim()) {
      alert("解答を入力してください。");
      return;
    }
    
    const normUser = normalizeText(inputVal);
    const normCorrect = normalizeText(q.answer);
    
    isCorrect = (normUser === normCorrect);
    userRawAnswer = inputVal;
    correctDisplayAnswer = q.answer;
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
      userAnsArray.push(`[${blank.label}]: ${val ? blank.choices[val - 1] : "未選択"}`);
      correctAnsArray.push(`[${blank.label}]: ${blank.choices[blank.answer - 1]}`);
    });
    
    if (!allFilled) {
      alert("すべての空欄を選択してください。");
      return;
    }
    
    isCorrect = (correctCount === q.blanks.length);
    userRawAnswer = userAnsArray.join("<br>");
    correctDisplayAnswer = correctAnsArray.join("<br>");
  }
  
  quizState.isAnswered = true;
  document.getElementById("btn-submit-answer").classList.add("hidden");
  
  // Save stats
  const wrongs = getWrongQuestions();
  if (isCorrect) {
    quizState.score++;
    saveHistory(q.id, "correct");
    
    // Remove from wrong attempts list if solved correctly
    const wrongIdx = wrongs.indexOf(q.id);
    if (wrongIdx > -1) {
      wrongs.splice(wrongIdx, 1);
      localStorage.setItem(STORAGE_KEYS.WRONG, JSON.stringify(wrongs));
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
  
  // Show Feedback Panel
  const feedbackCard = document.getElementById("quiz-feedback-card");
  const statusText = document.getElementById("feedback-status-text");
  const statusIcon = document.querySelector("#feedback-status i");
  
  feedbackCard.classList.remove("correct-panel", "wrong-panel");
  feedbackCard.classList.remove("hidden");
  
  if (isCorrect) {
    feedbackCard.classList.add("correct-panel");
    statusText.textContent = "正解！";
    statusIcon.className = "fa-solid fa-circle-check";
  } else {
    feedbackCard.classList.add("wrong-panel");
    statusText.textContent = "不正解...";
    statusIcon.className = "fa-solid fa-circle-xmark";
  }
  
  document.getElementById("feedback-user-answer").innerHTML = userRawAnswer;
  document.getElementById("feedback-correct-answer").innerHTML = correctDisplayAnswer;
  document.getElementById("feedback-explanation-text").textContent = q.explanation;
}

function nextQuestion() {
  const nextIdx = quizState.currentIndex + 1;
  if (nextIdx < quizState.activeQuestions.length) {
    showQuestion(nextIdx);
  } else {
    showResults();
  }
}

// --- Result Screen Controls ---
function showResults() {
  document.getElementById("result-score").textContent = quizState.score;
  document.getElementById("result-total").textContent = quizState.activeQuestions.length;
  
  const percentage = Math.round((quizState.score / quizState.activeQuestions.length) * 100);
  document.getElementById("result-percentage").textContent = `${percentage}%`;
  
  document.getElementById("result-wrong-added").textContent = quizState.wrongAddedCount;
  document.getElementById("result-bookmarks-total").textContent = getBookmarks().length;
  
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
