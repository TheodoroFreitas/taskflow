// js/login.js

const USERS = [
  { email: 'admin@gmail.com', senha: '1234', nome: 'Admin' }
];

document.getElementById('senha').addEventListener('keydown', e => {
  if (e.key === 'Enter') fazerLogin();
});
document.getElementById('email').addEventListener('keydown', e => {
  if (e.key === 'Enter') fazerLogin();
});

function fazerLogin() {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const errBox = document.getElementById('errorBox');

  if (!email || !senha) {
    mostrarErro('Preencha todos os campos.');
    return;
  }

  const user = USERS.find(u => u.email === email && u.senha === senha);

  if (user) {
    errBox.classList.remove('show');
    localStorage.setItem('tf_user', JSON.stringify({ nome: user.nome, email: user.email }));
    const btn = document.getElementById('btnLogin');
    btn.textContent = 'Entrando…';
    btn.disabled = true;
    setTimeout(() => { window.location.href = 'app.html'; }, 300);
  } else {
    mostrarErro('Email ou senha inválidos. Tente novamente.');
  }
}

function mostrarErro(msg) {
  const el = document.getElementById('errorText');
  el.textContent = msg;
  document.getElementById('errorBox').classList.add('show');
}
