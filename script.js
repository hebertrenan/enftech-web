const API_URL = 'http://localhost:3000/api';

// Elementos do DOM
const formLogin = document.getElementById('form-login');
const formCadastro = document.getElementById('form-cadastro');

// 1. INTEGRAÇÃO COM A ROTA DE CADASTRO
formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita o recarregamento da página

  const nome = document.getElementById('cad-nome').value;
  const email = document.getElementById('cad-email').value;
  const senha = document.getElementById('cad-senha').value;

  try {
    const resposta = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      alert('✅ Cadastro realizado com sucesso! Faça login para continuar.');
      formCadastro.reset();
      // Alterna automaticamente para a aba de Login
      document.getElementById('tab-login').checked = true;
    } else {
      alert(`❌ Erro no cadastro: ${dados.erro || dados.mensagem}`);
    }
  } catch (error) {
    alert('⚠️ Não foi possível conectar ao servidor. Verifique se a API está rodando.');
  }
});

// 2. INTEGRAÇÃO COM A ROTA DE LOGIN + REDIRECIONAMENTO ENFTECH
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;

  try {
    const resposta = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      // Guards o Token JWT no armazenamento local
      localStorage.setItem('token', dados.token);
      
      // Redireciona diretamente para a página principal da Enftech
      window.location.href = 'home.html'; // <--- Altere se o arquivo da Home tiver outro nome
    } else {
      alert(`❌ Erro no login: ${dados.erro || dados.mensagem}`);
    }
  } catch (error) {
    alert('⚠️ Não foi possível conectar ao servidor.');
  }
});

// 3. TRAVA DE PROTEÇÃO E BUSCA DE PERFIL (Pode ser usada na página principal do Enftech)
async function carregarPerfil() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html'; // Se não tiver token, devolve para a tela de login
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
      // Exemplo: se houver um elemento com id="user-name" na home, atualiza o texto
      const elementoNome = document.getElementById('user-name');
      if (elementoNome) {
        elementoNome.innerText = dados.usuario.nome;
      }
    } else {
      // Se o token for inválido ou expirado, limpa o token e exige novo login
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  }
}