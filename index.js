const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const save = require('./save');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use("/", save.pakpur)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Router
app.get('/manifest.json', (req, res) => {
  res.json({
    name: "PURNIME TV",
    short_name: "PURNIME",
    description: "Nikmati streaming terbaik di PURNIME TV",
    start_url: ".",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2196F3",
    icons: [
      {
        src: "https://telegra.ph/file/082d11505390a7ec238ed.jpg",
        sizes: "192x192",
        type: "image/jpeg"
      },
      {
        src: "https://telegra.ph/file/082d11505390a7ec238ed.jpg",
        sizes: "512x512",
        type: "image/jpeg"
      }
    ],
    lang: "id",
    dir: "ltr"
  });
});

app.get('/', async (req, res) =>{
  res.render("list")
});

app.get('/anime/:animeId', async (req, res) =>{
  res.render("play",{animeId:req.params.animeId});
})

app.get('/search', async (req, res) =>{
  res.render("search");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});