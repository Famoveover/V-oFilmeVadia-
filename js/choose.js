// js/choose.js - Versão Local (usando localStorage)

document.addEventListener('DOMContentLoaded', () => {
    const nominationList = document.getElementById('nominationList');
    const loadingMessage = document.getElementById('loadingMessage');
    // REMOVIDO: const nominationForm = document.getElementById('nominationForm');
    
    // Lista dos IDs que devem estar na votação semanal
    // (Ajuste estes IDs conforme os filmes que deseja na votação!)
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
                return {
                    id: id,
                    title: movie ? movie.title : `Filme Desconhecido (ID: ${id})`,
                    posterUrl: movie ? movie.posterUrl : 'https://via.placeholder.com/150',
                    votes: nominationsData[id] || 0
                };
            })
            // 2. Ordenar por número de votos (do maior para o menor)
            .sort((a, b) => b.votes - a.votes);
        
        if (nominations.length === 0) {
            nominationList.innerHTML = '<p class="text-center text-secondary">Nenhum filme selecionado para votação esta semana.</p>';
            return;
        }

        // 3. Renderizar cada filme
        nominations.forEach((nomination, index) => {
            const listItem = document.createElement('a');
            listItem.href = '#'; // Impedir navegação
            listItem.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'justify-content-between', 'align-items-center', 'py-3', 'mb-2');
            
            // Adiciona classe de destaque para o filme líder
            if (index === 0 && nomination.votes > 0) {
                 listItem.classList.add('list-group-item-warning', 'shadow-sm');
            }

            listItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${nomination.posterUrl}" alt="${nomination.title}" class="rounded me-3" style="width: 50px; height: 75px; object-fit: cover;">
                    <div>
                        <h6 class="mb-0 fw-bold">${index + 1}. ${nomination.title}</h6>
                    </div>
                </div>
                <span class="badge text-bg-primary rounded-pill fs-5">${nomination.votes} Votos</span>
            `;
            
            // 4. Adicionar o Listener para o VOTO
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                handleVote(nomination.id);
            });

            nominationList.appendChild(listItem);
        });
    };

    // Função para lidar com o voto
    const handleVote = (movieId) => {
        let nominationsData = getLocalNominations();
        
        // Simplesmente incrementa o voto
        nominationsData[movieId] = (nominationsData[movieId] || 0) + 1;
        
        saveLocalNominations(nominationsData);
        
        // Recarrega os dados para atualizar a lista
        loadData();
        
        alert(`Seu voto foi registrado! Total de votos: ${nominationsData[movieId]}`);
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
    
    // --- Lógica de Indicação de Novo Filme (REMOVIDA) ---
    // A remoção deste bloco evita o erro, pois a referência à 'nominationForm' não existe mais.

    // Inicia o carregamento
    loadData();
});
