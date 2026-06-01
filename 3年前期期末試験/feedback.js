document.addEventListener("DOMContentLoaded", () => {
  // Inject FontAwesome if not loaded
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(fa);
  }

  // Determine path
  const path = decodeURIComponent(window.location.pathname);
  // Whether to use inline donation form instead of floating widget
  const hasInlineForm = document.getElementById("inline-donation-form") !== null;

  // Setup Common Toast Element
  const toastHtml = `
    <div class="feedback-toast" id="feedback-toast">
      <i class="fa-solid fa-circle-check"></i> <span>送信しました！ありがとうございます。</span>
    </div>
  `;
  const toastContainer = document.createElement("div");
  toastContainer.innerHTML = toastHtml;
  document.body.appendChild(toastContainer);
  const toast = document.getElementById("feedback-toast");

  function showToast(message) {
    if (message) {
      toast.querySelector("span").textContent = message;
    }
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Determine current page name for feedback context
  let pageName = "ポータルハブ";
  if (path.includes("3年前期中間試験")) pageName = "3年前期中間試験";
  else if (path.includes("3年前期期末試験")) pageName = "3年前期期末試験";
  else if (path.includes("3年後期中間試験")) pageName = "3年後期中間試験";
  else if (path.includes("3年後期期末試験")) pageName = "3年後期期末試験";

  if (path.includes("音声工学テスト")) pageName = "音声工学";
  else if (path.includes("機械学習テスト")) pageName = "機械学習";
  else if (path.includes("知識工学テスト")) pageName = "知識工学";
  else if (path.includes("経済学テスト")) pageName = "経済学";

  // --- Case 1: Inline Donation Form exists (non-midterm pages) ---
  if (hasInlineForm) {
    let inlineFileData = null;
    let inlineFileName = null;
    let inlineFileType = null;

    const inlineFileInput = document.getElementById("inline-feedback-file");
    const inlineFileLabel = document.getElementById("inline-file-label");
    const inlineSelectedFileInfo = document.getElementById("inline-selected-file-info");
    const inlineSelectedFileNameSpan = document.getElementById("inline-selected-file-name");
    const inlineFileCancelBtn = document.getElementById("inline-file-cancel-btn");
    const inlineTextInput = document.getElementById("inline-feedback-content");
    const inlineSubmitBtn = document.getElementById("inline-feedback-submit-btn");

    // File Selection
    inlineFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const limit = 2 * 1024 * 1024; // 2MB
      if (file.size > limit) {
        alert("ファイルサイズが大きすぎます。2MB以下のファイルを添付してください。");
        resetInlineFile();
        return;
      }

      inlineFileName = file.name;
      inlineFileType = file.type;

      const reader = new FileReader();
      reader.onload = (event) => {
        inlineFileData = event.target.result;
        inlineSelectedFileNameSpan.textContent = file.name;
        inlineSelectedFileInfo.style.display = "flex";
        inlineFileLabel.style.display = "none";
      };
      reader.onerror = (err) => {
        console.error("File reading error:", err);
        alert("ファイルの読み込みに失敗しました。");
        resetInlineFile();
      };
      reader.readAsDataURL(file);
    });

    inlineFileCancelBtn.addEventListener("click", () => {
      resetInlineFile();
    });

    function resetInlineFile() {
      inlineFileInput.value = "";
      inlineFileData = null;
      inlineFileName = null;
      inlineFileType = null;
      inlineSelectedFileInfo.style.display = "none";
      inlineFileLabel.style.display = "flex";
    }

    // Submit Action
    inlineSubmitBtn.addEventListener("click", () => {
      const content = inlineTextInput.value;
      if (!content.trim()) {
        alert("メッセージを入力してください。");
        return;
      }

      const newFeedback = {
        id: "fb_" + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'donate',
        page: pageName,
        context: "インライン寄贈フォームより送信",
        content: content,
        fileName: inlineFileName,
        fileType: inlineFileType,
        fileData: inlineFileData
      };

      // LocalStorage
      try {
        const feedbacks = JSON.parse(localStorage.getItem("study_hub_feedbacks")) || [];
        feedbacks.unshift(newFeedback);
        localStorage.setItem("study_hub_feedbacks", JSON.stringify(feedbacks));
      } catch (e) {
        console.error("LocalStorage save error:", e);
      }

      // API Send
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'donate',
          page: pageName,
          context: "インライン寄贈フォームより送信",
          content: content,
          fileName: inlineFileName,
          fileType: inlineFileType,
          fileData: inlineFileData
        })
      })
      .then(res => {
        if (!res.ok) console.error("Failed to notify Discord webhook.");
      })
      .catch(err => console.error("Error notifying Discord webhook:", err));

      // Clear Form
      inlineTextInput.value = "";
      resetInlineFile();

      // Toast
      showToast("過去問を寄贈していただき、ありがとうございました！");
    });
  }

  // --- Case 2: Floating Widget (for 3年前期中間試験 & tests) ---
  if (!hasInlineForm) {
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
            <button class="feedback-type-btn type-donate" data-type="donate">問題寄贈</button>
          </div>
          <div class="feedback-file-input-container" id="feedback-file-container" style="display: none;">
            <label for="feedback-file" class="file-label" id="feedback-file-label">
              <i class="fa-solid fa-file-arrow-up"></i> ファイルを添付 (最大2MB)
            </label>
            <input type="file" id="feedback-file" accept=".pdf,.png,.jpg,.jpeg,.zip,.txt,.doc,.docx,.xlsx,.xls,.pptx,.ppt" style="display: none;">
            <div class="selected-file-info" id="selected-file-info" style="display: none;">
              <span id="selected-file-name"></span>
              <button type="button" class="file-cancel-btn" id="file-cancel-btn" title="キャンセル">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <textarea class="feedback-textarea" id="feedback-content" placeholder="間違いの指摘や追加してほしい機能などをご記入ください..."></textarea>
          <button class="feedback-submit-btn" id="feedback-submit-btn">
            <span>送信する</span>
          </button>
        </div>
      </div>
    `;

    const widgetContainer = document.createElement("div");
    widgetContainer.innerHTML = widgetHtml;
    document.body.appendChild(widgetContainer);

    let selectedFeedbackType = 'question';
    let attachedFileData = null;
    let attachedFileName = null;
    let attachedFileType = null;

    const trigger = document.getElementById("feedback-trigger");
    const panel = document.getElementById("feedback-panel");
    const textInput = document.getElementById("feedback-content");
    const submitBtn = document.getElementById("feedback-submit-btn");

    const fileContainer = document.getElementById("feedback-file-container");
    const fileInput = document.getElementById("feedback-file");
    const fileLabel = document.getElementById("feedback-file-label");
    const selectedFileInfo = document.getElementById("selected-file-info");
    const selectedFileNameSpan = document.getElementById("selected-file-name");
    const fileCancelBtn = document.getElementById("file-cancel-btn");

    trigger.addEventListener("click", () => {
      trigger.classList.toggle("active");
      panel.classList.toggle("active");
      if (panel.classList.contains("active")) {
        textInput.focus();
      }
    });

    document.querySelectorAll(".feedback-type-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".feedback-type-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedFeedbackType = btn.getAttribute("data-type");

        if (selectedFeedbackType === 'donate') {
          fileContainer.style.display = "block";
          textInput.placeholder = "過去問の年度や問題に関する追加情報を入力してください...";
        } else {
          fileContainer.style.display = "none";
          textInput.placeholder = "間違いの指摘や追加してほしい機能などをご記入ください...";
        }
      });
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const limit = 2 * 1024 * 1024;
      if (file.size > limit) {
        alert("ファイルサイズが大きすぎます。2MB以下のファイルを添付してください。");
        resetFileAttachment();
        return;
      }

      attachedFileName = file.name;
      attachedFileType = file.type;

      const reader = new FileReader();
      reader.onload = (event) => {
        attachedFileData = event.target.result;
        selectedFileNameSpan.textContent = file.name;
        selectedFileInfo.style.display = "flex";
        fileLabel.style.display = "none";
      };
      reader.onerror = (err) => {
        console.error("File reading error:", err);
        alert("ファイルの読み込みに失敗しました。");
        resetFileAttachment();
      };
      reader.readAsDataURL(file);
    });

    fileCancelBtn.addEventListener("click", () => {
      resetFileAttachment();
    });

    function resetFileAttachment() {
      fileInput.value = "";
      attachedFileData = null;
      attachedFileName = null;
      attachedFileType = null;
      selectedFileInfo.style.display = "none";
      fileLabel.style.display = "flex";
    }

    submitBtn.addEventListener("click", () => {
      const content = textInput.value;
      if (!content.trim()) {
        alert("メッセージを入力してください。");
        return;
      }

      let questionContext = "";
      if (window.quizState && window.quizState.activeQuestions && window.quizState.activeQuestions[window.quizState.currentIndex]) {
        const q = window.quizState.activeQuestions[window.quizState.currentIndex];
        questionContext = `問題ID: ${q.id} (${q.title})`;
      }

      const newFeedback = {
        id: "fb_" + Date.now(),
        timestamp: new Date().toISOString(),
        type: selectedFeedbackType,
        page: pageName,
        context: questionContext,
        content: content,
        fileName: attachedFileName,
        fileType: attachedFileType,
        fileData: attachedFileData
      };

      try {
        const feedbacks = JSON.parse(localStorage.getItem("study_hub_feedbacks")) || [];
        feedbacks.unshift(newFeedback);
        localStorage.setItem("study_hub_feedbacks", JSON.stringify(feedbacks));
      } catch (e) {
        console.error("LocalStorage save error:", e);
      }

      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedFeedbackType,
          page: pageName,
          context: questionContext,
          content: content,
          fileName: attachedFileName,
          fileType: attachedFileType,
          fileData: attachedFileData
        })
      })
      .then(res => {
        if (!res.ok) console.error("Failed to notify Discord.");
      })
      .catch(err => console.error("Error notifying Discord:", err));

      textInput.value = "";
      trigger.classList.remove("active");
      panel.classList.remove("active");
      resetFileAttachment();

      showToast();
    });
  }
});
