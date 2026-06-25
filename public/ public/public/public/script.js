const API_URL = window.location.origin;
let currentUser = null;
let currentGroup = null;

function showRegister() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('registerPage').style.display = 'block';
}

function showLogin() {
  document.getElementById('loginPage').style.display = 'block';
  document.getElementById('registerPage').style.display = 'none';
}

async function register() {
  const email = document.getElementById('regEmail').value.trim();
  const nick = document.getElementById('regNick').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (!email || !nick || password.length < 8) {
    document.getElementById('regError').textContent = 'Заполни все поля и пароль минимум 8 символов';
    return;
  }

  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname: nick })
  });
  const data = await res.json();
  if (!data.success) {
    document.getElementById('regError').textContent = data.error;
    return;
  }
  showLogin();
  document.getElementById('regError').textContent = 'Аккаунт создан, войди';
}

async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.success) {
    document.getElementById('loginError').textContent = data.error;
    return;
  }

  currentUser = data.user;
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('chatPage').style.display = 'block';
  document.getElementById('chatNick').textContent = currentUser.nickname;
  loadGroups();
}

function logout() {
  currentUser = null;
  document.getElementById('chatPage').style.display = 'none';
  document.getElementById('loginPage').style.display = 'block';
}

async function loadGroups() {
  const res = await fetch(`/groups/${currentUser.id}`);
  const groups = await res.json();
  const list = document.getElementById('groupsList');
  list.innerHTML = groups.map(g => `
    <div onclick="joinGroup(${g.id})" style="padding:12px; background:#1a1a1a; margin:4px 0; border-radius:8px;">
      ${g.name}
    </div>
  `).join('');
}

function joinGroup(groupId) {
  currentGroup = groupId;
  loadMessages(groupId);
}

async function loadMessages(groupId) {
  const res = await fetch(`/messages/${groupId}`);
  const messages = await res.json();
  const area = document.getElementById('messagesArea');
  area.innerHTML = messages.map(m => `
    <div style="padding:8px; margin:4px 0; background:${m.user_id === currentUser.id ? '#1a1a2e' : '#1a1a1a'}; border-radius:8px;">
      <strong>${m.nickname}:</strong> ${m.text}
    </div>
  `).join('');
}

async function sendMessage() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text || !currentGroup) return;

  await fetch('/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      groupId: currentGroup,
      userId: currentUser.id,
      text
    })
  });

  input.value = '';
  loadMessages(currentGroup);
                                       }
