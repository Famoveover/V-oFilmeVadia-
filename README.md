# 🎬 Vê o filme, Vadia!

Plataforma para um grupo de filmes onde **atendentes do Disque Idoso** escolhem, assistem e debatem semanalmente sobre cinema.  
Inspirado em **Letterboxd** e **Backlogged**, o projeto funciona como uma rede social de avaliações, comentários e perfis personalizados.

---

## 🚀 Funcionalidades

- 👤 **Cadastro e login** de usuários (com foto de perfil opcional)  
- 📝 **Perfil do usuário**: foto, nome, filmes assistidos e avaliações  
- 🎞️ **Lista de filmes** com busca, filtro e página de detalhes  
- ⭐ **Sistema de avaliação** de 1 a 5 estrelas  
- 💬 **Comentários** em cada filme (feed de discussões)  
- 🏠 **Página inicial** com filmes em destaque e últimos comentários  
- 🗳️ **Votação semanal** para escolha do filme do grupo  
- 📱 **Layout responsivo** utilizando Bootstrap  

---

## 🛠️ Tecnologias

- **Frontend:** HTML, CSS, JavaScript, Bootstrap  
- **Backend:** Node.js, Express.js  
- **Banco de Dados:** MySQL (via [`mysql2`](https://www.npmjs.com/package/mysql2))  
- **Armazenamento inicial:** `movies.json` (será migrado para banco de dados)  

---

## 📂 Estrutura de Pastas

```bash
grupo-de-filmes/
│
├── index.html
├── style.css
│
├── /pages/           # Páginas do frontend
│   ├── login.html
│   ├── profile.html
│   ├── movie.html
│   ├── choose.html   # Página de votação
│
├── /js/              # Lógica do frontend
│   ├── index.js
│   ├── login.js
│   ├── profile.js
│   ├── movie.js
│   ├── choose.js     # (em desenvolvimento)
│
├── /data/            # Arquivos de apoio
│   └── movies.json   # Base inicial de filmes
│
└── /backend/         # Servidor e API
    ├── server.js     # Servidor Node.js + Express
    └── package.json


