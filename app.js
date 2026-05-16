// js/app.js

// ═══════════════════════════════════════
//  AUTH CHECK
// ═══════════════════════════════════════
const userRaw = localStorage.getItem('tf_user');
if (!userRaw) { window.location.href = 'index.html'; }
const USER = JSON.parse(userRaw);

document.getElementById('sidebarName').textContent = USER.nome;
document.getElementById('sidebarAvatar').textContent = USER.nome[0].toUpperCase();

function sair() {
  localStorage.removeItem('tf_user');
  window.location.href = 'index.html';
}

// ═══════════════════════════════════════
//  DATA
// ═══════════════════════════════════════
const STORAGE_KEY = 'tf_data_v2';

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  // Seed com dados de exemplo
  return {
    paineis: [
      { id: 1, nome: 'Trabalho', emoji: '💼', cor: '#8b5cf6', descricao: 'Tarefas profissionais', criadoEm: Date.now() },
      { id: 2, nome: 'Estudos',  emoji: '📚', cor: '#10b981', descricao: 'Aprendizado e cursos', criadoEm: Date.now() },
      { id: 3, nome: 'Pessoal',  emoji: '🏠', cor: '#f59e0b', descricao: 'Vida pessoal', criadoEm: Date.now() },
    ],
    tarefas: [
      { id: 101, painelId: 1, texto: 'Revisar relatório Q2', dia: 'segunda', prioridade: 'alta', feita: false },
      { id: 102, painelId: 1, texto: 'Reunião de equipe', dia: 'terca', prioridade: 'media', feita: false },
      { id: 103, painelId: 2, texto: 'Assistir aula de React', dia: 'quarta', prioridade: 'baixa', feita: true },
      { id: 104, painelId: 3, texto: 'Comprar mantimentos', dia: 'quinta', prioridade: 'media', feita: false },
    ]
  };
}

let data = loadData();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  atualizarStorageInfo();
}

// ═══════════════════════════════════════
//  STATE
// ═══════════════════════════════════════
let viewAtual = 'geral';
let painelAtivoId = null;
let filtroAtivo = 'todos';
let emojiSelecionado = '📋';
let corSelecionada = '#3b82f6';

// ═══════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════
let sidebarCollapsed = false;

document.getElementById('sidebarToggle').addEventListener('click', () => {
  sidebarCollapsed = !sidebarCollapsed;
  document.getElementById('sidebar').classList.toggle('collapsed', sidebarCollapsed);
});

document.getElementById('btnNovoPainel').addEventListener('click', () => {
  abrirModal('modalNovoPainel');
});

function renderSidebar() {
  const list = document.getElementById('painelList');
  list.innerHTML = '';

  data.paineis.forEach(p => {
    const total = data.tarefas.filter(t => t.painelId === p.id).length;
    const div = document.createElement('div');
    div.className = 'painel-item' + (painelAtivoId === p.id && viewAtual === 'painel' ? ' active' : '');
    div.innerHTML = `
      <div class="painel-item-dot" style="background:${p.cor}"></div>
      <span class="painel-item-icon">${p.emoji}</span>
      <span class="painel-item-name">${esc(p.nome)}</span>
      <span class="painel-item-count">${total}</span>
      <div class="painel-item-opts">
        <button class="btn-icon" onclick="abrirEditarPainel(event,${p.id})" title="Editar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>
    `;
    div.addEventListener('click', () => abrirPainel(p.id));
    list.appendChild(div);
  });

  // Nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (viewAtual === 'geral') document.querySelectorAll('.nav-item')[0]?.classList.add('active');
  if (viewAtual === 'agenda') document.querySelectorAll('.nav-item')[1]?.classList.add('active');
}

// ═══════════════════════════════════════
//  VIEWS
// ═══════════════════════════════════════
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

// Visão Geral
function abrirVisaoGeral() {
  viewAtual = 'geral'; painelAtivoId = null;
  showView('viewGeral');
  renderSidebar();
  renderVisaoGeral();
}

function renderVisaoGeral() {
  // Stats
  const total = data.tarefas.length;
  const feitas = data.tarefas.filter(t => t.feita).length;
  const pendentes = total - feitas;
  const alta = data.tarefas.filter(t => t.prioridade === 'alta' && !t.feita).length;

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="stat-label">Total de tarefas</div><div class="stat-value c-blue">${total}</div></div>
    <div class="stat-card"><div class="stat-label">Concluídas</div><div class="stat-value c-green">${feitas}</div></div>
    <div class="stat-card"><div class="stat-label">Pendentes</div><div class="stat-value c-warn">${pendentes}</div></div>
    <div class="stat-card"><div class="stat-label">Alta prioridade</div><div class="stat-value c-red">${alta}</div></div>
    <div class="stat-card"><div class="stat-label">Painéis</div><div class="stat-value c-blue">${data.paineis.length}</div></div>
  `;

  // Overview cards
  const grid = document.getElementById('overviewGrid');
  if (data.paineis.length === 0) {
    grid.innerHTML = `<div class="overview-empty">Nenhum painel criado ainda.<br>Clique em <strong>+</strong> na sidebar para criar seu primeiro painel.</div>`;
    return;
  }

  grid.innerHTML = data.paineis.map(p => {
    const ts = data.tarefas.filter(t => t.painelId === p.id);
    const done = ts.filter(t => t.feita).length;
    const pct = ts.length > 0 ? Math.round((done / ts.length) * 100) : 0;
    return `
      <div class="overview-card" onclick="abrirPainel(${p.id})">
        <div class="overview-card-top" style="background:${p.cor}"></div>
        <div class="overview-card-body">
          <div class="overview-card-title">
            <span>${p.emoji}</span>
            <span>${esc(p.nome)}</span>
          </div>
          <div class="overview-card-meta">
            <span>${ts.length} tarefas</span>
            <span>·</span>
            <span>${done} concluídas</span>
          </div>
          <div class="overview-progress">
            <div class="overview-progress-bar">
              <div class="overview-progress-fill" style="width:${pct}%;background:${p.cor}"></div>
            </div>
            <div class="overview-progress-label">${pct}% concluído</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Agenda
function abrirAgenda() {
  viewAtual = 'agenda'; painelAtivoId = null;
  showView('viewAgenda');
  renderSidebar();
  renderAgenda();
}

const DIAS_SEMANA = [
  { id: 'segunda', nome: 'Segunda' },
  { id: 'terca',   nome: 'Terça' },
  { id: 'quarta',  nome: 'Quarta' },
  { id: 'quinta',  nome: 'Quinta' },
  { id: 'sexta',   nome: 'Sexta' },
];

const HOJE_IDX = (new Date().getDay() + 6) % 7;
const HOJE_DIA = ['segunda','terca','quarta','quinta','sexta'][HOJE_IDX] || null;

function renderAgenda() {
  const grid = document.getElementById('weekGrid');
  grid.innerHTML = DIAS_SEMANA.map(d => {
    const tarefasDia = data.tarefas.filter(t => t.dia === d.id);
    const isHoje = d.id === HOJE_DIA;

    const cards = tarefasDia.length === 0
      ? `<div class="week-empty">Sem tarefas</div>`
      : tarefasDia.map(t => {
          const painel = data.paineis.find(p => p.id === t.painelId);
          return `
            <div class="week-task${t.feita ? ' done' : ''}" id="wt-${t.id}">
              <div class="wt-cb" onclick="toggleTarefa(${t.id})">
                <svg width="8" height="8" viewBox="0 0 12 10" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 5 4.5 9 11 1"/>
                </svg>
              </div>
              <div class="wt-body">
                <div class="wt-text">${esc(t.texto)}</div>
                ${painel ? `<div class="wt-painel" style="color:${painel.cor}">${painel.emoji} ${esc(painel.nome)}</div>` : ''}
              </div>
            </div>
          `;
        }).join('');

    return `
      <div class="week-col${isHoje ? ' today' : ''}">
        <div class="week-col-header">
          <span class="week-day-name">${d.nome}</span>
          <div style="display:flex;gap:5px;align-items:center">
            ${isHoje ? '<span class="today-chip">Hoje</span>' : ''}
            <span class="week-col-count">${tarefasDia.length}</span>
          </div>
        </div>
        <div class="week-col-tasks">${cards}</div>
      </div>
    `;
  }).join('');
}

// Painel
function abrirPainel(id) {
  painelAtivoId = id;
  viewAtual = 'painel';
  filtroAtivo = 'todos';
  showView('viewPainel');
  renderSidebar();
  renderPainel();
}

function renderPainel() {
  const painel = data.paineis.find(p => p.id === painelAtivoId);
  if (!painel) { abrirVisaoGeral(); return; }

  const tarefas = data.tarefas.filter(t => t.painelId === painelAtivoId);
  const feitas = tarefas.filter(t => t.feita).length;
  const pendentes = tarefas.length - feitas;
  const pct = tarefas.length > 0 ? Math.round((feitas / tarefas.length) * 100) : 0;

  const view = document.getElementById('viewPainel');
  view.innerHTML = `
    <div class="painel-view-header">
      <div class="painel-view-title-row">
        <span class="page-emoji">${painel.emoji}</span>
        <input
          class="painel-title-input"
          value="${esc(painel.nome)}"
          maxlength="40"
          onchange="renomearPainelInline(${painel.id}, this.value)"
        >
      </div>
      <div class="painel-actions">
        <button class="btn-sm" onclick="abrirEditarPainel(event, ${painel.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar
        </button>
      </div>
    </div>

    <input
      class="painel-desc-input"
      value="${esc(painel.descricao || '')}"
      placeholder="Adicione uma descrição…"
      maxlength="100"
      onchange="editarDescricao(${painel.id}, this.value)"
    >

    <div class="painel-stats-row">
      <div class="painel-stat">
        <span class="painel-stat-label">Total</span>
        <span class="painel-stat-val" style="color:#60a5fa">${tarefas.length}</span>
      </div>
      <div class="painel-stat-divider"></div>
      <div class="painel-stat">
        <span class="painel-stat-label">Feitas</span>
        <span class="painel-stat-val" style="color:#86efac">${feitas}</span>
      </div>
      <div class="painel-stat-divider"></div>
      <div class="painel-stat">
        <span class="painel-stat-label">Pendentes</span>
        <span class="painel-stat-val" style="color:#fcd34d">${pendentes}</span>
      </div>
      <div class="painel-stat-divider"></div>
      <div class="painel-progress-wrap">
        <div class="painel-progress-track">
          <div class="painel-progress-bar" style="width:${pct}%;background:${painel.cor}"></div>
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:3px">${pct}% concluído</div>
      </div>
    </div>

    <!-- Form adicionar -->
    <div class="add-task-form">
      <div class="ff grow">
        <label>Nova Tarefa</label>
        <input class="form-inp" type="text" id="newTaskText" placeholder="O que precisa ser feito?" maxlength="120">
      </div>
      <div class="ff">
        <label>Dia</label>
        <select class="form-inp" id="newTaskDia">
          ${DIAS_SEMANA.map(d => `<option value="${d.id}"${d.id === HOJE_DIA ? ' selected' : ''}>${d.nome}</option>`).join('')}
        </select>
      </div>
      <div class="ff">
        <label>Prioridade</label>
        <select class="form-inp" id="newTaskPrio">
          <option value="baixa">🟢 Baixa</option>
          <option value="media" selected>🟡 Média</option>
          <option value="alta">🔴 Alta</option>
        </select>
      </div>
      <div class="ff" style="justify-content:flex-end">
        <button class="btn-sm accent" onclick="adicionarTarefa()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filter-bar">
      <button class="ftab${filtroAtivo === 'todos' ? ' active' : ''}" onclick="setFiltro('todos')">Todas</button>
      <button class="ftab${filtroAtivo === 'pendente' ? ' active' : ''}" onclick="setFiltro('pendente')">Pendentes</button>
      <button class="ftab${filtroAtivo === 'feita' ? ' active' : ''}" onclick="setFiltro('feita')">Concluídas</button>
      <button class="ftab${filtroAtivo === 'alta' ? ' active' : ''}" onclick="setFiltro('alta')">Alta prioridade</button>
      ${DIAS_SEMANA.map(d => `<button class="ftab${filtroAtivo === d.id ? ' active' : ''}" onclick="setFiltro('${d.id}')">${d.nome}</button>`).join('')}
    </div>

    <!-- Tarefas por dia -->
    <div id="taskSections">
      ${renderTaskSections(painelAtivoId)}
    </div>
  `;

  // Enter para adicionar
  document.getElementById('newTaskText')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') adicionarTarefa();
  });
}

function renderTaskSections(painelId) {
  const painel = data.paineis.find(p => p.id === painelId);
  let tarefas = data.tarefas.filter(t => t.painelId === painelId);

  // Filtro
  if (filtroAtivo === 'pendente') tarefas = tarefas.filter(t => !t.feita);
  else if (filtroAtivo === 'feita') tarefas = tarefas.filter(t => t.feita);
  else if (filtroAtivo === 'alta') tarefas = tarefas.filter(t => t.prioridade === 'alta');
  else if (DIAS_SEMANA.some(d => d.id === filtroAtivo)) tarefas = tarefas.filter(t => t.dia === filtroAtivo);

  // Agrupa por dia
  const grupos = DIAS_SEMANA.map(d => ({
    dia: d,
    tarefas: tarefas.filter(t => t.dia === d.id)
  })).filter(g => g.tarefas.length > 0 || filtroAtivo === 'todos' || filtroAtivo === g.dia.id);

  if (tarefas.length === 0 && filtroAtivo !== 'todos') {
    return `<div class="empty-tasks">Nenhuma tarefa neste filtro.</div>`;
  }

  return grupos.map(g => `
    <div class="task-section">
      <div class="task-section-header">
        <span class="task-section-label">${g.dia.nome}</span>
        ${g.dia.id === HOJE_DIA ? '<span class="today-chip">Hoje</span>' : ''}
        <span class="task-section-count">${g.tarefas.length}</span>
      </div>
      <div class="tasks-list">
        ${g.tarefas.length === 0
          ? `<div class="empty-tasks">Sem tarefas para ${g.dia.nome.toLowerCase()}</div>`
          : g.tarefas.map(t => taskCardHTML(t, painel)).join('')
        }
      </div>
    </div>
  `).join('');
}

function taskCardHTML(t, painel) {
  return `
    <div class="task-card${t.feita ? ' done' : ''}" id="tc-${t.id}">
      <div class="task-cb" onclick="toggleTarefa(${t.id})">
        <svg width="8" height="8" viewBox="0 0 12 10" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 5 4.5 9 11 1"/>
        </svg>
      </div>
      <div class="task-body">
        <div class="task-text">${esc(t.texto)}</div>
        <div class="task-meta">
          <span class="p-badge ${t.prioridade}">${t.prioridade}</span>
          <span class="day-badge">${DIAS_SEMANA.find(d => d.id === t.dia)?.nome || t.dia}</span>
        </div>
      </div>
      <button class="btn-del" onclick="excluirTarefa(${t.id})" title="Excluir">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `;
}

// ═══════════════════════════════════════
//  TAREFAS
// ═══════════════════════════════════════
function adicionarTarefa() {
  const input = document.getElementById('newTaskText');
  const dia = document.getElementById('newTaskDia')?.value;
  const prio = document.getElementById('newTaskPrio')?.value;

  if (!input || !input.value.trim()) {
    toast('Digite uma descrição para a tarefa.', 'e');
    input?.focus();
    return;
  }

  data.tarefas.push({
    id: Date.now(),
    painelId: painelAtivoId,
    texto: input.value.trim(),
    dia: dia || 'segunda',
    prioridade: prio || 'media',
    feita: false,
    criadoEm: Date.now()
  });

  save();
  input.value = '';
  renderPainel();
  renderSidebar();
  toast('Tarefa adicionada! ✓', 's');
}

function toggleTarefa(id) {
  const t = data.tarefas.find(t => t.id === id);
  if (!t) return;
  t.feita = !t.feita;
  save();
  // Re-render da view atual
  if (viewAtual === 'painel') renderPainel();
  else if (viewAtual === 'agenda') renderAgenda();
  else renderVisaoGeral();
}

function excluirTarefa(id) {
  data.tarefas = data.tarefas.filter(t => t.id !== id);
  save();
  renderPainel();
  renderSidebar();
  toast('Tarefa removida.', '');
}

function setFiltro(f) {
  filtroAtivo = f;
  renderPainel();
}

// ═══════════════════════════════════════
//  PAINEIS
// ═══════════════════════════════════════
function criarPainel() {
  const nome = document.getElementById('novoPainelNome').value.trim();
  if (!nome) {
    document.getElementById('novoPainelNome').focus();
    return;
  }

  const novoPainel = {
    id: Date.now(),
    nome,
    emoji: emojiSelecionado,
    cor: corSelecionada,
    descricao: '',
    criadoEm: Date.now()
  };

  data.paineis.push(novoPainel);
  save();
  fecharModal('modalNovoPainel');
  document.getElementById('novoPainelNome').value = '';
  renderSidebar();
  abrirPainel(novoPainel.id);
  toast(`Painel "${nome}" criado! ✓`, 's');
}

function abrirEditarPainel(e, id) {
  e.stopPropagation();
  const p = data.paineis.find(p => p.id === id);
  if (!p) return;
  document.getElementById('editPainelId').value = id;
  document.getElementById('editPainelNome').value = p.nome;
  abrirModal('modalEditarPainel');
}

function salvarEdicaoPainel() {
  const id = parseInt(document.getElementById('editPainelId').value);
  const nome = document.getElementById('editPainelNome').value.trim();
  if (!nome) return;
  const p = data.paineis.find(p => p.id === id);
  if (p) { p.nome = nome; save(); }
  fecharModal('modalEditarPainel');
  renderSidebar();
  if (painelAtivoId === id) renderPainel();
  if (viewAtual === 'geral') renderVisaoGeral();
  toast('Painel atualizado.', 's');
}

function excluirPainelConfirm() {
  const id = parseInt(document.getElementById('editPainelId').value);
  const p = data.paineis.find(p => p.id === id);
  if (!p) return;
  if (!confirm(`Excluir o painel "${p.nome}" e todas as suas ${data.tarefas.filter(t => t.painelId === id).length} tarefas?`)) return;
  data.paineis = data.paineis.filter(p => p.id !== id);
  data.tarefas = data.tarefas.filter(t => t.painelId !== id);
  save();
  fecharModal('modalEditarPainel');
  abrirVisaoGeral();
  toast('Painel excluído.', '');
}

function renomearPainelInline(id, nome) {
  const p = data.paineis.find(p => p.id === id);
  if (p && nome.trim()) { p.nome = nome.trim(); save(); renderSidebar(); }
}

function editarDescricao(id, desc) {
  const p = data.paineis.find(p => p.id === id);
  if (p) { p.descricao = desc; save(); }
}

// ═══════════════════════════════════════
//  MODAIS
// ═══════════════════════════════════════
function abrirModal(id) {
  document.getElementById(id).classList.add('open');
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Fecha modal clicando fora
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// Emoji picker
document.getElementById('emojiPicker').addEventListener('click', e => {
  const btn = e.target.closest('.emoji-opt');
  if (!btn) return;
  document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  emojiSelecionado = btn.dataset.emoji;
});

// Color picker
document.getElementById('colorPicker').addEventListener('click', e => {
  const btn = e.target.closest('.color-opt');
  if (!btn) return;
  document.querySelectorAll('.color-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  corSelecionada = btn.dataset.color;
});

// Enter no modal criar painel
document.getElementById('novoPainelNome').addEventListener('keydown', e => {
  if (e.key === 'Enter') criarPainel();
  if (e.key === 'Escape') fecharModal('modalNovoPainel');
});

// ═══════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════
let toastTimer;
function toast(msg, tipo) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + (tipo || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

// ═══════════════════════════════════════
//  STORAGE INFO
// ═══════════════════════════════════════
function atualizarStorageInfo() {
  const total = data.tarefas.length;
  document.getElementById('storageText').textContent = `${total} tarefa${total !== 1 ? 's' : ''} salva${total !== 1 ? 's' : ''}`;
  const pct = Math.min(100, (total / 200) * 100);
  document.getElementById('storageFill').style.width = pct + '%';
}

// ═══════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════
function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
renderSidebar();
atualizarStorageInfo();
abrirVisaoGeral();

// ═══════════════════════════════════════
//  MOBILE DRAWER
// ═══════════════════════════════════════
function abrirDrawer() {
  renderDrawer();
  document.getElementById('mobileDrawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
}

function fecharDrawer() {
  document.getElementById('mobileDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}

function renderDrawer() {
  // Atualiza user info
  document.getElementById('drawerAvatar').textContent = USER.nome[0].toUpperCase();
  document.getElementById('drawerName').textContent = USER.nome;

  const list = document.getElementById('drawerPainelList');
  if (!list) return;

  list.innerHTML = data.paineis.length === 0
    ? '<div style="padding:16px;color:var(--text3);font-size:13px;text-align:center">Nenhum painel ainda</div>'
    : data.paineis.map(p => {
        const total = data.tarefas.filter(t => t.painelId === p.id).length;
        return `
          <div class="painel-item${painelAtivoId === p.id && viewAtual === 'painel' ? ' active' : ''}"
               onclick="fecharDrawer();abrirPainel(${p.id})">
            <div class="painel-item-dot" style="background:${p.cor}"></div>
            <span class="painel-item-icon">${p.emoji}</span>
            <span class="painel-item-name">${esc(p.nome)}</span>
            <span class="painel-item-count">${total}</span>
          </div>
        `;
      }).join('');
}
