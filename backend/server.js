// backend/server.js

// 1. CARREGAR VARIÁVEIS DE AMBIENTE
require('dotenv').config(); 

// 2. IMPORTAR PACOTES
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); 
const bcrypt = require('bcrypt');
const fs = require('fs'); 
const path = require('path'); 

const app = express();
const PORT = process.env.PORT || 3000;

// 3. CONFIGURAÇÕES DO MIDDLEWARE
app.use(cors()); 
app.use(express.json()); 
// Permite que o servidor sirva arquivos estáticos da pasta raiz do projeto (frontend)
app.use(express.static('../')); 

// 4. CONFIGURAÇÃO DO BANCO DE DADOS
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

let pool; 
const connectDB = async () => {
    try {
        pool = await mysql.createPool(dbConfig);
        console.log('✅ Conexão com o MySQL estabelecida com sucesso!');
    } catch (error) {
        console.error('❌ Falha na conexão com o MySQL:', error.message);
        console.error('Verifique se o MySQL está rodando e se as credenciais no arquivo .env estão corretas.');
        // Encerra o processo se a conexão falhar
        process.exit(1); 
    }
};

// --- FUNÇÃO DE IMPORTAÇÃO DE DADOS (Executa apenas se a tabela estiver vazia) ---
const importMovies = async () => {
    // Caminho relativo para o movies.json a partir da pasta backend/
    const filePath = path.join(__dirname, '..', 'data', 'movies.json');

    try {
        // Verifica se a tabela já tem filmes (evitar importação duplicada)
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM movies');
        if (rows[0].count > 0) {
            console.log('➡️ Filmes já existem na tabela. Pulando a importação.');
            return;
        }

        // 1. Lê o conteúdo do arquivo JSON
        const data = fs.readFileSync(filePath, 'utf8');
        const movies = JSON.parse(data);

        let insertCount = 0;
        for (const movie of movies) {
            const query = `
                INSERT INTO movies (id, title, posterUrl, description, genre, director)
                VALUES (?, ?, ?, ?, ?, ?);
            `;
            const values = [
                movie.id,
                movie.title,
                movie.posterUrl,
                movie.description,
                movie.genre,
                movie.director
            ];
            await pool.query(query, values);
            insertCount++;
        }
        console.log(`✅ ${insertCount} filmes importados para o MySQL com sucesso!`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('⚠️ ERRO: Arquivo movies.json não encontrado. Certifique-se de que ele está em ../data/movies.json');
        } else {
            console.error('❌ Erro durante a importação de filmes:', error);
        }
    }
};

// =========================================================
// --- ROTAS DA API ---
// =========================================================

// Rota de Cadastro de Usuário (POST /api/register)
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body; 

    try {
        // 1. Criptografar a senha com o bcrypt
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 2. Inserir o novo usuário no banco de dados
        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?);
        `;
        const [result] = await pool.query(query, [username, email, password_hash]);

        // 3. Resposta de sucesso
        res.status(201).json({ 
            message: 'Usuário registrado com sucesso!', 
            userId: result.insertId,
            username: username,
            email: email
        });

    } catch (error) {
        // 4. Lidar com erros (ex: nome ou e-mail já existe)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Nome de usuário ou e-mail já está em uso.' });
        }
        console.error('Erro no cadastro:', error);
        res.status(500).json({ message: 'Erro interno no servidor ao registrar usuário.' });
    }
});


// Rota de Login de Usuário (POST /api/login)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Procurar o usuário pelo e-mail
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        // Se o usuário não for encontrado
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas. E-mail não encontrado.' });
        }

        // 2. Comparar a senha fornecida com o hash salvo
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        // Se a senha não for compatível
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas. Senha incorreta.' });
        }

        // 3. Sucesso: Login realizado
        const userProfile = {
            id: user.id,
            username: user.username,
            email: user.email,
            photoUrl: 'https://via.placeholder.com/40' // Usamos um padrão por enquanto
        };

        res.status(200).json({ 
            message: 'Login bem-sucedido!',
            user: userProfile
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor ao tentar logar.' });
    }
});

// 6. INICIALIZAÇÃO DO SERVIDOR
const startServer = async () => {
    await connectDB();
    await importMovies(); // <-- Chama a importação aqui!
    
    app.listen(PORT, () => {
        console.log(`✨ Servidor rodando em http://localhost:${PORT}`);
        console.log(`Acesse o site em http://localhost:${PORT}/index.html`);
    });
};

startServer();