// js/login.js - Versão com Login e Cadastro via Backend

// Função para salvar o perfil do usuário no localStorage
const saveUserToLocalStorage = (user) => {
    // Salva o objeto completo do usuário no localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Redireciona para a página principal após login/cadastro
    window.location.href = '../pages/profile.html'; 
};

// Função para verificar se o usuário já está logado
const checkLoggedIn = () => {
    // Verifica se existe um usuário salvo na sessão
    const user = localStorage.getItem('currentUser');
    if (user) {
        // Se o usuário existir, redireciona automaticamente para o perfil
        window.location.href = '../pages/profile.html';
    }
};


document.addEventListener('DOMContentLoaded', () => {

    // CHAMA A VERIFICAÇÃO DE LOGIN
    checkLoggedIn(); 

    // --- Seletores para o Formulário de Cadastro ---
    const registerForm = document.getElementById('registerForm');
    const emailInputRegister = document.getElementById('floatingInputEmailRegister');
    const usernameInputRegister = document.getElementById('floatingInputNameRegister');
    const passwordInputRegister = document.getElementById('floatingInputPasswordRegister');

    // --- Seletores para o Formulário de Login ---
    const loginForm = document.getElementById('loginForm');
    const emailInputLogin = document.getElementById('floatingInputEmailLogin');
    const passwordInputLogin = document.getElementById('floatingInputPasswordLogin');

    // =========================================================
    // LÓGICA DE CADASTRO (REGISTER)
    // =========================================================
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInputRegister.value.trim();
        const username = usernameInputRegister.value.trim();
        const password = passwordInputRegister.value;

        if (!email || !username || !password || password.length < 6) {
            alert('Por favor, preencha todos os campos. A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        
        const userData = { email, username, password };

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Cadastro realizado com sucesso! Bem-vindo(a), ${username}!`);
                
                // Salva o usuário no localStorage e redireciona
                saveUserToLocalStorage({ id: result.userId, username, email, photoUrl: 'https://via.placeholder.com/40' });
            } else {
                alert(`Erro no cadastro: ${result.message || 'Ocorreu um erro desconhecido.'}`);
            }

        } catch (error) {
            console.error('Erro de conexão com o servidor:', error);
            alert('ERRO: Não foi possível conectar ao servidor. O Node.js está rodando?');
        }
    });

    // =========================================================
    // LÓGICA DE LOGIN (LOG IN)
    // =========================================================
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInputLogin.value.trim();
        const password = passwordInputLogin.value;

        if (!email || !password) {
            alert('Por favor, preencha o e-mail e a senha.');
            return;
        }
        
        const loginData = { email, password };

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Login bem-sucedido! Bem-vindo(a), ${result.user.username}!`);
                
                // Salva o usuário no localStorage e redireciona
                saveUserToLocalStorage(result.user);
            } else {
                alert(`Erro no Login: ${result.message || 'Credenciais inválidas. Tente novamente.'}`);
            }

        } catch (error) {
            console.error('Erro de conexão com o servidor:', error);
            alert('ERRO: Não foi possível conectar ao servidor. O Node.js está rodando?');
        }
    });

});
