const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Router
app.get('/', async (req, res) =>{
  res.render("list")
});

app.get('/anime/:animeId', async (req, res) =>{
  res.render("play",{animeId:req.params.animeId});
})

app.get('/search', async (req, res) =>{
  res.render("search");
});

app.get('/save', async (req, res) =>{
  res.render("saved");
});

//API
//Save anime
app.post('/save/:animeId', (req, res) => {
  const animeId = req.params.animeId;
  const bookmarks = req.cookies.bookmarks ? JSON.parse(req.cookies.bookmarks) : [];

  if (!bookmarks.includes(animeId)) {
    bookmarks.push(animeId);
    res.cookie('bookmarks', JSON.stringify(bookmarks), { maxAge: 365 * 24 * 60 * 60 * 1000 });
  }

  res.status(200).send('Anime saved successfully');
});

// Delete anime from bookmarks
app.post('/delete/:animeId', (req, res) => {
  const animeId = req.params.animeId;
  let bookmarks = req.cookies.bookmarks ? JSON.parse(req.cookies.bookmarks) : [];

  bookmarks = bookmarks.filter(id => id !== animeId);
  res.cookie('bookmarks', JSON.stringify(bookmarks), { maxAge: 365 * 24 * 60 * 60 * 1000 });
  res.sendStatus(200);
});

// API endpoint to get bookmarked anime IDs
app.get('/api/bookmarks', (req, res) => {
  const bookmarks = req.cookies.bookmarks ? JSON.parse(req.cookies.bookmarks) : [];
  res.json(bookmarks);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});