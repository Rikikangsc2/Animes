const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const basenya = "https://api-otakudesu-livid.vercel.app";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

async function fetchAnimeData(page) {
  try {
    const response = await axios.get(`${basenya}/api/v1/ongoing/${page}`);
    return response.data.ongoing || [];
  } catch (error) {
    return [];
  }
}

async function searchAnime(query) {
  try {
    const response = await axios.get(`${basenya}/api/v1/search/${encodeURIComponent(query)}`);
    return response.data.search || [];
  } catch (error) {
    return [];
  }
}

async function fetchAnimeDetail(endpoint) {
  try {
    const response = await axios.get(`${basenya}/api/v1/detail/${endpoint}`);
    const animeDetail = response.data || {};
    animeDetail.episode_list = (animeDetail.episode_list || []).filter(episode =>
      episode.episode_endpoint.includes("episode-")
    );
    return animeDetail;
  } catch (error) {
    return {};
  }
}

async function fetchEpisodeStream(endpoint) {
  try {
    const response = await axios.get(`${basenya}/api/v1/episode/${endpoint}`);
    return response.data || {};
  } catch (error) {
    return {};
  }
}

function getPagination(currentPage, totalPages) {
  const maxPagesToShow = 6;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  next();
});

app.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 100;

    const [ongoingAnime] = await Promise.all([
      fetchAnimeData(page),
    ]);

    const animeData = await Promise.all(ongoingAnime.map(anime => fetchAnimeDetail(anime.endpoint)));
    const paginatedAnime = animeData.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(animeData.length / pageSize);
    const pagination = getPagination(page, totalPages);

    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>PURNIME TV - Streaming Anime Gratis minim iklan</title>
        <meta name="description" content="PurNime adalah situs streaming anime dengan koleksi episode terbaru dan populer.">
        <meta name="keywords" content="PurNime, streaming anime, streaming donghua, nonton anime, nonton donghua, anime online, donghua online">
        <meta name="google-adsense-account" content="ca-pub-5220496608138780">
        <link rel="icon" href="https://th.bing.com/th/id/OIG1.zckrRMeI76ehRbucAgma?dpr=2&pid=ImgDetMain" type="image/x-icon">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
        <style>
            body { 
                background-color: #121212; 
                color: #fff; 
                font-family: 'Arial', sans-serif;
            }
            .anime-thumbnail { 
                max-height: 230px; 
                border-radius: 10px; 
            }
            .card {
                border: none;
                background: transparent;
            }
            .card-title {
                font-size: 1.2rem;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .card-text {
                font-size: 0.9rem;
                color: #a0a0a0;
            }
            .btn-primary {
                background-color: #007bff;
                border: none;
                border-radius: 5px;
                padding: 8px 16px;
                font-size: 0.9rem;
            }
            .btn-primary:hover {
                background-color: #0056b3;
            }
            .pagination {
                flex-wrap: wrap;
            }
            .page-link {
                color: #fff;
                background-color: #343a40;
                border-color: #454d55;
            }
            .page-item.active .page-link {
                background-color: #007bff;
                border-color: #007bff;
            }
            .page-item.disabled .page-link {
                color: #6c757d;
                background-color: #343a40;
                border-color: #454d55;
            }
        </style>
    </head>
    <body>
        <div class="container mt-5">
            <h1 class="text-center mb-4">PUR-NIME TV</h1>
            <form action="/search" method="POST" class="d-flex justify-content-center mb-4"> 
                <input class="form-control me-2" type="search" name="search" placeholder="Search Anime" aria-label="Search">
                <button class="btn btn-outline-light" type="submit">Search</button>
            </form>
            <div class="row row-cols-1 row-cols-md-3 g-4">
                ${paginatedAnime.map(anime => `
                    <div class="col">
                        <div class="card h-100 text-white">
                            <a href="/anime/${anime.endpoint}" style="text-decoration: none;"> 
                                <img src="${anime.anime_detail.thumb}" class="card-img-top anime-thumbnail" alt="${anime.anime_detail.title}">
                                <div class="card-body">
                                    <h5 class="card-title">${anime.anime_detail.title}</h5>
                                    <p class="card-text">${anime.anime_detail.detail[2]} - ${anime.anime_detail.detail[6]}</p>
                                    <p class="card-text">${anime.episode_list[0]?.episode_date || ''}</p>
                                    <p class="card-text">${anime.anime_detail.detail[10]}</p>
                                </div>
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
            <nav aria-label="Page navigation" class="mt-4">
                <ul class="pagination justify-content-center">
                    ${pagination.map(p => `
                        <li class="page-item ${p === page ? 'active' : ''}">
                            <a class="page-link bg-dark text-light" href="/?page=${p}">${p}</a>
                        </li>
                    `).join('')}
                </ul>
            </nav>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.post('/search', async (req, res) => {
  try {
    const searchQuery = req.body.search; 
    const searchResults = await searchAnime(searchQuery);
    const animeData = await Promise.all(searchResults.map(anime => fetchAnimeDetail(anime.endpoint)));

    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hasil Pencarian: ${searchQuery} - PURNIME TV</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
      <style>
        /* Gaya CSS yang sama dengan halaman utama */
      </style>
    </head>
    <body>
      <div class="container mt-5">
        <h1 class="text-center mb-4">Hasil Pencarian: ${searchQuery}</h1>
        <div class="row row-cols-1 row-cols-md-3 g-4">
          ${animeData.map(anime => `
            <div class="col">
              <div class="card h-100 text-white">
                <a href="/anime/${anime.endpoint}" style="text-decoration: none;">
                  <img src="${anime.anime_detail.thumb}" class="card-img-top anime-thumbnail" alt="${anime.anime_detail.title}">
                  <div class="card-body">
                    <h5 class="card-title">${anime.anime_detail.title}</h5>
                    <p class="card-text">${anime.anime_detail.detail[2]} - ${anime.anime_detail.detail[6]}</p>
                    <p class="card-text">${anime.episode_list[0]?.episode_date || ''}</p>
                    <p class="card-text">${anime.anime_detail.detail[10]}</p>
                  </div>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/anime/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const animeDetail = await fetchAnimeDetail(endpoint);

    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${animeDetail.title} - PURNIME TV</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
      <style>
        /* Gaya CSS yang sama dengan halaman utama */
      </style>
    </head>
    <body>
      <div class="container mt-5">
        <h1 class="text-center mb-4">${animeDetail.title}</h1>
        <div class="card bg-dark text-white">
          <img src="${animeDetail.thumb}" class="card-img-top" alt="${animeDetail.title}">
          <div class="card-body">
            <p class="card-text">${animeDetail.synopsis}</p>
            <ul class="list-group list-group-flush text-white">
              ${animeDetail.detail.map(detail => `<li class="list-group-item bg-dark text-white">${detail}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="mt-4">
          <h2 class="text-center">Episode</h2>
          <ul class="list-group list-group-flush text-white">
            ${animeDetail.episode_list.map(episode => `
              <li class="list-group-item bg-dark text-white">
                <a href="/episode/${episode.episode_endpoint}" class="text-white">
                  ${episode.episode_title} - ${episode.episode_date}
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/episode/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const episodeStream = await fetchEpisodeStream(endpoint);

    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${episodeStream.title} - PURNIME TV</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
      <style>
        /* Gaya CSS yang sama dengan halaman utama */
      </style>
    </head>
    <body>
      <div class="container mt-5">
        <h1 class="text-center mb-4">${episodeStream.title}</h1>
        <div class="ratio ratio-16x9">
          <iframe src="${episodeStream.link_stream}" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
