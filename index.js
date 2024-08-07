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

        const nextEpisode = episodeNumber + 1;
        const prevEpisode = episodeNumber - 1;

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${animeDetail.anime_detail.title} - Episode ${episodeNumber} | PurNime</title>
                <meta name="description" content="Tonton ${animeDetail.anime_detail.title} episode ${episodeNumber} di PurNime, situs streaming anime dan donghua terbaik.">
                <meta name="keywords" content="${animeDetail.anime_detail.title}, streaming anime, streaming donghua, nonton anime, nonton donghua">
                <meta name="google-adsense-account" content="ca-pub-5220496608138780">
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
                    <h1>${animeDetail.anime_detail.title}</h1>
                    <div class="iframe-container">
                        ${episodeData.streamLink ? `<iframe src="${episodeData.streamLink}" frameborder="0" allowfullscreen></iframe>` : '<p>Belum update kak tungguin ya</p>'}
                    </div>
                    <div class="d-flex justify-content-between mt-4">
                        <a href="/anime/${animeId}/${prevEpisode}" class="btn btn-outline-light ${prevEpisode < 1 ? 'disabled' : ''}">Previous Episode</a>
                        <a href="/anime/${animeId}/${nextEpisode}" class="btn btn-outline-light ${nextEpisode > episodeList.length ? 'disabled' : ''}">Next Episode</a>
                    </div>
                    <div class="mt-4">
                        <h2>List Episode</h2>
                        <div class="list-group">
                            ${episodeData.list_episode.map(episode => `
                                <a href="/anime/${animeId}/${episodeList.length - episodeData.list_episode.indexOf(episode)}" class="list-group-item list-group-item-action ${episode.list_episode_endpoint === selectedEpisode.episode_endpoint ? 'active' : ''}">${episode.list_episode_title}</a>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mt-4">
                        <h3>Synopsis</h3>
                        <p>${animeDetail.anime_detail.sinopsis}</p>
                    </div>
                </div>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error rendering stream page:', error.message);
        res.status(500).send('Internal Server Error');
    }
});
