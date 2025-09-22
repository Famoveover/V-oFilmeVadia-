// Aguarda o DOM (Document Object Model) ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona o formulário na página de login
    const form = document.querySelector('form');
    // Seleciona o campo de nome de usuário
    const usernameInput = document.getElementById('floatingInputName');
    // Seleciona o campo de foto de perfil
    const photoInput = document.getElementById('formFile');

    // Adiciona um "ouvinte de evento" para o envio do formulário
    form.addEventListener('submit', (e) => {
        // Previne o comportamento padrão de recarregar a página ao enviar o formulário
        e.preventDefault();

        // Obtém o nome de usuário (removendo espaços em branco no início e fim)
        const username = usernameInput.value.trim();
        // Obtém o arquivo de foto, se houver
        const photoFile = photoInput.files[0];

        // Se o campo de nome de usuário estiver vazio, exibe um alerta e impede a ação
        if (!username) {
            alert('Por favor, insira um nome de usuário.');
            return;
        }

        // Cria um objeto para armazenar os dados do perfil do usuário
        const userProfile = {
            username: username,
            photoUrl: 'https://via.placeholder.com/40', // Define uma URL de foto padrão
            moviesWatched: [],
            ratings: [],
            comments: []
        };

        // Salva o objeto de perfil no localStorage
        // O nome da chave será "currentUser"
        localStorage.setItem('currentUser', JSON.stringify(userProfile));

        // Redireciona o usuário para a página de perfil
        window.location.href = 'profile.html';
    });
});