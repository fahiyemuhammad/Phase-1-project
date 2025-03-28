import { OMDB_API_KEY, YOUTUBE_API_KEY } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("search-bar");
    const movieListContainer = document.getElementById("movie-list");
    const trailerContainer = document.getElementById("trailer-container");
    const trailerIframe = document.getElementById("trailer");

    function fetchMovies(query = "john") {
        const apiUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.Response === "True") {
                    const movies = data.Search.map(movie => ({
                        title: movie.Title,
                        year: movie.Year,
                        poster: movie.Poster !== "N/A" ? movie.Poster : "https://dummyimage.com/150x200/000/fff.png&text=No+Image",
                        imdbID: movie.imdbID
                    }));
                    displayMovie(movies[0]); // Show first movie by default
                    populateMovieList(movies);
                } else {
                    movieListContainer.innerHTML = "<p>No movies found.</p>";
                    trailerContainer.style.display = "none";
                }
            })
            .catch(error => console.error("Error fetching movies:", error));
    }
    
function showBackupTrailerLink(movieTitle) {
    const backupLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(movieTitle + " official trailer")}`;
    trailerContainer.innerHTML = `<a href="${backupLink}" target="_blank">Watch Trailer on YouTube</a>`;
    trailerContainer.style.display = "block";
}

    function displayMovie(movie) {
        document.getElementById("movie-title").textContent = movie.title;
        document.getElementById("movie-year").textContent = `Year: ${movie.year}`;
        document.getElementById("movie-poster").src = movie.poster;
        fetchYouTubeTrailer(movie.title);
    }

    function populateMovieList(movies) {
        movieListContainer.innerHTML = "";

        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");
            movieCard.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>${movie.year}</p>
            `;
            movieCard.onclick = () => displayMovie(movie);
            movieCard.addEventListener("click",(e) => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            })
            movieListContainer.appendChild(movieCard);
        });
    }

    function fetchYouTubeTrailer(movieTitle) {
        const query = `${movieTitle} official trailer`;
        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`;

        fetch(youtubeApiUrl)
            .then(response => response.json())
            .then(data => {
                console.log("YouTube API Response:", data); // Trying to Debug

                if (data.items && data.items.length > 0) {
                    const videoId = data.items[0]?.id?.videoId || null;
                    if (videoId) {
                        trailerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                        trailerContainer.style.display = "block";
                    } else {
                        console.warn("No videoId found.");
                        trailerContainer.style.display = "none";
                    }
                } else {
                    console.error("No trailer found.");
                    trailerContainer.style.display = "none";
                }
            })
            .catch(error => console.error("Error fetching trailer:", error));
    }

    searchBar.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const query = searchBar.value.trim();
            if (query.length > 0) { // Prevent empty searches
                fetchMovies(query);
            }
        }
    });

    document.querySelector("#search-button").addEventListener("click", (e) => {
        const query = searchBar.value.trim();
        if (query.length > 0) {
            fetchMovies(query);
        }
    })
    
    const movieRatings = JSON.parse(localStorage.getItem("movieRatings")) || {};

    
    function renderStars(movieId, selectedRating = 0) {
        const starContainer = document.getElementById("star-container");
        starContainer.innerHTML = ""; 
        starContainer.setAttribute("data-movie-id", movieId);
    
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement("span");
            star.textContent = "★";
            star.classList.add("star");
            if (i <= selectedRating) star.classList.add("active");
    
            
            star.addEventListener("click", () => {
                saveRating(movieId, i);
                renderStars(movieId, i);
            });
    
            starContainer.appendChild(star);
        }
    }
    
    // Function to save rating
    function saveRating(movieId, rating) {
        if (!movieRatings[movieId]) movieRatings[movieId] = [];
        movieRatings[movieId].push(rating);
    
        const avgRating = (
            movieRatings[movieId].reduce((a, b) => a + b, 0) / movieRatings[movieId].length
        ).toFixed(1);
    
        document.getElementById("average-rating").textContent = `Average Rating: ${avgRating}`;
    
        localStorage.setItem("movieRatings", JSON.stringify(movieRatings));
    }
    
    function displayMovie(movie) {
        document.getElementById("movie-title").textContent = movie.title;
        document.getElementById("movie-year").textContent = `Year: ${movie.year}`;
        document.getElementById("movie-poster").src = movie.poster;
    
        fetchYouTubeTrailer(movie.title);
    
        displayRatingSection(movie.imdbID);
    }
    
    // Function to display rating UI when a movie is selected
    function displayRatingSection(movieId) {
        const avgRating = movieRatings[movieId]
            ? (movieRatings[movieId].reduce((a, b) => a + b, 0) / movieRatings[movieId].length).toFixed(1)
            : "0";
    
        document.getElementById("average-rating").textContent = `Average Rating: ${avgRating}`;
        renderStars(movieId, movieRatings[movieId] ? Math.round(avgRating) : 0);
        document.getElementById("rating-section").style.display = "block";
    }
    fetchMovies(); // Loading  default movies on page
});