document.addEventListener("DOMContentLoaded", () => {
  // Inject FontAwesome if not loaded
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(fa);
  }

  // Inject HTML Elements
  const widgetHtml = `
    <div class="feedback-widget">
      <button class="feedback-trigger" id="feedback-trigger" title="フィードバックを送信">
        <i class="fa-solid fa-comments"></i>
      </button>
      <div class="feedback-panel" id="feedback-panel">
        <h4><i class="fa-solid fa-paper-plane"></i> フィードバック送信</h4>
        <div class="feedback-type-select">
          <button class="feedback-type-btn type-question active" data-type="question">質問</button>
          <button class="feedback-type-btn type-suggest" data-type="suggest">提案</button>
          <button class="feedback-type-btn type-debug" data-type="debug">バグ報告</button>
        </div>
        <textarea class="feedback-textarea" id="feedback-content" placeholder="間違いの指摘や追加してほしい機能などをご記入ください..."></textarea>
        <button class="feedback-submit-btn" id="feedback-submit-btn">
          <span>送信する</span>
        </button>
      </div>
    </div>
    <div class="feedback-toast" id="feedback-toast">
      <i class="fa-solid fa-circle-check"></i> <span>送信しました！ありがとうございます。</span>
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = widgetHtml;
  document.body.appendChild(container);

  // Setup Variables
  let selectedFeedbackType = 'question';
  const trigger = document.getElementById("feedback-trigger");
  const panel = document.getElementById("feedback-panel");
  const textInput = document.getElementById("feedback-content");
  const submitBtn = document.getElementById("feedback-submit-btn");
  const toast = document.getElementById("feedback-toast");

  // Open/Close
  trigger.addEventListener("click", () => {
    trigger.classList.toggle("active");
    panel.classList.toggle("active");
    if (panel.classList.contains("active")) {
      textInput.focus();
    }
  });

  // Type Selection
  document.querySelectorAll(".feedback-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".feedback-type-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedFeedbackType = btn.getAttribute("data-type");
    });
  });

  // Submit Logic
  submitBtn.addEventListener("click", () => {
    const content = textInput.value;
    if (!content.trim()) {
      alert("メッセージを入力してください。");
      return;
    }

    // Determine current page name
    let pageName = "ポータルハブ";
    const path = decodeURIComponent(window.location.pathname);
    if (path.includes("音声工学テスト")) pageName = "音声工学";
    else if (path.includes("機械学習テスト")) pageName = "機械学習";
    else if (path.includes("知識工学テスト")) pageName = "知識工学";
    else if (path.includes("経済学テスト")) pageName = "経済学";

    // Attempt to gather question context if the quiz app has state
    let questionContext = "";
    if (window.quizState && window.quizState.activeQuestions && window.quizState.activeQuestions[window.quizState.currentIndex]) {
      const q = window.quizState.activeQuestions[window.quizState.currentIndex];
      questionContext = `問題ID: ${q.id} (${q.title})`;
    }

    // Prepare Feedback Object
    const newFeedback = {
      id: "fb_" + Date.now(),
      timestamp: new Date().toISOString(),
      type: selectedFeedbackType,
      page: pageName,
      context: questionContext,
      content: content
    };

    // Save to LocalStorage
    const feedbacks = JSON.parse(localStorage.getItem("study_hub_feedbacks")) || [];
    feedbacks.unshift(newFeedback); // Add to beginning of array
    localStorage.setItem("study_hub_feedbacks", JSON.stringify(feedbacks));

    // Reset Form
    textInput.value = "";
    trigger.classList.remove("active");
    panel.classList.remove("active");

    // Show Toast
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  });
});
