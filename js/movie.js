// Aguarda o DOM ser completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // 1. Obter o ID do filme da URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('id'), 10);

    // Se não houver ID, redireciona para a página principal
    if (!movieId) {
        window.location.href = '../index.html';
        return;
    }

    // Seleciona os elementos que vamos preencher com os dados
    const movieHeading = document.getElementById('movieHeading');
    const moviePoster = document.getElementById('moviePoster');
    const movieDescription = document.getElementById('movieDescription');
    const movieTitle = document.getElementById('movieTitle');
    const movieRatingsList = document.getElementById('movieRatingsList');
    const userRatingForm = document.getElementById('userRatingForm');
    const userRatingInput = document.getElementById('userRatingInput');
    const userCommentInput = document.getElementById('userCommentInput');

    // Funções de renderização
    const renderMovieDetails = (movie) => {
        movieTitle.textContent = movie.title;
        movieHeading.textContent = movie.title;
        moviePoster.src = movie.posterUrl;
        // Adiciona uma descrição fictícia, já que não temos no movies.json
        movieDescription.textContent = "Filme de grande impacto e sucesso de crítica. Uma obra-prima do cinema que marcou gerações.";
    };

    const renderMovieRatings = (allUsers, currentMovieId) => {
        movieRatingsList.innerHTML = '';
        let totalRating = 0;
        let ratingCount = 0;
        
        // Itera sobre todos os usuários para encontrar as avaliações do filme atual
        allUsers.forEach(user => {
            if (user.ratings) {
                user.ratings.forEach(rating => {
                    if (rating.id === currentMovieId) {
                        const ratingItem = document.createElement('div');
                        ratingItem.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'gap-3', 'py-3');
                        ratingItem.innerHTML = `
                            <div class="d-flex w-100 justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-0">${user.username}</h6>
                                    <p class="mb-0 opacity-75">"${rating.comment}"</p>
                                </div>
                                <div class="text-nowrap">
                                    <small class="opacity-50">Nota: ${rating.rating}/5</small>
                                </div>
                            </div>
                        `;
                        movieRatingsList.appendChild(ratingItem);
                        
                        totalRating += rating.rating;
                        ratingCount++;
                    }
                });
            }
        });

        // Atualiza a média de avaliação
        const movieRatingDisplay = document.getElementById('movieRating');
        if (ratingCount > 0) {
            const averageRating = (totalRating / ratingCount).toFixed(1);
            movieRatingDisplay.innerHTML = `⭐ ${averageRating}/5 <small class="text-muted">| Média de ${ratingCount} avaliações</small>`;
        } else {
            movieRatingDisplay.innerHTML = 'Nenhuma avaliação ainda.';
        }
    };

    // Função para carregar os dados
    const loadData = async () => {
        // Carrega o banco de dados de filmes
        const moviesResponse = await fetch('../data/movies.json');
        const availableMovies = await moviesResponse.json();
        
        // Encontra o filme correspondente ao ID na URL
        const movie = availableMovies.find(m => m.id === movieId);
        if (movie) {
            renderMovieDetails(movie);
        } else {
            console.error('Filme não encontrado.');
            window.location.href = '../index.html';
        }

        // Carrega os dados de todos os usuários
        const allUsersString = localStorage.getItem('allUsers');
        const allUsers = allUsersString ? JSON.parse(allUsersString) : [];
        renderMovieRatings(allUsers, movieId);
    };

    // Evento de submissão do formulário de avaliação
    userRatingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentUserString = localStorage.getItem('currentUser');
        if (!currentUserString) {
            alert('Você precisa estar logado para fazer uma avaliação.');
            window.location.href = './login.html';
            return;
        }

        const currentUser = JSON.parse(currentUserString);
        const rating = parseInt(userRatingInput.value, 10);
        const comment = userCommentInput.value.trim();

        if (rating && comment) {
            // Adiciona a nova avaliação ao perfil do usuário
            const movie = availableMovies.find(m => m.id === movieId);
            if (!currentUser.ratings) {
                currentUser.ratings = [];
            }
            // Checa se já existe uma avaliação do usuário para este filme
            const existingRatingIndex = currentUser.ratings.findIndex(r => r.id === movieId);
            if (existingRatingIndex > -1) {
                // Se existe, atualiza
                currentUser.ratings[existingRatingIndex].rating = rating;
                currentUser.ratings[existingRatingIndex].comment = comment;
            } else {
                // Se não existe, cria uma nova
                currentUser.ratings.push({
                    id: movieId,
                    movieTitle: movie.title,
                    rating: rating,
                    comment: comment
                });
            }

            // Atualiza o perfil no localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Atualiza os dados de todos os usuários
            const allUsersString = localStorage.getItem('allUsers');
            let allUsers = allUsersString ? JSON.parse(allUsersString) : [];
            const userIndex = allUsers.findIndex(user => user.username === currentUser.username);
            if (userIndex > -1) {
                allUsers[userIndex] = currentUser;
            } else {
                allUsers.push(currentUser);
            }
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
            
            // Limpa o formulário e recarrega as avaliações
            userRatingForm.reset();
            renderMovieRatings(allUsers, movieId);
        }
    });

    // Inicia o carregamento dos dados
    loadData();

});