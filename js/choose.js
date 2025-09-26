// js/choose.js - Versão Local (usando localStorage)

document.addEventListener('DOMContentLoaded', () => {
    const nominationList = document.getElementById('nominationList');
    const loadingMessage = document.getElementById('loadingMessage');
    const nominationForm = document.getElementById('nominationForm');
    
    // Lista dos IDs que devem estar na votação semanal
    const MOVIE_IDS_TO_VOTE = [3, 4, 5, 6, 7]; 

    // --- Funções de Gerenciamento do LocalStorage ---

    // Carrega as indicações salvas no localStorage
    const getLocalNominations = () => {
        const nominationsString = localStorage.getItem('allNominations');
        return nominationsString ? JSON.parse(nominationsString) : {}; // Retorna um objeto para fácil acesso pelo ID
    };

    // Salva as indicações no localStorage
    const saveLocalNominations = (nominations) => {
        localStorage.setItem('allNominations', JSON.stringify(nominations));
    };
    
    // --- Funções de Renderização e Lógica ---

    // Função para renderizar a lista de votação
    const renderNominations = (allMovies, nominationsData) => {
        nominationList.innerHTML = '';
        loadingMessage.classList.add('d-none');
        
        // 1. Filtrar apenas os filmes que estão na votação e pegar os detalhes
        const nominations = MOVIE_IDS_TO_VOTE
            .map(id => {
                const movie = allMovies.find(m => m.id === id);
                // Retorna o filme com a contagem de votos do localStorage
                if (movie) {
                    return {
                        ...movie,
                        votes: nominationsData[id] || 0
                    };
                }
                return null; // Ignora se o ID não for encontrado no movies.json
            })
            .filter(n => n !== null);
            
        // 2. Ordena por votos (maior para o menor)
        nominations.sort((a, b) => b.votes - a.votes);


        if (nominations.length === 0) {
            loadingMessage.textContent = 'Nenhum filme disponível para votação.';
            loadingMessage.classList.remove('d-none');
            return;
        }

        // 3. Cria o HTML de cada item
        nominations.forEach((movie, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item list-group-item-action d-flex align-items-center mb-3 p-3 bg-body-tertiary rounded';
            
            let rankClass = '';
            if (index === 0) rankClass = 'bg-success-subtle border-success';
            else if (index === 1) rankClass = 'bg-warning-subtle border-warning';

            listItem.classList.add(rankClass);

            listItem.innerHTML = `
                <img src="${movie.posterUrl}" alt="${movie.title}" class="rounded me-3" style="width: 50px; height: 75px; object-fit: cover;">
                
                <div class="flex-grow-1">
                    <h5 class="mb-1 text-white">${index + 1}º - ${movie.title}</h5>
                    <p class="mb-1 text-secondary">Votos: <strong class="text-warning">${movie.votes}</strong></p>
                </div>

                <a href="../pages/movie.html?id=${movie.id}" class="btn btn-outline-warning btn-sm me-2">Detalhes</a>
                <button type="button" class="btn btn-primary vote-btn" data-movie-id="${movie.id}">
                    Votar
                </button>
            `;
            nominationList.appendChild(listItem);
        });

        // 4. Adiciona evento de voto aos botões
        nominationList.querySelectorAll('.vote-btn').forEach(button => {
            button.addEventListener('click', handleVote);
        });
    };

    // Função que lida com o clique no botão Votar
    const handleVote = (e) => {
        const movieId = parseInt(e.target.getAttribute('data-movie-id'), 10);
        
        // Carrega dados e incrementa o voto
        const nominationsData = getLocalNominations();
        nominationsData[movieId] = (nominationsData[movieId] || 0) + 1;
        
        // Salva e recarrega a lista
        saveLocalNominations(nominationsData);
        alert(`Voto registrado no filme ID ${movieId}!`);
        
        // Recarrega os dados para atualizar a tela
        loadData(); 
    };

    // Função principal para carregar os dados
    const loadData = async () => {
        try {
            // Busca o movies.json localmente
            const moviesResponse = await fetch('../data/movies.json');
            const allMovies = await moviesResponse.json();
            
            // Carrega a contagem de votos do localStorage
            const nominationsData = getLocalNominations();
            
            // Renderiza a lista de filmes
            renderNominations(allMovies, nominationsData);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            loadingMessage.textContent = 'Erro ao carregar a lista de filmes. Verifique o arquivo movies.json.';
            loadingMessage.classList.remove('d-none');
        }
    };
    
    // --- Lógica de Indicação de Novo Filme (Apenas simulação no localStorage) ---
    nominationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Esta funcionalidade não é necessária agora, mas mantemos o formulário para o futuro.
        const title = document.getElementById('movieTitleInput').value.trim();
        const director = document.getElementById('movieDirectorInput').value.trim();

        alert(`Simulação: Filme "${title}" de ${director} indicado! (A funcionalidade de adicionar novo filme ao arquivo movies.json é manual)`);
        
        nominationForm.reset();
    });

    // Inicia o carregamento
    loadData();
});