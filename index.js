/* Basic Styling */
body {
  background-color: #121212;
  color: #fff;
  font-family: 'Arial', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1, h2, h3, h4, h5 {
  font-weight: 600;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.btn {
  border-radius: 5px;
  padding: 8px 16px;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #007bff;
  border: none;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-outline-light {
  border: 1px solid #fff;
  color: #fff;
}

.btn-outline-light:hover {
  background-color: #fff;
  color: #000;
}

/* Anime List Styling */
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

/* Anime Detail Styling */
.anime-detail {
  display: flex;
  gap: 20px;
}

.anime-thumb img {
  max-width: 200px;
  border-radius: 8px;
}

.anime-info {
  flex-grow: 1;
}

/* Episode Streaming Styling */
.iframe-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 0;
}

.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Responsive Styling */
@media (max-width: 768px) {
  .row-cols-md-3 {
    row-cols-1;
  }

  .anime-detail {
    flex-direction: column;
  }

  .anime-thumb img {
    max-width: 100%;
  }
}
