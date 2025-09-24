// Aguarda o DOM ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    const userProfileString = localStorage.getItem('currentUser');
    if (!userProfileString) {
        window.location.href = 'login.html';
        return;
    }

    const userProfile = JSON.parse(userProfileString);

    // Seleção de todos os elementos
    const usernameDisplay = document.getElementById('usernameDisplay');
    const profilePic = document.getElementById('profilePic');
    const userBio = document.getElementById('userBio');
    const editProfileButton = document.getElementById('editProfileButton');
    const editProfileSection = document.getElementById('editProfileSection');
    const editProfileForm = document.getElementById('editProfileForm');
    const newUsernameInput = document.getElementById('newUsernameInput');
    const newPhotoInput = document.getElementById('newPhotoInput');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const editBioButton = document.getElementById('editBioButton');
    const editBioSection = document.getElementById('editBioSection');
    const editBioForm = document.getElementById('editBioForm');
    const newBioInput = document.getElementById('newBioInput');
    const cancelBioButton = document.getElementById('cancelBioButton');

    const addMovieForm = document.getElementById('addMovieForm');
    const movieTitleSelect = document.getElementById('movieTitleSelect');
    const moviesList = document.getElementById('moviesList');
    const ratingsList = document.getElementById('ratingsList');

    let availableMovies = [];

    // Função para carregar os filmes do arquivo JSON
    const loadMovies = async () => {
        try {
            const response = await fetch('../data/movies.json');
            availableMovies = await response.json();
            populateMovieSelect();
            renderMovies();
            renderRatings();
        } catch (error) {
            console.error('Erro ao carregar os filmes:', error);
        }
    };

    // Função para preencher o menu suspenso de filmes
    const populateMovieSelect = () => {
        movieTitleSelect.innerHTML = '';
        availableMovies.forEach(movie => {
            const option = document.createElement('option');
            option.value = movie.id;
            option.textContent = movie.title;
            movieTitleSelect.appendChild(option);
        });
    };

    // Funções de renderização
    const renderMovies = () => {
        moviesList.innerHTML = '';
        if (userProfile.moviesWatched && userProfile.moviesWatched.length > 0) {
            userProfile.moviesWatched.forEach(movie => {
                // Encontra a avaliação mais recente do filme no perfil do usuário
                const latestRating = userProfile.ratings.find(r => r.id === movie.id);
                const ratingText = latestRating ? `Sua Avaliação: ⭐ ${latestRating.rating}/5` : 'Não Avaliado';

                const movieCard = document.createElement('div');
                movieCard.classList.add('col', 'd-flex', 'align-items-start');
                movieCard.innerHTML = `
                    <div class="card shadow-sm w-100">
                        <img src="${movie.posterUrl}" class="card-img-top" alt="Pôster do Filme">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <a href="./movie.html?id=${movie.id}" class="btn btn-sm btn-outline-secondary">Ver Detalhes</a>
                                <small class="text-muted">${ratingText}</small>
                            </div>
                        </div>
                    </div>
                `;
                moviesList.appendChild(movieCard);
            });
        }
    };

    const renderRatings = () => {
        ratingsList.innerHTML = '';
        if (userProfile.ratings && userProfile.ratings.length > 0) {
            userProfile.ratings.forEach(rating => {
                const ratingItem = document.createElement('a');
                ratingItem.href = `./movie.html?id=${rating.id}`;
                ratingItem.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'gap-3', 'py-3');
                ratingItem.innerHTML = `
                    <div class="d-flex gap-2 w-100 justify-content-between">
                        <div>
                            <h6 class="mb-0">${rating.movieTitle}</h6>
                            <p class="mb-0 opacity-75">"${rating.comment}"</p>
                        </div>
                        <small class="opacity-50 text-nowrap">Nota: ${rating.rating}/5</small>
                    </div>
                `;
                ratingsList.appendChild(ratingItem);
            });
        }
    };

    // Chamadas iniciais para renderizar o perfil e as listas
    usernameDisplay.textContent = userProfile.username;
    if (userProfile.photoUrl) {
        profilePic.src = userProfile.photoUrl;
    }
    if (userProfile.bio) {
        userBio.textContent = userProfile.bio;
    }
    loadMovies(); // Carrega os filmes do JSON e renderiza o perfil

    // Lógica para o formulário de filmes
    addMovieForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectedMovieId = parseInt(movieTitleSelect.value, 10);
        const movieRating = parseInt(document.getElementById('movieRatingInput').value, 10);
        const movieComment = document.getElementById('movieCommentInput').value.trim();

        if (selectedMovieId && movieRating && movieComment) {
            const selectedMovie = availableMovies.find(movie => movie.id === selectedMovieId);

            if (selectedMovie) {
                const movieAlreadyAdded = userProfile.moviesWatched.some(movie => movie.id === selectedMovieId);

                if (!userProfile.moviesWatched) userProfile.moviesWatched = [];
                if (!userProfile.ratings) userProfile.ratings = [];

                if (!movieAlreadyAdded) {
                    userProfile.moviesWatched.push({
                        id: selectedMovie.id,
                        title: selectedMovie.title,
                        posterUrl: selectedMovie.posterUrl
                    });
                }
                
                const existingRatingIndex = userProfile.ratings.findIndex(r => r.id === selectedMovieId);
                if (existingRatingIndex > -1) {
                    userProfile.ratings[existingRatingIndex].rating = movieRating;
                    userProfile.ratings[existingRatingIndex].comment = movieComment;
                } else {
                    userProfile.ratings.push({
                        id: selectedMovie.id,
                        movieTitle: selectedMovie.title,
                        rating: movieRating,
                        comment: movieComment
                    });
                }

                localStorage.setItem('currentUser', JSON.stringify(userProfile));

                const allUsersString = localStorage.getItem('allUsers');
                let allUsers = allUsersString ? JSON.parse(allUsersString) : [];
                const userIndex = allUsers.findIndex(user => user.username === userProfile.username);
                if (userIndex > -1) {
                    allUsers[userIndex] = userProfile;
                } else {
                    allUsers.push(userProfile);
                }
                localStorage.setItem('allUsers', JSON.stringify(allUsers));

                addMovieForm.reset();
                renderMovies();
                renderRatings();
            }
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });
    
    // Lógica para edição de perfil
    editProfileButton.addEventListener('click', () => {
        editProfileSection.classList.remove('d-none');
        editProfileButton.classList.add('d-none');
        userBio.classList.add('d-none');
        editBioButton.classList.add('d-none');
        newUsernameInput.value = userProfile.username;
    });
    cancelEditButton.addEventListener('click', () => {
        editProfileSection.classList.add('d-none');
        editProfileButton.classList.remove('d-none');
        userBio.classList.remove('d-none');
        editBioButton.classList.remove('d-none');
    });
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
                localStorage.setItem('currentUser', JSON.stringify(userProfile));
                location.reload();
            };
            reader.readAsDataURL(newPhotoFile);
        } else {
            localStorage.setItem('currentUser', JSON.stringify(userProfile));
            location.reload();
        }
    });

    // Lógica para edição de biografia
    editBioButton.addEventListener('click', () => {
        editBioSection.classList.remove('d-none');
        editBioButton.classList.add('d-none');
        userBio.classList.add('d-none');
        editProfileButton.classList.add('d-none');
        newBioInput.value = userProfile.bio || '';
    });
    cancelBioButton.addEventListener('click', () => {
        editBioSection.classList.add('d-none');
        editBioButton.classList.remove('d-none');
        userBio.classList.remove('d-none');
        editProfileButton.classList.remove('d-none');
    });
    editBioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userProfile.bio = newBioInput.value.trim();
        localStorage.setItem('currentUser', JSON.stringify(userProfile));
        location.reload();
    });
});
