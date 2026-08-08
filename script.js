// Configuração Dinâmica da URL da API
const isProduction = window.location.hostname.includes('vercel.app');
const API_URL = isProduction 
  ? 'https://enftech-api.onrender.com/api' // Altere para a URL real do seu back-end em produção quando subir
  : 'http://localhost:3000/api';

/* ==========================================================================
   1. TRAVA DE SEGURANÇA UNIVERSAL (Executada imediatamente)
   ========================================================================== */
(function verificarAutenticacao() {
  const path = window.location.pathname.toLowerCase();
  const token = localStorage.getItem('token');

  // Identifica se o usuário está na página inicial/login
  const ePaginaLogin = path === '/' || path.endsWith('/index.html') || path.endsWith('/index');

  // Se NÃO estiver na tela de login e NÃO tiver token, expulsa para o login
  if (!ePaginaLogin && !token) {
    window.location.replace('index.html');
  }
})();

/* ==========================================================================
   2. INICIALIZAÇÃO DE EVENTOS DO DOM
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');
  const btnLogout = document.getElementById('btn-logout');

  // --- ROTA DE CADASTRO ---
  if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nome = document.getElementById('cad-nome').value;
      const email = document.getElementById('cad-email').value;
      const senha = document.getElementById('cad-senha').value;

      try {
        const resposta = await fetch(`${API_URL}/auth/registro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
          alert('✅ Cadastro realizado com sucesso! Faça login para continuar.');
          formCadastro.reset();
          const tabLogin = document.getElementById('tab-login');
          if (tabLogin) tabLogin.checked = true;
        } else {
          alert(`❌ Erro no cadastro: ${dados.erro || dados.mensagem}`);
        }
      } catch (error) {
        alert('⚠️ Não foi possível conectar ao servidor. Verifique se a API está rodando.');
      }
    });
  }

  // --- ROTA DE LOGIN + REDIRECIONAMENTO ---
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('login-email').value;
      const senha = document.getElementById('login-senha').value;

      try {
        const resposta = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
          localStorage.setItem('token', dados.token);
          window.location.href = 'home.html';
        } else {
          alert(`❌ Erro no login: ${dados.erro || dados.mensagem}`);
        }
      } catch (error) {
        alert('⚠️ Não foi possível conectar ao servidor.');
      }
    });
  }

  // --- EVENTO DE LOGOUT (BOTAO SAIR) ---
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.replace('index.html');
    });
  }

  // --- CARREGAR DADOS DO PERFIL E NAVEGAÇÃO CASO ESTEJA NA HOME ---
  if (window.location.pathname.includes('home.html')) {
    carregarPerfil();
    inicializarNavegacaoAbas();
  }
});

/* ==========================================================================
   3. BUSCA O PERFIL DO USUÁRIO LOGADO
   ========================================================================== */
async function carregarPerfil() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.replace('index.html');
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/usuario/meu-perfil`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      const elementoNomeHeader = document.getElementById('user-name-display');
      const elementoNomePdf = document.getElementById('pdf-prof-nome');

      if (elementoNomeHeader) {
        elementoNomeHeader.innerText = dados.usuario.nome;
      }
      if (elementoNomePdf) {
        elementoNomePdf.innerText = dados.usuario.nome;
      }
    } else {
      // Se o token for inválido ou expirado, limpa e redireciona
      localStorage.removeItem('token');
      window.location.replace('index.html');
    }
  } catch (error) {
    console.error('Erro ao carregar dados do perfil:', error);
    // Se a conexão falhar (ex: tentativa de acesso ao localhost em dispositivo externo), bloqueia e redireciona
    localStorage.removeItem('token');
    window.location.replace('index.html');
  }
}

/* ==========================================================================
   4. SISTEMA DE NAVEGAÇÃO DAS ABAS NA HOME
   ========================================================================== */
function inicializarNavegacaoAbas() {
  // Troca de Seções Principais (Home, EnfCare Hub, Projetos, etc)
  const navLinks = document.querySelectorAll('.nav-link');
  const tabSections = document.querySelectorAll('.tab-section');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.getAttribute('data-target');

      navLinks.forEach(l => l.classList.remove('active'));
      tabSections.forEach(s => s.classList.remove('active'));

      link.classList.add('active');
      const sectionAlvo = document.getElementById(target);
      if (sectionAlvo) sectionAlvo.classList.add('active');
    });
  });

  // Troca de Escalas no EnfCare Hub (PA, Glasgow, Braden, etc)
  const scaleLinks = document.querySelectorAll('.scale-link');
  const scaleViews = document.querySelectorAll('.scale-view');

  scaleLinks.forEach(link => {
    link.addEventListener('click', () => {
      const viewId = link.getAttribute('data-view');

      scaleLinks.forEach(l => l.classList.remove('active'));
      scaleViews.forEach(v => v.classList.remove('active'));

      link.classList.add('active');
      const viewAlvo = document.getElementById(viewId);
      if (viewAlvo) viewAlvo.classList.add('active');
    });
  });
}

/* ==========================================================================
   5. CÁLCULOS E PROTOCOLOS DAS ESCALAS CLÍNICAS
   ========================================================================== */

// --- CÁLCULO GLASGOW-P ---
function calcGlasgow() {
  const o = parseInt(document.getElementById('g-o').value) || 0;
  const v = parseInt(document.getElementById('g-v').value) || 0;
  const m = parseInt(document.getElementById('g-m').value) || 0;
  const p = parseInt(document.getElementById('g-p').value) || 0;

  const total = o + v + m + p;
  const resBox = document.getElementById('res-glasgow');
  const outTotal = document.getElementById('g-out-total');
  const outCat = document.getElementById('g-out-cat');

  let classificacao = "";
  if (total <= 8) classificacao = "Trauma Cranioencefálico Grave (TCE Grave)";
  else if (total <= 12) classificacao = "Trauma Cranioencefálico Moderado (TCE Moderado)";
  else classificacao = "Trauma Cranioencefálico Leve (TCE Leve)";

  outTotal.innerText = `Pontuação Final: ${total}`;
  outCat.innerText = classificacao;
  resBox.style.display = 'block';
}

// --- CÁLCULO BRADEN ---
function calcBraden() {
  const b1 = parseInt(document.getElementById('b1').value);
  const b2 = parseInt(document.getElementById('b2').value);
  const b3 = parseInt(document.getElementById('b3').value);
  const b4 = parseInt(document.getElementById('b4').value);
  const b5 = parseInt(document.getElementById('b5').value);
  const b6 = parseInt(document.getElementById('b6').value);

  const total = b1 + b2 + b3 + b4 + b5 + b6;
  const resBox = document.getElementById('res-braden');
  const outTotal = document.getElementById('b-out-total');
  const outCat = document.getElementById('b-out-cat');

  let risco = "";
  if (total <= 9) risco = "Risco Muito Elevado";
  else if (total <= 12) risco = "Risco Elevado";
  else if (total <= 14) risco = "Risco Moderado";
  else risco = "Baixo Risco / Sem Risco";

  outTotal.innerText = `Score Braden: ${total}`;
  outCat.innerText = risco;
  resBox.style.display = 'block';
}

// --- CÁLCULO IMC ---
function calcIMC() {
  const peso = parseFloat(document.getElementById('imc-p').value);
  const altura = parseFloat(document.getElementById('imc-a').value);
  const resBox = document.getElementById('res-imc');

  if (!peso || !altura) {
    alert("Informe o peso e a altura corretamente.");
    return;
  }

  const imc = (peso / (altura * altura)).toFixed(2);
  let status = "";

  if (imc < 18.5) status = "Abaixo do peso";
  else if (imc < 24.9) status = "Peso normal";
  else if (imc < 29.9) status = "Sobrepeso";
  else status = "Obesidade";

  resBox.innerHTML = `<h3>IMC: ${imc}</h3><p><strong>Classificação:</strong> ${status}</p>`;
  resBox.style.display = 'block';
}

// --- CÁLCULO GOTAS ---
function calcGotas() {
  const vol = parseFloat(document.getElementById('got-v').value);
  const tempo = parseFloat(document.getElementById('got-t').value);
  const resBox = document.getElementById('res-gotas');

  if (!vol || !tempo) {
    alert("Informe o volume e o tempo corretamente.");
    return;
  }

  const gotasMin = Math.round(vol / (tempo * 3));
  const microgotasMin = Math.round(vol / tempo);

  resBox.innerHTML = `<h3>Gotas: ${gotasMin} gtt/min</h3><p><strong>Microgotas:</strong> ${microgotasMin} mcgtt/min</p>`;
  resBox.style.display = 'block';
}

// --- GERAÇÃO DE RELATÓRIO PDF ---
function gerarRelatorioPDF() {
  const nomePaciente = document.getElementById('paciente-nome').value || "Não identificado";
  document.getElementById('pdf-p-nome').innerText = nomePaciente;
  document.getElementById('pdf-p-data').innerText = new Date().toLocaleString('pt-BR');

  const element = document.getElementById('pdf-template');
  const opt = {
    margin:       10,
    filename:     `Triagem_${nomePaciente.replace(/\s+/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}