const toggleBtn = document.getElementById("theme-toggle");

function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem("theme", theme);
}

toggleBtn.onclick = () => {
  const current = document.body.classList.contains("dark") ? "light" : "dark";
  setTheme(current);
};

window.onload = () => {
  const saved = localStorage.getItem("theme") || "light";
  setTheme(saved);
};
