document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  
  function updateIcon() {
    if (!toggleBtn) return;
    const icon = toggleBtn.querySelector("i");
    if (!icon) return;
    if (document.documentElement.classList.contains("light-mode")) {
      icon.className = "fa-solid fa-sun";
      toggleBtn.title = "ダークモードに切り替え";
    } else {
      icon.className = "fa-solid fa-moon";
      toggleBtn.title = "ライトモードに切り替え";
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("light-mode");
      const isLight = document.documentElement.classList.contains("light-mode");
      if (isLight) {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      localStorage.setItem("theme", isLight ? "light" : "dark");
      updateIcon();
    });
    updateIcon();
  }
});
