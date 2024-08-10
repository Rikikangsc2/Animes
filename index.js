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
    console.error('Error fetching data:', error.message);
    return [];
  }
}

async function searchAnime(query) {
  try {
    const response = await axios.get(`${basenya}/api/v1/search/${encodeURIComponent(query)}`);
    return response.data.search || [];
  } catch (error) {
    console.error('Error searching anime:', error.message);
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
    console.error('Error fetching anime detail:', error.message);
    return {};
  }
}

async function fetchEpisodeStream(endpoint) {
  try {
    const response = await axios.get(`${basenya}/api/v1/episode/${endpoint}`);
    return response.data || {};
  } catch (error) {
    console.error('Error fetching episode stream:', error.message);
    return {};
  }
}

function getPagination(currentPage, totalPages) {
  let nextPage = currentPage === totalPages ? 1 : currentPage + 1;
  let prevPage = currentPage === 1 ? totalPages : currentPage - 1;

  return { nextPage, prevPage };
}

app.use((req, res, next) => {
  const now = new Date();
  const resetTime = new Date();
  resetTime.setHours(24, 0, 0, 0);
  const maxAge = Math.floor((resetTime - now) / 1000);
  
  if (req.path === '/' || req.path.startsWith('/anime')) {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  }
  
  next();
});

function insertAds() {
  return `
    <div class="text-center mb-4">
      <script type="text/javascript">
        atOptions = {
          'key' : '820d725ae89df09a522cbf33be858824',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      </script>
      <script type="text/javascript" src="//www.topcreativeformat.com/820d725ae89df09a522cbf33be858824/invoke.js"></script>
      <script type="text/javascript">
        atOptions = {
          'key' : 'dd8ebba365a2d1ae7ca5e92744e27e1f',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      </script>
      <script type="text/javascript" src="//www.topcreativeformat.com/dd8ebba365a2d1ae7ca5e92744e27e1f/invoke.js"></script>
    </div>
  `;
}

app.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    const ongoingAnime = await fetchAnimeData(page);
    const animeData = await Promise.all(ongoingAnime.map(anime => fetchAnimeDetail(anime.endpoint)));
    const paginatedAnime = animeData.slice((page - 1) * pageSize, page * pageSize);

    const totalPages = Math.ceil(animeData.length / pageSize);
    const { nextPage, prevPage } = getPagination(page, totalPages);

    res.send(`
      <!DOCTYPE html>
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
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
          <style>
              body { 
                  background-color: #121212; 
                  color: #e0e0e0; 
                  font-family: 'Arial', sans-serif;
              }
              .anime-thumbnail { 
                  max-height: 230px; 
                  border-radius: 10px; 
              }
              .card {
                  border: 1px solid #333;
                  background-color: #1e1e1e;
              }
              .card-title {
                  font-size: 1.2rem;
                  font-weight: 600;
                  color: #ffbf00;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
              }
              .card-text {
                  font-size: 0.9rem;
                  color: #bbb;
              }
              .btn-watch {
                  background-color: #4caf50;
                  border: none;
                  border-radius: 5px;
                  padding: 8px 16px;
                  font-size: 0.9rem;
                  color: #fff;
              }
              .btn-watch:hover {
                  background-color: #43a047;
              }
              .btn-save {
                  background-color: #ff5722;
                  border: none;
                  border-radius: 5px;
                  padding: 8px 16px;
                  font-size: 0.9rem;
                  color: #fff;
              }
              .btn-save:hover {
                  background-color: #e64a19;
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
              .nav-link {
                  color: #ffffff;
              }
              .nav-link:hover {
                  color: #ffbf00;
              }
          </style>
      </head>
      <body>
          <div class="container mt-5">
              <h1 class="text-center mb-4">PUR-NIME TV</h1>
              <nav class="navbar navbar-dark bg-dark mb-4">
                <div class="container-fluid">
                  <a class="navbar-brand" href="/">Home</a>
                  <div class="d-flex">
                    <a class="nav-link" href="/save"><i class="fas fa-bookmark"></i> Saved Anime</a>
                  </div>
                </div>
              </nav>
              ${insertAds()}
              <form action="/search" method="POST" class="d-flex justify-content-center mb-4"> 
                  <input class="form-control me-2" type="search" name="search" placeholder="Search Anime" aria-label="Search">
                  <button class="btn btn-outline-light" type="submit"><i class="fas fa-search"></i></button>
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
                <button class="btn btn-save" onclick="event.preventDefault(); saveAnime('${anime.endpoint}')">
                    <i class="fas fa-save"></i> Simpan
                </button>
            </div>
        </div>
    `).join('')}
</div>
              <div class="d-flex justify-content-between mt-4">
                  <a href="/?page=${prevPage}" class="btn btn-outline-light"><i class="fas fa-arrow-left"></i> Back Page</a>
                  <a href="/?page=${nextPage}" class="btn btn-outline-light">Next Page <i class="fas fa-arrow-right"></i></a>
              </div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
          <script>
            function saveAnime(animeId) {
              fetch('/save/' + animeId, { method: 'POST' })
                .then(response => {
                  if (response.ok) {
                    alert('Udah di save bro silahkan cek di save');
                  }
                })
                .catch(error => console.error('Error saving anime:', error));
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

app.post('/save/:animeId', (req, res) => {
  const animeId = req.params.animeId;
  const bookmarks = req.cookies.bookmarks ? JSON.parse(req.cookies.bookmarks) : [];

  if (!bookmarks.includes(animeId)) {
    bookmarks.push(animeId);
    res.cookie('bookmarks', JSON.stringify(bookmarks), { maxAge: 365 * 24 * 60 * 60 * 1000 });
  }

  // Get the last episode watched by the user
  const lastEpisode = req.cookies[`lastEpisode_${animeId}`];
  if (lastEpisode) {
    res.redirect(`/anime/${animeId}/${lastEpisode}`);
  } else {
    res.redirect('/save');
  }
});

app.get('/save', async (req, res) => {
  const bookmarks = req.cookies.bookmarks ? JSON.parse(req.cookies.bookmarks) : [];

  const bookmarkedAnime = await Promise.all(bookmarks.map(async animeId => {
    const animeDetail = await fetchAnimeDetail(animeId);
    const lastEpisode = 1;
    return { animeId, title: animeDetail.anime_detail.title, lastEpisode };
  }));

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Saved Anime - PURNIME TV</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
        body { background-color: #121212; color: #e0e0e0; }
        .anime-thumbnail { max-height: 230px; border-radius: 10px; }
        .card {
          border: 1px solid #333;
          background-color: #1e1e1e;
        }
        .card-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #ffbf00;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-text {
          font-size: 0.9rem;
          color: #bbb;
        }
        .btn-watch {
          background-color: #4caf50;
          border: none;
          border-radius: 5px;
          padding: 8px 16px;
          font-size: 0.9rem;
          color: #fff;
        }
        .btn-watch:hover {
          background-color: #43a047;
        }
        .btn-delete {
          background-color: #e64a19;
          border: none;
          border-radius: 5px;
          padding: 8px 16px;
          font-size: 0.9rem;
          color: #fff;
        }
        .btn-delete:hover {
          background-color: #d32f2f;
        }
        .nav-link {
            color: #ffffff;
        }
        .nav-link:hover {
            color: #ffbf00;
        }
      </style>
    </head>
    <body>
      <div class="container mt-5">
        <nav class="navbar navbar-dark bg-dark mb-4">
          <div class="container-fluid">
            <a class="navbar-brand" href="/">Home</a>
            <div class="d-flex">
              <a class="nav-link" href="/save"><i class="fas fa-bookmark"></i> Saved Anime</a>
            </div>
          </div>
        </nav>
        ${insertAds()}
        <h1 class="text-center mb-4">Saved Anime</h1>
        <div class="row row-cols-1 row-cols-md-3 g-4">
          ${bookmarkedAnime.length === 0 ? `
            <div class="col">
              <div class="alert alert-warning text-center" role="alert">
                No anime saved yet. Start saving your favorite anime!
              </div>
            </div>
          ` : bookmarkedAnime.map(anime => `
            <div class="col">
              <div class="card h-100 text-white">
                <a href="/anime/${anime.animeId}/${anime.lastEpisode}" style="text-decoration: none;">
                  <div class="card-body">
                    <h5 class="card-title">${anime.title}</h5>
                    <a href="/anime/${anime.animeId}/${anime.lastEpisode}" class="btn btn-watch"><i class="fas fa-play"></i> Tonton</a>
                    <button class="btn btn-delete" onclick="deleteAnime('${anime.animeId}')"><i class="fas fa-trash-alt"></i> Hapus</button>
                  </div>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
      <script>
        function deleteAnime(animeId) {
          fetch('/delete/' + animeId, { method: 'POST' })
            .then(response => {
              if (response.ok) {
                location.reload();
              }
            })
            .catch(error => console.error('Error deleting anime:', error));
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/delete/:animeId', (req, res) => {
  const animeId = req.params.animeId;
  let bookmarks = req.cookies.bookmarks ? JSON.parse(req.cookies.bookmarks) : [];

  bookmarks = bookmarks.filter(id => id !== animeId);
  res.cookie('bookmarks', JSON.stringify(bookmarks), { maxAge: 365 * 24 * 60 * 60 * 1000 });
  res.sendStatus(200);
});

app.get('/anime/:animeId/:episode?', async (req, res) => {
  try {
    const animeId = req.params.animeId;
    const episodeNumber = parseInt(req.params.episode) || 1;

    const animeDetail = await fetchAnimeDetail(animeId);
    const episodeList = animeDetail.episode_list || [];

    if (episodeNumber < 1 || episodeNumber > episodeList.length) {
      return res.status(404).send('Episode not found');
    }

    const selectedEpisode = episodeList[episodeList.length - episodeNumber];
    const episodeData = await fetchEpisodeStream(selectedEpisode.episode_endpoint);

    const serverOptions = [];
    const mirrors = ['mirror_embed1', 'mirror_embed2', 'mirror_embed3'];

    mirrors.forEach(mirrorKey => {
      const mirrorData = episodeData[mirrorKey];
      if (mirrorData && mirrorData.straming.length > 0) {
        mirrorData.straming.forEach(server => {
          serverOptions.push({
            name: `${server.driver.trim()} - ${mirrorData.quality}`,
            link: server.link
          });
        });
      }
    });

    let streamingUrl = episodeData.streamLink;
    if (req.query.server) {
      const selectedServer = serverOptions.find(server => server.name === req.query.server);
      if (selectedServer) {
        const streamResponse = await axios.get(`${basenya}${selectedServer.link}`);
        streamingUrl = streamResponse.data.streaming_url || streamingUrl;
      }
    }

    const nextEpisode = episodeNumber + 1;
    const prevEpisode = episodeNumber - 1;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Nonton ${animeDetail.anime_detail.title} - Episode ${episodeNumber} | PURNIME TV</title>
        <meta name="description" content="Tonton ${animeDetail.anime_detail.title} episode ${episodeNumber} di PURNIME TV, situs streaming anime terbaik.">
        <meta name="keywords" content="${animeDetail.anime_detail.title}, streaming anime, streaming donghua, nonton anime, nonton donghua">
        <meta name="google-adsense-account" content="ca-pub-5220496608138780">
        <link rel="icon" href="https://th.bing.com/th/id/OIG1.zckrRMeI76ehRbucAgma?dpr=2&pid=ImgDetMain" type="image/x-icon">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          body { background-color: #121212; color: #e0e0e0; }
          .iframe-container { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; }
          .iframe-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
          .anime-detail { display: flex; flex-wrap: wrap; gap: 20px; }
          .anime-thumb img { max-width: 100%; border-radius: 8px; }
          .anime-info { flex-grow: 1; }
          .nav-link {
              color: #ffffff;
          }
          .nav-link:hover {
              color: #ffbf00;
          }
        </style>
      </head>
      <body>
        <div class="container mt-5">
          <nav class="navbar navbar-dark bg-dark mb-4">
            <div class="container-fluid">
              <a class="navbar-brand" href="/">Home</a>
              <div class="d-flex">
                <a class="nav-link" href="/save"><i class="fas fa-bookmark"></i> Saved Anime</a>
              </div>
            </div>
          </nav>
          ${insertAds()}
          <div class="anime-detail mb-4">
            <div class="anime-thumb">
              <img src="${animeDetail.anime_detail.thumb}" alt="${animeDetail.anime_detail.title}">
            </div>
            <div class="anime-info">
              <h1>${animeDetail.anime_detail.title}</h1>
              <ul>
                ${animeDetail.anime_detail.detail.map(detail => `
                  <li>${detail}</li>
                `).join('')}
              </ul>
            </div>
          </div>
          <div class="mt-4">
            <h3>Synopsis</h3>
            <p>${animeDetail.anime_detail.sinopsis}</p>
          </div>
          <div class="d-flex justify-content-between mb-4 mt-4">
            <a href="/" class="btn btn-outline-light"><i class="fas fa-home"></i> Home</a>
            <form method="GET" class="d-inline-flex">
              <input type="hidden" name="episode" value="${episodeNumber}">
              <select name="server" class="form-select me-2" onchange="this.form.submit()">
                <option selected disabled>Select Server</option>
                ${serverOptions.map(server => `
                  <option value="${server.name}" ${req.query.server === server.name ? 'selected' : ''}>
                    ${server.name}
                  </option>
                `).join('')}
              </select>
              <noscript><button type="submit" class="btn btn-outline-light">Switch</button></noscript>
            </form>
          </div>
          <div class="iframe-container">
            <iframe src="${streamingUrl}" frameborder="0" allowfullscreen></iframe>
          </div>
          <div class="d-flex justify-content-between mt-4">
            <a href="/anime/${animeId}/${prevEpisode}" class="btn btn-outline-light ${prevEpisode < 1 ? 'disabled' : ''}"><i class="fas fa-arrow-left"></i> Previous Episode</a>
            <a href="/anime/${animeId}/${nextEpisode}" class="btn btn-outline-light ${nextEpisode > episodeList.length ? 'disabled' : ''}">Next Episode <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="mt-4">
            <h2>List Episode</h2>
            <div class="list-group">
              ${episodeList.map(episode => `
                <a href="/anime/${animeId}/${episodeList.length - episodeList.indexOf(episode)}" class="list-group-item list-group-item-action ${episode.episode_endpoint === selectedEpisode.episode_endpoint ? 'active' : ''}">
                  ${episode.episode_title}
                </a>
              `).join('')}
            </div>
          </div>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rendering stream page:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/search', async (req, res) => {
  try {
    const searchQuery = req.body.search;
    const searchResults = await searchAnime(searchQuery);
    const animeData = await Promise.all(searchResults.map(anime => fetchAnimeDetail(anime.endpoint)));

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hasil Pencarian: ${searchQuery} - PURNIME TV</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          body { background-color: #121212; color: #e0e0e0; }
          .anime-thumbnail { max-height: 230px; border-radius: 10px; }
          .card {
            border: 1px solid #333;
            background-color: #1e1e1e;
          }
          .card-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #ffbf00;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .card-text {
            font-size: 0.9rem;
            color: #bbb;
          }
          .btn-watch {
            background-color: #4caf50;
            border: none;
            border-radius: 5px;
            padding: 8px 16px;
            font-size: 0.9rem;
            color: #fff;
          }
          .btn-watch:hover {
            background-color: #43a047;
          }
          .btn-save {
            background-color: #ff5722;
            border: none;
            border-radius: 5px;
            padding: 8px 16px;
            font-size: 0.9rem;
            color: #fff;
          }
          .btn-save:hover {
            background-color: #e64a19;
          }
        </style>
      </head>
      <body>
        <div class="container mt-5">
          <h1 class="text-center mb-4">Hasil Pencarian: ${searchQuery}</h1>
          <nav class="navbar navbar-dark bg-dark mb-4">
            <div class="container-fluid">
              <a class="navbar-brand" href="/">Home</a>
              <div class="d-flex">
                <a class="nav-link" href="/save"><i class="fas fa-bookmark"></i> Saved Anime</a>
              </div>
            </div>
          </nav>
          ${insertAds()}
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
                      <a href="/anime/${anime.endpoint}" class="btn btn-watch"><i class="fas fa-play"></i> Tonton</a>
                      <button class="btn btn-save" onclick="event.preventDefault(); saveAnime('${anime.endpoint}')">
                    <i class="fas fa-save"></i> Simpan
                </button>
                </div>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
        <script>
            function saveAnime(animeId) {
              fetch('/save/' + animeId, { method: 'POST' })
                .then(response => {
                  if (response.ok) {
                    alert('Udah di save bro silahkan cek di save');
                  }
                })
                .catch(error => console.error('Error saving anime:', error));
            }
          </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
