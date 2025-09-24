// Aguarda o DOM ser completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('id'), 10);

    if (!movieId) {
        window.location.href = '../index.html';
        return;
    }

    const movieHeading = document.getElementById('movieHeading');
    const moviePoster = document.getElementById('moviePoster');
    const movieDescription = document.getElementById('movieDescription');
    const movieGenre = document.getElementById('movieGenre'); // Novo
    const movieDirector = document.getElementById('movieDirector'); // Novo
    const movieTitle = document.getElementById('movieTitle');
    const movieRatingsList = document.getElementById('movieRatingsList');
    const userRatingForm = document.getElementById('userRatingForm');
    const userRatingInput = document.getElementById('userRatingInput');
    const userCommentInput = document.getElementById('userCommentInput');

    const renderMovieDetails = (movie) => {
        movieTitle.textContent = movie.title;
        movieHeading.textContent = movie.title;
        moviePoster.src = movie.posterUrl;
        movieDescription.textContent = movie.description; // Corrigido!
        movieGenre.textContent = movie.genre; // Novo
        movieDirector.textContent = movie.director; // Novo
    };

    const renderMovieRatings = (allUsers, currentMovieId) => {
        movieRatingsList.innerHTML = '';
        let totalRating = 0;
        let ratingCount = 0;
        
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

        const movieRatingDisplay = document.getElementById('movieRating');
        if (ratingCount > 0) {
            const averageRating = (totalRating / ratingCount).toFixed(1);
            movieRatingDisplay.innerHTML = `⭐ ${averageRating}/5 <small class="text-muted">| Média de ${ratingCount} avaliações</small>`;
        } else {
            movieRatingDisplay.innerHTML = 'Nenhuma avaliação ainda.';
        }
    };

    const loadData = async () => {
        const moviesResponse = await fetch('../data/movies.json');
        const availableMovies = await moviesResponse.json();
        
        const movie = availableMovies.find(m => m.id === movieId);
        if (movie) {
            renderMovieDetails(movie);
        } else {
            console.error('Filme não encontrado.');
            window.location.href = '../index.html';
        }

        const allUsersString = localStorage.getItem('allUsers');
        const allUsers = allUsersString ? JSON.parse(allUsersString) : [];
        renderMovieRatings(allUsers, movieId);
    };

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
            const allUsersString = localStorage.getItem('allUsers');
            let allUsers = allUsersString ? JSON.parse(allUsersString) : [];

            // Encontrar o filme para obter o título
            const moviesResponse = fetch('../data/movies.json')
                .then(response => response.json())
                .then(availableMovies => {
                    const movie = availableMovies.find(m => m.id === movieId);
                    
                    // Adicionar a nova avaliação ao perfil do usuário
                    if (!currentUser.ratings) {
                        currentUser.ratings = [];
                    }
                    const existingRatingIndex = currentUser.ratings.findIndex(r => r.id === movieId);
                    if (existingRatingIndex > -1) {
                        currentUser.ratings[existingRatingIndex].rating = rating;
                        currentUser.ratings[existingRatingIndex].comment = comment;
                    } else {
                        currentUser.ratings.push({
                            id: movieId,
                            movieTitle: movie.title,
                            rating: rating,
                            comment: comment
                        });
                    }

                    // Atualizar o perfil no localStorage
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    const userIndex = allUsers.findIndex(user => user.username === currentUser.username);
                    if (userIndex > -1) {
                        allUsers[userIndex] = currentUser;
                    } else {
                        allUsers.push(currentUser);
                    }
                    localStorage.setItem('allUsers', JSON.stringify(allUsers));
                    
                    userRatingForm.reset();
                    renderMovieRatings(allUsers, movieId);
                });
        }
    });

    loadData();

});
