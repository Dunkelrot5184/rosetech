let storedFiles = localStorage.getItem("files");
let files = [];

try {
  const parsed = JSON.parse(storedFiles);
  files = Array.isArray(parsed) ? parsed : [];
} catch {
  files = [];
}

let currentUser = null;

window.onload = () => {
  const savedTheme = localStorage.getItem("theme");
  const savedUser = localStorage.getItem("username");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  if (savedUser) {
    currentUser = savedUser;
    document.getElementById("displayName").innerText = currentUser;
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("appSection").classList.remove("hidden");
    updateFileList();
  }
};

function login() {
  const input = document.getElementById("username");
  const name = input.value.trim();
  if (!name) return alert("Please enter your name.");

  currentUser = name;
  localStorage.setItem("username", name);

  document.getElementById("displayName").innerText = name;
  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("appSection").classList.remove("hidden");

  updateFileList();
}

function updateFileList() {
  const list = document.getElementById("fileList");
  list.innerHTML = "";

  files.forEach((file, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${file.name}</strong>
      <p><em>by ${file.owner}</em></p>
      <pre>${file.content}</pre>
      ${file.owner === currentUser ? `
        <button onclick="editFile(${index})">Edit</button>
        <button onclick="deleteFile(${index})">Delete</button>
      ` : ''}
    `;
    list.appendChild(li);
  });
}

function editFile(index) {
  const file = files[index];
  if (file.owner !== currentUser) return alert("You can only edit your own files.");
  document.getElementById("fileName").value = file.name;
  document.getElementById("fileContent").value = file.content;
  document.getElementById("fileForm").setAttribute("data-edit-index", index);
}

function deleteFile(index) {
  if (files[index].owner !== currentUser) return alert("You can only delete your own files.");
  files.splice(index, 1);
  saveFiles();
  updateFileList();
}

function saveFiles() {
  localStorage.setItem("files", JSON.stringify(files));
}

document.getElementById("fileForm").addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("fileName").value.trim();
  const content = document.getElementById("fileContent").value.trim();
  const editIndex = document.getElementById("fileForm").getAttribute("data-edit-index");

  if (!name || !content) {
    return alert("File name and content cannot be empty.");
  }

  if (editIndex !== null) {
    const idx = parseInt(editIndex);
    if (files[idx].owner !== currentUser) {
      alert("You can only edit your own files.");
      return;
    }
    files[idx].name = name;
    files[idx].content = content;
    document.getElementById("fileForm").removeAttribute("data-edit-index");
  } else {
    files.push({ name, content, owner: currentUser });
  }

  saveFiles();
  updateFileList();
  document.getElementById("fileForm").reset();
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// --- Compact Export / Import ---

function exportData() {
  try {
    const raw = JSON.stringify(files);
    const encoded = btoa(unescape(encodeURIComponent(raw)));
    navigator.clipboard.writeText(encoded).then(() => {
      alert("Encoded file data copied to clipboard!");
    }).catch(() => {
      document.getElementById("importBox").value = encoded;
      alert("Could not copy to clipboard. Paste manually from the box.");
    });
  } catch (e) {
    alert("Failed to export files.");
  }
}

function importData() {
  try {
    const input = document.getElementById("importBox").value.trim();
    const decoded = decodeURIComponent(escape(atob(input)));
    const data = JSON.parse(decoded);

    if (!Array.isArray(data)) return alert("Invalid format.");
    files = data;
    saveFiles();
    updateFileList();
    alert("Files imported successfully.");
  } catch (e) {
    alert("Error importing data. Ensure it's a valid encoded string.");
  }
}
