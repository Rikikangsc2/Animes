const express = require('express');
const pakpur = express.Router();
const axios = require('axios');

async function fetchAnimeDetail(endpoint) {
  try {
    const response = await axios.get(`https://api-otakudesu-livid.vercel.app/api/v1/detail/${endpoint}`);
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

pakpur.post('/save/:animeId', (req, res) => {
  const animeId = req.params.animeId;
  const bookmarks = req.cookies.bookmarks ? JSON.parse(req.cookies.bookmarks) : [];

  if (!bookmarks.includes(animeId)) {
    bookmarks.push(animeId);
    res.cookie('bookmarks', JSON.stringify(bookmarks), { maxAge: 365 * 24 * 60 * 60 * 1000 });
  }
  res.status(200).send();
});

pakpur.get('/save', async (req, res) => {
  const bookmarks = req.cookies.bookmarks ? JSON.parse(req.cookies.bookmarks) : [];

  const bookmarkedAnime = await Promise.all(bookmarks.map(async animeId => {
    const animeDetail = await fetchAnimeDetail(animeId);
    const lastEpisode = "#";
    return { animeId, title: animeDetail.anime_detail.title, lastEpisode };
  }));

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Saved Anime - PURNIME TV</title>
      <link rel="icon" href="https://telegra.ph/file/082d11505390a7ec238ed.jpg" type="image/x-icon">
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
        <h1 class="text-center mb-4">Saved Anime</h1>
        <div class="row row-cols-1 row-cols-md-3 g-4">
          ${bookmarkedAnime.length === 0 ? `
            <div class="col">
              <div class="alert alert-warning text-center" role="alert">
                <h1>Gak ada anime yang di save</h1></div>
                <script async="async" data-cfasync="false" src="//pl23995169.highratecpm.com/b6c17a23ebf18433686f5349b38b8a9d/invoke.js"></script>
                <div id="container-b6c17a23ebf18433686f5349b38b8a9d">
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

pakpur.post('/delete/:animeId', (req, res) => {
  const animeId = req.params.animeId;
  let bookmarks = req.cookies.bookmarks ? JSON.parse(req.cookies.bookmarks) : [];

  bookmarks = bookmarks.filter(id => id !== animeId);
  res.cookie('bookmarks', JSON.stringify(bookmarks), { maxAge: 365 * 24 * 60 * 60 * 1000 });
  res.sendStatus(200);
});

module.exports = {pakpur};