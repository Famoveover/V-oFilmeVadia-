// Aguarda o DOM ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    const moviesGrid = document.getElementById('moviesGrid');
    const searchInput = document.getElementById('searchInput');
    const recentCommentsList = document.getElementById('recentCommentsList');

    let allMovies = [];
    let allUsers = [];

    // Função para renderizar os filmes
    const renderMovies = (moviesToRender) => {
        moviesGrid.innerHTML = ''; // Limpa o grid antes de renderizar
        moviesToRender.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('col', 'd-flex', 'align-items-start');
            movieCard.innerHTML = `
                <div class="card shadow-sm w-100">
                    <img src="${movie.posterUrl}" class="card-img-top" alt="Pôster do Filme">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <a href="./pages/movie.html?id=${movie.id}" class="btn btn-sm btn-outline-secondary">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            `;
            moviesGrid.appendChild(movieCard);
        });
    };

    // Função para renderizar os comentários mais recentes
    const renderRecentComments = () => {
        recentCommentsList.innerHTML = '';
        
        // Coleta todos os comentários de todos os usuários em uma única lista
        const allComments = [];
        allUsers.forEach(user => {
            if (user.ratings) {
                user.ratings.forEach(rating => {
                    allComments.push({
                        username: user.username,
                        movieTitle: rating.movieTitle,
                        comment: rating.comment,
                        rating: rating.rating,
                        movieId: rating.id
                    });
                });
            }
        });

        // Ordena os comentários por data (usando uma lógica simples)
        // Por enquanto, vamos apenas pegar os últimos 5 adicionados
        const latestComments = allComments.slice(-5).reverse();

        latestComments.forEach(comment => {
            const commentItem = document.createElement('a');
            commentItem.href = `./pages/movie.html?id=${comment.movieId}`;
            commentItem.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'gap-3', 'py-3');
            commentItem.innerHTML = `
                <div class="d-flex gap-2 w-100 justify-content-between">
                    <div>
                        <h6 class="mb-0">${comment.username}</h6>
                        <p class="mb-0 opacity-75">"${comment.comment}"</p>
                    </div>
                    <small class="opacity-50 text-nowrap">Nota: ${comment.rating}/5</small>
                </div>
            `;
            recentCommentsList.appendChild(commentItem);
        });
    };

    // Lógica da barra de pesquisa
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredMovies = allMovies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm)
        );
        renderMovies(filteredMovies);
    });

    // Função principal para carregar os dados
    const loadData = async () => {
        try {
            // Carrega os filmes do movies.json
            const moviesResponse = await fetch('./data/movies.json');
            allMovies = await moviesResponse.json();
            renderMovies(allMovies);

            // Carrega todos os usuários do localStorage
            const allUsersString = localStorage.getItem('allUsers');
            allUsers = allUsersString ? JSON.parse(allUsersString) : [];
            renderRecentComments();

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    // Inicia o carregamento
    loadData();
});