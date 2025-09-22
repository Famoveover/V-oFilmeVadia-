// Aguarda o DOM ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carregar os dados do usuário do localStorage
    const userProfileString = localStorage.getItem('currentUser');

    // 2. Verificar se há um usuário logado
    if (!userProfileString) {
        window.location.href = 'login.html';
        return;
    }

    const userProfile = JSON.parse(userProfileString);

    // 3. Selecionar os elementos na página
    const usernameDisplay = document.getElementById('usernameDisplay');
    const profilePic = document.getElementById('profilePic');
    const editProfileButton = document.getElementById('editProfileButton');
    const editProfileSection = document.getElementById('editProfileSection');
    const editProfileForm = document.getElementById('editProfileForm');
    const newUsernameInput = document.getElementById('newUsernameInput');
    const newPhotoInput = document.getElementById('newPhotoInput');
    const cancelEditButton = document.getElementById('cancelEditButton');

    // 4. Inserir os dados do usuário nos elementos da página
    usernameDisplay.textContent = userProfile.username;
    if (userProfile.photoUrl) {
        profilePic.src = userProfile.photoUrl;
    }

    // 5. Adicionar a lógica para o botão "Editar Perfil"
    editProfileButton.addEventListener('click', () => {
        // Exibe a seção de edição
        editProfileSection.classList.remove('d-none');
        // Oculta o botão de edição principal
        editProfileButton.classList.add('d-none');
        // Preenche o campo de nome com o nome atual do usuário
        newUsernameInput.value = userProfile.username;
    });

    // 6. Adicionar a lógica para o botão "Cancelar"
    cancelEditButton.addEventListener('click', () => {
        // Oculta a seção de edição
        editProfileSection.classList.add('d-none');
        // Exibe o botão de edição principal
        editProfileButton.classList.remove('d-none');
    });

    // 7. Adicionar a lógica para o formulário de edição
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newUsername = newUsernameInput.value.trim();
        const newPhotoFile = newPhotoInput.files[0];

        if (newUsername) {
            userProfile.username = newUsername;
        }

        if (newPhotoFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                userProfile.photoUrl = reader.result;
                // Salva o perfil atualizado
                localStorage.setItem('currentUser', JSON.stringify(userProfile));
                // Recarrega a página para mostrar as mudanças
                location.reload();
            };
            reader.readAsDataURL(newPhotoFile);
        } else {
            // Se não houver nova foto, apenas atualiza o nome se necessário e salva
            localStorage.setItem('currentUser', JSON.stringify(userProfile));
            location.reload();
        }
    });
});