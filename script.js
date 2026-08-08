// ==========================================================================
// CONFIGURAÇÃO DA API EM PRODUÇÃO
// ==========================================================================
// Endereço fixo do back-end no Render
const API_URL = 'https://enftech-api.onrender.com/api';

/* ==========================================================================
   1. TRAVA DE SEGURANÇA UNIVERSAL (Executada imediatamente)
   ========================================================================== */
(function verificarAutenticacao() {
  const path = window.location.pathname.toLowerCase();
  const token = localStorage.getItem('token');

  // Identifica se o usuário está na página inicial/login
  const ePaginaLogin = path === '/' || path.endsWith('/index.html') || path.endsWith('/index') || path === '';

  // Se NÃO estiver na tela de login e NÃO tiver token, redireciona para o login
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

      const btnSubmit = formCadastro.querySelector('button[type="submit"]');
      const textoOriginalBtn = btnSubmit ? btnSubmit.innerText : '';
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = 'Cadastrando...';
      }

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
          alert(`❌ Erro no cadastro: ${dados.erro || dados.mensagem || 'Verifique os dados informados.'}`);
        }
      } catch (error) {
        console.error('Erro de conexão no cadastro:', error);
        alert('⚠️ Não foi possível conectar ao servidor no Render. Aguarde cerca de 30 segundos (o servidor pode estar acordando) e tente novamente.');
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerText = textoOriginalBtn;
        }
      }
    });
  }

  // --- ROTA DE LOGIN + REDIRECIONAMENTO ---
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btnSubmit = formLogin.querySelector('button[type="submit"]');
      const textoOriginalBtn = btnSubmit ? btnSubmit.innerText : '';
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = 'Entrando...';
      }

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
          alert(`❌ Erro no login: ${dados.erro || dados.mensagem || 'Credenciais inválidas.'}`);
        }
      } catch (error) {
        console.error('Erro de conexão no login:', error);
        alert('⚠️ Não foi possível conectar ao servidor no Render. Aguarde cerca de 30 segundos para o servidor responder e tente novamente.');
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerText = textoOriginalBtn;
        }
      }
    });
  }

  // --- EVENTO DE LOGOUT (BOTÃO SAIR) ---
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.replace('index.html');
    });
  }

  // --- CARREGAR DADOS DO PERFIL CASO ESTEJA NA HOME ---
  if (window.location.pathname.includes('home.html')) {
    carregarPerfil();
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const dados = await resposta.json();

    if (resposta.ok && dados.usuario) {
      const elementoNomeHeader = document.getElementById('user-name-display');
      const elementoNomePdf = document.getElementById('pdf-prof-nome');

      if (elementoNomeHeader) {
        elementoNomeHeader.innerText = dados.usuario.nome;
      }
      if (elementoNomePdf) {
        elementoNomePdf.innerText = dados.usuario.nome;
      }
    } else {
      localStorage.removeItem('token');
      window.location.replace('index.html');
    }
  } catch (error) {
    console.error('Erro ao carregar dados do perfil:', error);
    localStorage.removeItem('token');
    window.location.replace('index.html');
  }
}