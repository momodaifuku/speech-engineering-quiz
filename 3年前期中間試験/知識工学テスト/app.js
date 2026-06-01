// --- State & LocalStorage Keys ---
const STORAGE_KEYS = {
  BOOKMARKS: "knowledge_engineering_bookmarks",
  WRONG: "knowledge_engineering_wrong",
  HISTORY: "knowledge_engineering_history" // { questionId: "correct" | "wrong" }
};

let currentQuestions = [];

let quizState = {
  currentMode: 'all', // 'all', 'wrong', 'bookmarked', 'category'
  currentCategory: '',
  activeQuestions: [],
  currentIndex: 0,
  score: 0,
  wrongAddedCount: 0,
  userSelection: null, // Used for choices or temp sort order
  isAnswered: false
};

// --- App Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  currentQuestions = questions; // Default to past exam questions
  initStorage();
  updateHeaderStats();
  renderQuestionSelector();
  goToHome();
});

// --- Question Source Selector ---
function setQuestionSource(source) {
  const btnPast = document.getElementById("btn-source-past");
  const btnPractice = document.getElementById("btn-source-practice");
  const btnQuiz = document.getElementById("btn-source-quiz");
  
  if (source === 'past') {
    currentQuestions = questions;
    btnPast.className = "btn btn-primary";
    btnPractice.className = "btn btn-secondary";
    btnQuiz.className = "btn btn-secondary";
  } else if (source === 'practice') {
    currentQuestions = practiceQuestions;
    btnPast.className = "btn btn-secondary";
    btnPractice.className = "btn btn-primary";
    btnQuiz.className = "btn btn-secondary";
  } else if (source === 'quiz') {
    currentQuestions = quizQuestions;
    btnPast.className = "btn btn-secondary";
    btnPractice.className = "btn btn-secondary";
    btnQuiz.className = "btn btn-primary";
  }
  
  // Refresh question selector list on home screen
  renderQuestionSelector();
}

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
  
  currentQuestions.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.className = "q-select-btn";
    
    // Check solved history
    if (history[q.id] === "correct") {
      btn.classList.add("solved-correct");
    } else if (history[q.id] === "wrong") {
      btn.classList.add("solved-wrong");
    }
    
    // Define short label (e.g. Q1-3)
    const shortLabel = q.title.split(" ")[0] + " " + q.title.split(" ")[1];
    
    btn.innerHTML = `
      <span class="q-id">${shortLabel}</span>
      <span class="q-title" title="${q.question}">${q.question}</span>
    `;
    
    btn.onclick = () => {
      // Start quiz from this specific question
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
  // Force reflow for transition
  target.offsetHeight;
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
    list = [...currentQuestions];
  } else if (mode === 'category') {
    list = currentQuestions.filter(q => q.category === category);
  } else if (mode === 'wrong') {
    const wrongIds = getWrongQuestions();
    list = currentQuestions.filter(q => wrongIds.includes(q.id));
  } else if (mode === 'bookmarked') {
    const bookmarkedIds = getBookmarks();
    list = currentQuestions.filter(q => bookmarkedIds.includes(q.id));
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
  // Starts in 'all' mode but sets the initial index to the selected question
  quizState.currentMode = 'all';
  quizState.currentCategory = '';
  quizState.score = 0;
  quizState.wrongAddedCount = 0;
  quizState.isAnswered = false;
  
  quizState.activeQuestions = [...currentQuestions];
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
  const progressPercent = ((index) / quizState.activeQuestions.length) * 100;
  document.getElementById("quiz-progress-bar").style.width = `${progressPercent}%`;
  document.getElementById("quiz-progress-text").textContent = `${index + 1} / ${quizState.activeQuestions.length}`;
  
  // Category badge
  const categoryNames = {
    ai_terms: "AI用語の確認",
    math: "基礎数理",
    ml_basics: "機械学習周辺知識",
    understanding: "理解の確認",
    r_prog: "Rプログラミング",
    description: "記述問題"
  };
  const categoryBadge = document.getElementById("quiz-category-badge");
  categoryBadge.textContent = categoryNames[q.category] || "クイズ";
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
  
  // Hide feedback, show answer area and submit button
  document.getElementById("quiz-feedback-card").classList.add("hidden");
  document.getElementById("btn-submit-answer").classList.remove("hidden");
  document.getElementById("keyword-feedback-area").classList.add("hidden");
  
  // Render Answer Area based on type
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
    input.placeholder = "ここに半角英数字で解答を入力してください";
    input.id = "quiz-text-input";
    
    // Add enter key listener
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") submitAnswer();
    });
    
    container.appendChild(input);
    input.focus();
  } 
  else if (q.type === "description") {
    const wrapper = document.createElement("div");
    const textarea = document.createElement("textarea");
    textarea.className = "input-text-glow";
    textarea.placeholder = "記述解答を入力してください（ポイントとなるキーワードを含めてください）";
    textarea.id = "quiz-textarea-input";
    
    // Character limit if defined
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
      defOpt.textContent = `空欄 ${blank.label} の選択肢`;
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
  else if (q.type === "sort") {
    const wrapper = document.createElement("div");
    wrapper.className = "sorting-container";
    
    const tip = document.createElement("div");
    tip.className = "sorting-tip";
    tip.innerHTML = '<i class="fa-solid fa-circle-info neon-text-blue"></i> 小さい順、または難しい順にカードをクリックして並び替えてください。';
    wrapper.appendChild(tip);
    
    quizState.userSelection = []; // Will store ordered item IDs
    
    q.items.forEach(item => {
      const card = document.createElement("div");
      card.className = "sortable-item";
      card.dataset.itemId = item.id;
      card.innerHTML = `
        <span class="sort-text">${item.text}</span>
        <span class="sort-badge">-</span>
      `;
      
      card.onclick = () => toggleSortItem(item.id, card);
      wrapper.appendChild(card);
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

// --- Sorting interaction ---
function toggleSortItem(id, element) {
  if (quizState.isAnswered) return;
  
  const index = quizState.userSelection.indexOf(id);
  
  if (index > -1) {
    // Already selected, deselect it and shift other numbers
    quizState.userSelection.splice(index, 1);
    element.classList.remove("active-sort");
    element.querySelector(".sort-badge").textContent = "-";
  } else {
    // Select it
    quizState.userSelection.push(id);
    element.classList.add("active-sort");
  }
  
  // Recalculate badges
  const container = document.getElementById("quiz-answer-area");
  quizState.userSelection.forEach((selectedId, seqIdx) => {
    const card = container.querySelector(`[data-item-id="${selectedId}"]`);
    if (card) {
      card.querySelector(".sort-badge").textContent = seqIdx + 1;
    }
  });
  
  // Reset unselected badges
  container.querySelectorAll(".sortable-item").forEach(card => {
    const cardId = card.dataset.itemId;
    if (!quizState.userSelection.includes(cardId)) {
      card.querySelector(".sort-badge").textContent = "-";
    }
  });
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
    // Convert full-width alphanumeric to half-width
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    // Replace various representations of spaces
    .replace(/\s+/g, "")
    // Convert Japanese punctuation and symbols if any
    .replace(/ー/g, "-");
}

// --- Answer Verification ---
function submitAnswer() {
  if (quizState.isAnswered) return;
  
  const q = quizState.activeQuestions[quizState.currentIndex];
  let isCorrect = false;
  let partialScore = 0; // 0: wrong, 1: partial, 2: correct (for styling)
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
    
    // Normalize both user answer and correct answer for comparison
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
      userAnsArray.push(`${blank.label}: ${val ? blank.choices[val - 1] : "未選択"}`);
      correctAnsArray.push(`${blank.label}: ${blank.choices[blank.answer - 1]}`);
    });
    
    if (!allFilled) {
      alert("すべての空欄を選択してください。");
      return;
    }
    
    isCorrect = (correctCount === q.blanks.length);
    userRawAnswer = userAnsArray.join("<br>");
    correctDisplayAnswer = correctAnsArray.join("<br>");
  }
  else if (q.type === "sort") {
    if (quizState.userSelection.length < q.items.length) {
      alert("すべてのアイテムを並べ替えてください。");
      return;
    }
    
    // Check elements order
    isCorrect = true;
    for (let i = 0; i < q.answer.length; i++) {
      if (quizState.userSelection[i] !== q.answer[i]) {
        isCorrect = false;
        break;
      }
    }
    
    const userOrder = quizState.userSelection.map((id, idx) => {
      const item = q.items.find(it => it.id === id);
      return `${idx + 1}. ${item.text}`;
    });
    
    const correctOrder = q.answer.map((id, idx) => {
      const item = q.items.find(it => it.id === id);
      return `${idx + 1}. ${item.text}`;
    });
    
    userRawAnswer = userOrder.join(" ➔ ");
    correctDisplayAnswer = correctOrder.join(" ➔ ");
  }
  else if (q.type === "description") {
    const textareaVal = document.getElementById("quiz-textarea-input").value;
    if (!textareaVal.trim()) {
      alert("解答を入力してください。");
      return;
    }
    
    // Keyword scoring logic
    const normInput = textareaVal.toLowerCase();
    let matchCount = 0;
    const matchResults = []; // [{keyword: "x", matched: true/false}]
    
    q.keywords.forEach(kw => {
      // Check original keyword or any alternatives
      const termsToCheck = [kw.text, ...(kw.alternative || [])];
      const hasMatch = termsToCheck.some(term => normInput.includes(term.toLowerCase()));
      
      if (hasMatch) {
        matchCount++;
        matchResults.push({ text: kw.text, matched: true });
      } else {
        matchResults.push({ text: kw.text, matched: false });
      }
    });
    
    const coverage = matchCount / q.keywords.length;
    
    if (coverage === 1.0) {
      isCorrect = true;
      partialScore = 2; // Full correct
    } else if (coverage >= 0.5) {
      isCorrect = true; // Still marked as solved-correct but with partial visual styling
      partialScore = 1;
    } else {
      isCorrect = false;
      partialScore = 0;
    }
    
    userRawAnswer = textareaVal;
    correctDisplayAnswer = q.answer;
    
    // Render Keyword details tag
    renderKeywordFeedback(matchResults);
  }
  
  quizState.isAnswered = true;
  document.getElementById("btn-submit-answer").classList.add("hidden");
  
  // Save statistics
  const wrongs = getWrongQuestions();
  if (isCorrect) {
    if (q.type !== "description" || partialScore >= 1) {
      quizState.score++;
      saveHistory(q.id, "correct");
      
      // Remove from wrong attempts list if solved correctly
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
  
  // Show Feedback Panel
  const feedbackCard = document.getElementById("quiz-feedback-card");
  const statusText = document.getElementById("feedback-status-text");
  const statusIcon = document.querySelector("#feedback-status i");
  
  feedbackCard.classList.remove("correct-panel", "wrong-panel", "partial-panel");
  feedbackCard.classList.remove("hidden");
  
  if (q.type === "description") {
    if (partialScore === 2) {
      feedbackCard.classList.add("correct-panel");
      statusText.textContent = "正解！ キーワードがすべて含まれています。";
      statusIcon.className = "fa-solid fa-circle-check";
    } else if (partialScore === 1) {
      feedbackCard.classList.add("partial-panel");
      statusText.textContent = "ほぼ正解！ 重要なキーワードの半分以上が含まれています。";
      statusIcon.className = "fa-solid fa-circle-exclamation";
    } else {
      feedbackCard.classList.add("wrong-panel");
      statusText.textContent = "不正解。重要なキーワードが不足しています。";
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
  document.getElementById("feedback-explanation-text").textContent = q.explanation;
}

function renderKeywordFeedback(matchResults) {
  const area = document.getElementById("keyword-feedback-area");
  const container = document.getElementById("keyword-match-list");
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
    // Quiz completed
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
  // Restart with same active question set
  quizState.score = 0;
  quizState.wrongAddedCount = 0;
  quizState.currentIndex = 0;
  quizState.isAnswered = false;
  
  showQuestion(0);
  switchScreen("screen-quiz");
}
