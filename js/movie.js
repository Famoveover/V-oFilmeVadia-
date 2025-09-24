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
    const movieGenre = document.getElementById('movieGenre');
    const movieDirector = document.getElementById('movieDirector');
    const movieTitle = document.getElementById('movieTitle');
    const movieRatingsList = document.getElementById('movieRatingsList');
    const userRatingForm = document.getElementById('userRatingForm');
    const userRatingInput = document.getElementById('userRatingInput');
    const userCommentInput = document.getElementById('userCommentInput');

    const renderMovieDetails = (movie) => {
        movieTitle.textContent = movie.title;
        movieHeading.textContent = movie.title;
        moviePoster.src = movie.posterUrl;
        movieDescription.textContent = movie.description;
        movieGenre.textContent = movie.genre;
        movieDirector.textContent = movie.director;
    };

    const renderMovieRatings = (allUsers, currentMovieId) => {
        movieRatingsList.innerHTML = '';
        let totalRating = 0;
        let ratingCount = 0;
        
        const currentUserString = localStorage.getItem('currentUser');
        const currentUser = currentUserString ? JSON.parse(currentUserString) : null;

        allUsers.forEach(user => {
            if (user.ratings) {
                user.ratings.forEach(rating => {
                    if (rating.id === currentMovieId) {
                        const isCurrentUserRating = currentUser && user.username === currentUser.username;
                        const deleteButtonHtml = isCurrentUserRating ? `<button class="btn btn-danger btn-sm ms-2" data-movie-id="${currentMovieId}">Excluir</button>` : '';

                        const ratingItem = document.createElement('div');
                        ratingItem.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'gap-3', 'py-3');
                        ratingItem.innerHTML = `
                            <div class="d-flex w-100 justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-0 d-flex align-items-center">${user.username} ${isCurrentUserRating ? '<small class="ms-2 badge text-bg-warning">Você</small>' : ''}</h6>
                                    <p class="mb-0 opacity-75">"${rating.comment}"</p>
                                </div>
                                <div class="d-flex align-items-center text-nowrap">
                                    <small class="opacity-50 me-1">Nota: ${rating.rating}/5</small>
                                    ${deleteButtonHtml}
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

    // Lógica para excluir uma avaliação
    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn-danger[data-movie-id]')) {
            const confirmed = confirm('Tem certeza que deseja excluir esta avaliação?');
            if (!confirmed) return;

            const movieIdToDelete = parseInt(e.target.dataset.movieId, 10);
            
            const currentUserString = localStorage.getItem('currentUser');
            let currentUser = currentUserString ? JSON.parse(currentUserString) : null;
            
            if (currentUser) {
                // Remove a avaliação do perfil do usuário logado
                currentUser.ratings = currentUser.ratings.filter(r => r.id !== movieIdToDelete);
                // Remove o filme da lista de assistidos se não houver outras avaliações
                const hasOtherRatings = currentUser.ratings.some(r => r.id !== movieIdToDelete);
                if (!hasOtherRatings) {
                    currentUser.moviesWatched = currentUser.moviesWatched.filter(m => m.id !== movieIdToDelete);
                }

                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                const allUsersString = localStorage.getItem('allUsers');
                let allUsers = allUsersString ? JSON.parse(allUsersString) : [];
                const userIndex = allUsers.findIndex(user => user.username === currentUser.username);

                if (userIndex > -1) {
                    allUsers[userIndex] = currentUser;
                }
                localStorage.setItem('allUsers', JSON.stringify(allUsers));

                // Recarrega as avaliações
                renderMovieRatings(allUsers, movieId);
            }
        }
    });

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
            const movie = allUsers.find(user => user.moviesWatched && user.moviesWatched.some(m => m.id === movieId)).moviesWatched.find(m => m.id === movieId);

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
        }
    });

    loadData();

});
