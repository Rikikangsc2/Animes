const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to fetch anime data with error handling
async function fetchAnimeData() {
    try {
        const response = await axios.get('http://nue-db.vercel.app/read/nuenime1');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return [];
    }
}

// Helper function to write anime data with error handling
async function writeAnimeData(data) {
    try {
        await axios.post('http://nue-db.vercel.app/write/nuenime1', { json: data });
    } catch (error) {
        console.error('Error writing data:', error.message);
    }
}

// Function to truncate the pagination display
function getPagination(currentPage, totalPages) {
    const delta = 2;
    const range = [];
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);

    if (currentPage - delta <= 1) end = Math.min(5, totalPages - 1);
    if (currentPage + delta >= totalPages) start = Math.max(totalPages - 4, 2);

    for (let i = start; i <= end; i++) range.push(i);
    if (start > 2) range.unshift('...');
    if (end < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);

    return range;
}

// Endpoint for displaying anime list with pagination and search
app.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || '';
        const data = await fetchAnimeData();

        const filteredAnime = data.filter(anime =>
            anime.title.toLowerCase().includes(search.toLowerCase()) ||
            anime.genre.toLowerCase().includes(search.toLowerCase())
        );

        const pageSize = 10;
        const paginatedAnime = filteredAnime.slice((page - 1) * pageSize, page * pageSize);
        const totalPages = Math.ceil(filteredAnime.length / pageSize);
        const pagination = getPagination(page, totalPages);

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>PurNime - Streaming Anime & Donghua</title>
                <meta name="description" content="PurNime adalah situs streaming anime dan donghua dengan koleksi episode terbaru dan populer.">
                <meta name="keywords" content="PurNime, streaming anime, streaming donghua, nonton anime, nonton donghua, anime online, donghua online">
                <link rel="icon" href="https://th.bing.com/th/id/OIG1.zckrRMeI76ehRbucAgma?dpr=2&pid=ImgDetMain" type="image/x-icon">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
                <style>
                    body { background-color: #121212; color: #fff; }
                    .anime-thumbnail { max-height: 150px; }
                    .bottom-bar { position: fixed; bottom: 0; width: 100%; background-color: #222; padding: 10px 0; }
                    .bottom-bar a { color: #fff; margin: 0 20px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container mt-5">
                    <h1 class="text-center">PurNime</h1>
                    <form class="d-flex justify-content-center mb-4">
                        <input class="form-control me-2" type="search" name="search" placeholder="Search Anime" aria-label="Search" value="${search}">
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                    <div class="row row-cols-1 row-cols-md-3 g-4">
                        ${paginatedAnime.map(anime => `
                            <div class="col">
                                <div class="card h-100 text-white bg-dark">
                                    <img src="${anime.thumbnail}" class="card-img-top anime-thumbnail" alt="${anime.title}">
                                    <div class="card-body">
                                        <h5 class="card-title">${anime.title}</h5>
                                        <p class="card-text">${anime.genre}</p>
                                        <p class="card-text">${anime.episodes.length} episodes</p>
                                        <a href="/stream?anime-id=${anime.animeId}&episode=1" class="btn btn-primary">Watch</a>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center">
                            ${pagination.map(p => `
                                <li class="page-item ${p === page ? 'active' : ''} ${typeof p === 'number' ? '' : 'disabled'}">
                                    <a class="page-link" href="/?page=${p === '...' ? page : p}&search=${search}">${p}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </nav>
                </div>
                <div class="bottom-bar d-flex justify-content-around">
                    <a href="/"><i class="fas fa-home"></i> Home</a>
                    <a href="/history" id="history-link"><i class="fas fa-history"></i> History</a>
                </div>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/js/all.min.js"></script>
                <script>
                    // Save history to local storage
                    function saveToHistory(anime) {
                        let history = JSON.parse(localStorage.getItem('history')) || [];
                        history = history.filter(item => item.animeId !== anime.animeId);
                        history.unshift(anime);
                        if (history.length > 20) history.pop();
                        localStorage.setItem('history', JSON.stringify(history));
                    }
                    // Load history from local storage
                    document.getElementById('history-link').addEventListener('click', () => {
                        const history = JSON.parse(localStorage.getItem('history')) || [];
                        const historyList = history.map(item => `
                            <li class="list-group-item">
                                <a href="/stream?anime-id=${item.animeId}&episode=1">${item.title}</a>
                                <button onclick="removeFromHistory('${item.animeId}')" class="btn btn-danger btn-sm float-end">Remove</button>
                            </li>
                        `).join('');
                        document.body.innerHTML = `
                            <div class="container mt-5">
                                <h1>History</h1>
                                <ul class="list-group">${historyList}</ul>
                                <a href="/" class="btn btn-primary mt-4">Back to Home</a>
                            </div>
                        `;
                    });
                    // Remove history item from local storage
                    function removeFromHistory(animeId) {
                        let history = JSON.parse(localStorage.getItem('history')) || [];
                        history = history.filter(item => item.animeId !== animeId);
                        localStorage.setItem('history', JSON.stringify(history));
                        location.reload();
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error rendering home page:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint for streaming anime episodes
app.get('/stream', async (req, res) => {
    try {
        const animeId = req.query['anime-id'];
        const episode = parseInt(req.query.episode) || 1;
        const data = await fetchAnimeData();

        const anime = data.find(a => a.animeId === animeId);

        if (!anime) {
            return res.status(404).send('Anime not found');
        }

        const nextEpisode = episode + 1;
        const prevEpisode = episode - 1;
        const episodeLink = anime.episodes[episode - 1]?.link || '';

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${anime.title} - Episode ${episode} | PurNime</title>
                <meta name="description" content="Tonton ${anime.title} episode ${episode} di PurNime, situs streaming anime dan donghua terbaik.">
                <meta name="keywords" content="${anime.title}, streaming anime, streaming donghua, nonton anime, nonton donghua">
                <link rel="icon" href="https://th.bing.com/th/id/OIG1.zckrRMeI76ehRbucAgma?dpr=2&pid=ImgDetMain" type="image/x-icon">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
                <style>
                    body { background-color: #121212; color: #fff; }
                    .iframe-container { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; }
                    .iframe-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                </style>
            </head>
            <body>
                <div class="container mt-5">
                    <h1>${anime.title} - Episode ${episode}</h1>
                    <div class="iframe-container">
                        ${episodeLink ? `<iframe src="${episodeLink}" frameborder="0" allowfullscreen></iframe>` : '<p>Belum update kak tungguin ya</p>'}
                    </div>
                    <div class="d-flex justify-content-between mt-4">
                        <a href="/stream?anime-id=${animeId}&episode=${prevEpisode}" class="btn btn-outline-light ${prevEpisode < 1 ? 'disabled' : ''}">Previous Episode</a>
                        <a href="/stream?anime-id=${animeId}&episode=${nextEpisode}" class="btn btn-outline-light ${nextEpisode > anime.episodes.length ? 'disabled' : ''}">Next Episode</a>
                    </div>
                    <div class="mt-4">
                        <label for="goToEpisode">Go to Episode:</label>
                        <input type="number" id="goToEpisode" class="form-control w-25 d-inline" min="1" max="${anime.episodes.length}" value="${episode}">
                        <button onclick="goToEpisode()" class="btn btn-outline-light">Go</button>
                    </div>
                    <div class="mt-4">
                        <p>${anime.synopsis}</p>
                    </div>
                </div>
                <script>
                    function goToEpisode() {
                        const episode = document.getElementById('goToEpisode').value;
                        window.location.href = '/stream?anime-id=${animeId}&episode=' + episode;
                    }
                </script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error rendering stream page:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Admin endpoint for adding new anime and episodes
app.get('/admin', (req, res) => {
    try {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Admin - Anidong</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
                <style>
                    body { background-color: #121212; color: #fff; }
                </style>
            </head>
            <body>
                <div class="container mt-5">
                    <h1 class="text-center">Admin - Anidong</h1>
                    <form action="/admin/add-anime" method="POST" class="mb-5">
                        <h2>Add Anime</h2>
                        <div class="mb-3">
                            <label for="title" class="form-label">Title</label>
                            <input type="text" class="form-control" id="title" name="title" required>
                        </div>
                        <div class="mb-3">
                            <label for="synopsis" class="form-label">Synopsis</label>
                            <textarea class="form-control" id="synopsis" name="synopsis" rows="3" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="thumbnail" class="form-label">Thumbnail URL</label>
                            <input type="text" class="form-control" id="thumbnail" name="thumbnail" required>
                        </div>
                        <div class="mb-3">
                            <label for="genre" class="form-label">Genre</label>
                            <input type="text" class="form-control" id="genre" name="genre" required>
                        </div>
                        <div class="mb-3">
                            <label for="animeId" class="form-label">Anime ID</label>
                            <input type="text" class="form-control" id="animeId" name="animeId" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Add Anime</button>
                    </form>
                    <form action="/admin/add-episode" method="POST">
                        <h2>Add Episode</h2>
                        <div class="mb-3">
                            <label for="animeId" class="form-label">Anime ID</label>
                            <input type="text" class="form-control" id="animeId" name="animeId" required>
                        </div>
                        <div class="mb-3">
                            <label for="episode" class="form-label">Episode Number</label>
                            <input type="number" class="form-control" id="episode" name="episode" required>
                        </div>
                        <div class="mb-3">
                            <label for="link" class="form-label">Video Link</label>
                            <input type="text" class="form-control" id="link" name="link" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Add Episode</button>
                    </form>
                </div>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error rendering admin page:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Handle POST request to add a new anime
app.post('/admin/add-anime', async (req, res) => {
    try {
        const newAnime = {
            title: req.body.title,
            synopsis: req.body.synopsis,
            thumbnail: req.body.thumbnail,
            genre: req.body.genre,
            animeId: req.body.animeId,
            episodes: []
        };

        const data = await fetchAnimeData();
        data.push(newAnime);

        await writeAnimeData(data);

        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding new anime:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Handle POST request to add a new episode
app.post('/admin/add-episode', async (req, res) => {
    try {
        const { animeId, episode, link } = req.body;
        const episodeNumber = parseInt(episode);

        const data = await fetchAnimeData();
        const anime = data.find(a => a.animeId === animeId);

        if (anime) {
            const existingEpisode = anime.episodes.find(e => e.episodeNumber === episodeNumber);

            if (existingEpisode) {
                existingEpisode.link = link;
            } else {
                anime.episodes.push({ episodeNumber, link });
            }

            await writeAnimeData(data);
        } else {
            console.error('Anime ID not found:', animeId);
            return res.status(404).send('Anime not found');
        }

        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding new episode:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
