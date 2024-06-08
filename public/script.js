import {clientId} from "../config";
import {clientSecret} from "../config";

//API Interface module for each Spotify endpoint
const APIController = (function () {

    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getGenres = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=en_AU`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getRecommendations = async (token, seed_genres, seed_artists = '', min_tempo = '90', max_tempo = '120') => {
        const market = 'US';
        if (!seed_genres || seed_genres.trim() === '') {
            seed_genres = 'pop';
        }

        const lowerCaseSeedGenres = seed_genres.toLowerCase();

        const result = await fetch(`https://api.spotify.com/v1/recommendations?market=${market}&seed_artist=${seed_artists}&seed_genres=${lowerCaseSeedGenres}&min_tempo=${min_tempo}&max_tempo=${max_tempo}`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data.tracks;
    }

    const _favRecommendations = async (token, market, artistId, genre, tempo) => {

        const result = await fetch(`https://api.spotify.com/v1/recommendations?market=${market}&seed_artist=${artistId}&seed_genres=${genre}&min_tempo=${tempo - 20}&max_tempo=${tempo}`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        })

        const data = await result.json();
        return data.tracks;

    }

    const _getTrack = async (token, trackEndPoint) => {
        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    const _searchTracks = async (token, query) => {
        const result = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data.tracks.items;
    }

    const _getAudioFeaturesForTrack = async (token, trackId) => {
        const result = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        },
        searchTracks(token, query) {
            return _searchTracks(token, query);
        },
        getAudioFeaturesForTrack(token, trackId) {
            return _getAudioFeaturesForTrack(token, trackId);
        },
        getRecommendations(token, seed_genres, seed_artists) {
            return _getRecommendations(token, seed_genres, seed_artists);
        },
        favRecommendations(token, market, artistId, genre, tempo) {
            return _favRecommendations(token, market, artistId, genre, tempo);
        }
    }
})();

//UI module that contains the code to set up the single page web app
const UIController = (function () {

    const DOMElements = {
        selectGenreOption: '#genre-options',
        divRecommendations: '#recommendations',
        hfToken: '#hidden_token'
    }

    return {
        inputField() {
            return {
                genreOption: document.querySelector(DOMElements.selectGenreOption),
                recommendations: document.querySelector(DOMElements.divRecommendations)
            }
        },

        createGenreOption(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenreOption).insertAdjacentHTML('beforeend', html);
        },

        createRecommendationsDetail(img, title, artist, id) {
            const detailDiv = document.querySelector(DOMElements.divRecommendations);
            const html = `
                <div class="card song-card" data-track-id="${id}">
                    <img src="${img}" class="card-img" alt="${title} album cover"/>        
                    <p class="card-name">${title}</p>
                    <p class="card-description">By ${artist}</p>
                </div>
            `;
            detailDiv.insertAdjacentHTML('beforeend', html);
        },

        resetRecommendations() {
            this.inputField().recommendations.innerHTML = '';
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

//Application module that controls the application flow and functionality
const APPController = (function (UICtrl, APICtrl) {

    const DOMInputs = UICtrl.inputField();

    const loadGenres = async () => {
        const token = await APICtrl.getToken();
        UICtrl.storeToken(token);
        const genres = await APICtrl.getGenres(token);
        genres.forEach(element => UICtrl.createGenreOption(element.name, element.id));
    }

    const loadRecommendations = async (genre) => {
        const token = await APICtrl.getToken();
        UICtrl.storeToken(token);
        UICtrl.resetRecommendations(); //clear the previous recommendations
        const recommendations = await APICtrl.getRecommendations(token, genre);
        recommendations.forEach(el => UICtrl.createRecommendationsDetail(el.album.images[1].url, el.name, el.artists[0].name, el.id));
        addEventListenersToSongCards();
    }

    const loadInitialRecommendations = async () => {
        const token = await APICtrl.getToken();
        const recommendations = await APICtrl.getRecommendations(token, 'pop');
        UICtrl.resetRecommendations();
        recommendations.forEach(track => {
            UICtrl.createRecommendationsDetail(track.album.images[1].url, track.name, track.artists[0].name, track.id);
        });
        addEventListenersToSongCards();
    }

    //Allow the user to click on a specific song card to view additional detail and actions
    const addEventListenersToSongCards = () => {
        const songCards = document.querySelectorAll('.song-card');
        songCards.forEach(card => {
            card.addEventListener('click', async (e) => {
                const token = UICtrl.getStoredToken().token;
                const trackId = e.currentTarget.getAttribute('data-track-id');
                const trackDetails = await APICtrl.getTrack(token, `https://api.spotify.com/v1/tracks/${trackId}`);
                populateReviewTab(trackDetails);
                showReviewTab();
            });
        });
    }

    //Mapping to convert the Spotify reference number into the actual music key
    const keyMapping = {
        0: "C",
        1: "C#/D♭",
        2: "D",
        3: "D#/E♭",
        4: "E",
        5: "F",
        6: "F#/G♭",
        7: "G",
        8: "G#/A♭",
        9: "A",
        10: "A#/B♭",
        11: "B"
    };

    //Get all of the data for the detail view and actions on a specific song
    const populateReviewTab = async (track) => {
        const token = UICtrl.getStoredToken().token;
        const audioTrackFeatures = await APICtrl.getAudioFeaturesForTrack(token, track.id);
        console.log(audioTrackFeatures);

        document.getElementById('song-title').innerText = track.name;
        document.getElementById('song-artist').innerText = track.artists[0].name;
        document.getElementById('song-artwork').src = track.album.images[0].url;

        document.getElementById('trackId').value = track.id;
        document.getElementById('artistId').value = track.artists[0].id;
        document.getElementById('danceability').innerText = Math.round(audioTrackFeatures.danceability * 100);
        document.getElementById('time-signature').innerText = audioTrackFeatures.time_signature;
        document.getElementById('tempo').innerText = Math.round(audioTrackFeatures.tempo);
        document.getElementById('energy').innerText = Math.round(audioTrackFeatures.energy * 100);

        //Get and load any associated reviews for this song
        loadReviews(track.id);

        const key = audioTrackFeatures.key;
        const keyNotation = keyMapping[key] !== undefined ? keyMapping[key] : "Unknown Key";
        document.getElementById('key').innerText = keyNotation;

        const popularity = track.popularity;
        const scoreOutOfFive = (popularity / 100) * 5;
        const roundedScore = Math.round(scoreOutOfFive);

        document.getElementById('rating-score').innerText = scoreOutOfFive.toFixed(1);

        const stars = document.querySelector('.stars');
        stars.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.className = 'material-symbols-outlined';
            star.innerText = 'star_rate';
            if (i < roundedScore) {
                star.classList.add('filled');
            }
            stars.appendChild(star);
        }

        //Get all rating emoji groups
        const ratingEmojiGroups = document.querySelectorAll(
            '.rating-emojis, .frequency-emojis, .mood-emojis, .skip-emojis'
        );

        //Function to handle emoji clicks
        function handleEmojiClick(event) {
            const clickedEmoji = event.target;
            const emojiGroup = clickedEmoji.parentElement;
            const ratingType = emojiGroup.classList[0];

            //handling for mood emojis: only one can be selected
            if (ratingType === 'mood-emojis') {
                emojiGroup.querySelectorAll('.material-symbols-outlined').forEach(emoji => {
                    emoji.classList.remove('selected');
                });
                clickedEmoji.classList.add('selected');
            } else { //For other rating types, follow the usual logic
                const clickedIndex = Array.from(emojiGroup.children).indexOf(clickedEmoji);
                emojiGroup.querySelectorAll('.material-symbols-outlined').forEach((emoji, index) => {
                    if (index <= clickedIndex) {
                        emoji.classList.add('selected');
                    } else {
                        emoji.classList.remove('selected');
                    }
                });
            }

        }


        //add event listeners to each emoji group
        ratingEmojiGroups.forEach(group => {
            group.addEventListener('click', handleEmojiClick);

            const emojis = group.querySelectorAll('.material-symbols-outlined');
        });

    }

    //Unhide and display the review tab
    const showReviewTab = () => {
        const mainContents = document.querySelectorAll('.main-content');
        mainContents.forEach(content => content.style.display = 'none');
        document.getElementById('review').style.display = 'block';
    }

    //Add new favourite from the track detail section
    favButton.addEventListener('click', async () => {

        const token = await APICtrl.getToken();
        UICtrl.storeToken(token);
        const market = "US";
        const genre = "pop";
        const trackId = document.querySelector('#trackId').value;
        const trackName = document.getElementById('song-title').innerText;
        const artistId = document.getElementById('artistId').value;
        const artistName = document.getElementById('song-artist').innerText;
        const songArtwork = document.getElementById('song-artwork').src;
        const danceability = document.getElementById('danceability').innerText;
        const timeSignature = document.getElementById('time-signature').innerText;
        const tempo = document.getElementById('tempo').innerText;
        const energy = document.getElementById('energy').innerText;
        const key = document.getElementById('key').innerText;

        const favRecommendationsList = await APICtrl.favRecommendations(token, market, artistId, genre, tempo);

        const favPlaylist = {
            playlistId: crypto.randomUUID(),
            playlistName: 'Anonymous',
            playlistArtistId: artistId,
            playlistArtistName: artistName,
            playlistTrackId: trackId,
            playlistTrackName: trackName,
            playlistTrackArtwork: songArtwork,
            playlistGenre: genre,
            playlistDate: new Date().toLocaleDateString(),
            playlistCollection: favRecommendationsList
        };

        saveFavPlaylist(favPlaylist);

    });


    /********* Playlist **********/
    //Save the playlist recommendations to localstorage
    function saveFavPlaylist(favPlaylist) {
        let favPlaylists = JSON.parse(localStorage.getItem('favPlaylists')) || [];
        favPlaylists.push(favPlaylist);
        localStorage.setItem('favPlaylists', JSON.stringify(favPlaylists));
    }

    return {
        init() {
            console.log('App is starting');
            loadGenres();
            loadInitialRecommendations();

            DOMInputs.genreOption.addEventListener('change', async () => {
                const selectedGenre = DOMInputs.genreOption.options[DOMInputs.genreOption.selectedIndex].text;
                await loadRecommendations(selectedGenre);
            });
        },
        populateReviewTab,
        showReviewTab,
        addEventListenersToSongCards

    }

})(UIController, APIController);

document.addEventListener('DOMContentLoaded', () => {

    APPController.init();

    const navLinks = document.querySelectorAll('.nav-link');
    const mainContents = document.querySelectorAll('.main-content');
    const reviewInput = document.getElementById('reviewInput');
    const uploadButton = document.getElementById('uploadButton');
    const playlistsContainer = document.getElementById('playlists');
    const reviewsContainer = document.getElementById('reviews');
    const reviewedSongsContainer = document.getElementById('reviewed-songs');
    const playlistsChip = document.querySelector('#playlists-chip');
    const reviewedSongsChip = document.querySelector('#reviewed-songs-chip');
    const playlistsSection = document.querySelector('#playlists-section');
    const reviewedSongsSection = document.querySelector('#reviewed-songs-section');
    const queryInput = document.getElementById('searchInput');
    const autocompleteResultsDiv = document.getElementById('autocomplete-results');

    document.querySelector('#home').style.display = 'block';

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-target');
            mainContents.forEach(content => {
                content.style.display = content.id === target ? 'block' : 'none';
            });
        });

    });

    playlistsChip.addEventListener('click', () => {
        playlistsSection.style.display = 'block';
        reviewedSongsSection.style.display = 'none';
        loadPlaylists()
    });

    function loadPlaylists() {
        let playlists = JSON.parse(localStorage.getItem('favPlaylists')) || [];

        const filteredPlaylists = playlists

        filteredPlaylists.forEach(playlist => {
            replacePlaylist(playlist);
        });
    }

    //Create the list view for the playlist screen
    function playlistContainer(playlist) {
        const playlistElement = document.createElement('div');
        playlistElement.classList.add('playlist');
        playlistElement.classList.add(`playlist-${playlist.playlistId}`);

        playlistElement.innerHTML = `
            <div class="playlist-card">
                <img class="playlist-song-img" src="${playlist.playlistTrackArtwork}" alt="${playlist.playlistTrackName}">
                <div class="playlist-song-info">
                    <h4>Created: ${playlist.playlistDate}</h4>
                    <h4 class="playlist-song-title">${playlist.playlistTrackName}</h4>
                    <p class="playlist-song-artist">${playlist.playlistArtistName}</p>
                </div>
            </div>
        `;

        //Allow the user to click a specific song card to see additional details and actions for that song
        playlistElement.addEventListener('click', () => {
            renderPlaylistDetails(playlist);
        });
        return playlistElement;

    }

    //Remove a playlist that the user added from the localstorage
    function replacePlaylist(playlist) {
        const playlistElement = document.querySelector(`.playlist-${playlist.playlistId}`);

        //check to see if the playlist element exists
        if (playlistElement) {
            playlistContainer(playlist);
        } else {
            //The case where the element doesn't exist
            playlistsContainer.appendChild(playlistContainer(playlist));
        }
    }


    //This is the individual playlist page
    function renderPlaylistDetails(playlist) {

        console.log(playlist);
        console.log(playlist.playlistId);

        document.getElementById('home').style.display = 'none';
        document.getElementById('search').style.display = 'none';
        document.getElementById('review').style.display = 'none';
        document.getElementById('review-details').style.display = 'none';
        document.getElementById('playlist-details').style.display = 'block';

        //delete button event listener here
        let deletePlaylistButton = document.querySelector('.delete-button');
        if (!deletePlaylistButton) {
            deletePlaylistButton = document.createElement('button');
            deletePlaylistButton.textContent = 'Delete Playlist';
            deletePlaylistButton.classList.add('delete-button');
            document.querySelector('.playlist-details').prepend(deletePlaylistButton);
        }

        deletePlaylistButton.addEventListener('click', () => {
            deletePlaylist(playlist.playlistId);
            // UI updates here
            document.getElementById('playlist-details').style.display = 'none'; // Hide review details
            document.getElementById('home').style.display = 'block'; // Show home page
        });

        const playlistData = playlist;

        const playlistCollection = playlistData.playlistCollection;

        const detailDiv = document.querySelector("#favRecommendations");
        detailDiv.innerHTML = '';

        for (const track of playlistCollection) {
            const html = `
                <div class="card song-card" data-track-id="${track.id}">
                    <img src="${track.album.images[0].url}" class="card-img" alt="${track.artists[0].name} album cover"/>        
                    <p class="card-name">${track.album.name}</p>
                    <p class="card-description">By ${track.artists[0].name}</p>
                </div>
            `;
            detailDiv.insertAdjacentHTML('beforeend', html);

        }

        APPController.addEventListenersToSongCards();

    }

    function getRatingIcons(rating, maxRating = 5) {
        let icons = '';
        for (let i = 1; i <= maxRating; i++) {
            icons += `<span class=${i <= rating ? "'material-symbols-outlined selected'" : "'material-symbols-outlined'"}>star_rate</span>`;
        }
        return icons;
    }


    reviewedSongsChip.addEventListener('click', () => {
        playlistsSection.style.display = 'none';
        reviewedSongsSection.style.display = 'block';
        loadReviewedSongs();
    });

    //this is used for the Search page and the auto complete results
    queryInput.addEventListener('input', async () => {
        const query = queryInput.value.trim();
        if (query) {
            const token = await APIController.getToken();
            const tracks = await APIController.searchTracks(token, query);
            displayAutocompleteResults(tracks, token);
        } else {
            autocompleteResultsDiv.innerHTML = '';
        }
    });

    //Search as the user types to show what songs are available
    function displayAutocompleteResults(tracks, token) {
        autocompleteResultsDiv.innerHTML = '';
        if (tracks.length > 0) {
            tracks.forEach(track => {
                const html = `
                    <div class="card song-card" data-track-id="${track.id}">
                        <img src="${track.album.images[1].url}" class="card-img" alt="${track.name} album cover"/>        
                        <p class="card-name">${track.name}</p>
                        <p class="card-description">By ${track.artists[0].name}</p>
                    </div>
                `;
                autocompleteResultsDiv.insertAdjacentHTML('beforeend', html);

                const songCard = autocompleteResultsDiv.lastElementChild;
                songCard.addEventListener('click', async () => {
                    const trackDetails = await APIController.getTrack(token, `https://api.spotify.com/v1/tracks/${track.id}`);
                    APPController.populateReviewTab(trackDetails);
                    APPController.showReviewTab();
                });
            });
        } else {
            autocompleteResultsDiv.innerHTML = '<p>No tracks found</p>';
        }
    }

    //*********REVIEW SECTION*********//

    //Add new feedback from the track detail seciton
    uploadButton.addEventListener('click', () => {
        const reviewText = reviewInput.value;
        const trackId = document.querySelector('#trackId').value;

        if (reviewText) {
            const ratingEmojis = document.querySelectorAll('.rating-emojis .material-symbols-outlined');
            const frequencyEmojis = document.querySelectorAll('.frequency-emojis .material-symbols-outlined');
            const moodEmojis = document.querySelectorAll('.mood-emojis .material-symbols-outlined');
            const skipEmojis = document.querySelectorAll('.skip-emojis .material-symbols-outlined');

            const review = {
                id: crypto.randomUUID(),
                trackId: trackId,
                reviewerName: 'Anonymous',
                rating: Array.from(ratingEmojis).filter(icon => icon.classList.contains('selected')).length,
                frequency: Array.from(frequencyEmojis).filter(icon => icon.classList.contains('selected')).length,
                mood: Array.from(moodEmojis).findIndex(icon => icon.classList.contains('selected')) + 1,
                skipRate: Array.from(skipEmojis).filter(icon => icon.classList.contains('selected')).length,
                reviewText,
                songTitle: document.getElementById('song-title').innerText,
                songArtist: document.getElementById('song-artist').innerText,
                songArtwork: document.getElementById('song-artwork').src,
                reviewDate: new Date().toLocaleDateString(),
            };

            saveReview(review); // Save to local storage (existing function)
            loadReviews(trackId); // Load updated reviews (existing function)
            resetIcons();
            reviewInput.value = '';
        }
    });

    //Save the users review to localstorage
    function saveReview(review) {
        let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        reviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(reviews));
    }

    //Get the reviews from localstorage to display them to the user
    function loadReviewedSongs() {
        let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        reviewedSongsContainer.innerHTML = '';

        const uniqueReviewedSongs = [...new Set(reviews.map(review => review.trackId))];
        uniqueReviewedSongs.forEach(trackId => {
            const review = reviews.find(r => r.trackId === trackId);
            appendReviewedSong(review);
        });
    }

    //display a list of reviews for teh user to select and see additional details
    function appendReviewedSong(review) {
        const reviewedSongElement = document.createElement('div');
        reviewedSongElement.classList.add('reviewed-song');
        reviewedSongElement.innerHTML = `
            <div class="reviewed-song-card">
                <img class="reviewed-song-img" src="${review.songArtwork}" alt="${review.songTitle}">
                <div class="reviewed-song-info">
                    <h4 class="reviewed-song-title">${review.songTitle}</h4>
                    <p class="reviewed-song-artist">${review.songArtist}</p>
                </div>
            </div>
        `;
        reviewedSongElement.addEventListener('click', () => {
            renderReviewDetails(review);
        });
        reviewedSongsContainer.appendChild(reviewedSongElement);
    }

    //This is the individual review page
    function renderReviewDetails(review) {

        document.getElementById('home').style.display = 'none';
        document.getElementById('search').style.display = 'none';
        document.getElementById('review').style.display = 'none';
        document.getElementById('playlist-details').style.display = 'none';
        document.getElementById('review-details').style.display = 'block';

        document.getElementById('songArtwork').src = review.songArtwork;
        document.getElementById('songArtwork').alt = review.songTitle;
        document.getElementById('songTitle').textContent = review.songTitle;
        document.getElementById('songArtist').textContent = review.songArtist;
        document.getElementById('reviewDate').textContent = `Reviewed on ${review.reviewDate}`;
        document.getElementById('reviewText').textContent = review.reviewText;

        // Use rating values directly from review object
        document.getElementById('rating-emojis').innerHTML = getRatingIcons(parseInt(review.rating, 10));
        document.getElementById('listeningFrequency').innerHTML = getFrequencyIcons(review.frequency);
        document.getElementById('mood').innerHTML = getMoodIcons(review.mood);
        document.getElementById('skipRate').innerHTML = getSkipRateIcons(review.skipRate);

        const existingDeleteButton = document.querySelector('.delete-button');
        if (existingDeleteButton) {
            existingDeleteButton.remove();
        }

        // Add a delete button here
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Review';
        deleteButton.classList.add('delete-button');
        document.querySelector('.review-details').appendChild(deleteButton);

        // Delete button event listener here
        deleteButton.addEventListener('click', () => {
            deleteReview(review.id);
            // UI updates here
            document.getElementById('review-details').style.display = 'none'; // Hide review details
            document.getElementById('home').style.display = 'block'; // Show home page
        });
    }

});

//get a review for a specific song
function loadReviews(trackId) {
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    document.getElementById('reviews').innerHTML = '';

    const filteredReviews = reviews.filter(review => review.trackId === trackId);
    filteredReviews.forEach(review => {
        appendReview(review);
    });
}

//Get the specific review data for the Song detail page
function appendReview(review) {
    //Check if a review with the same song title already exists
    const existingReview = document.querySelector(`.review-${review.id}`);
    if (existingReview) {
        //Update the existing review
        const filledStars = '★'.repeat(review.rating);
        const emptyStars = '☆'.repeat(5 - review.rating);

        existingReview.innerHTML = `
            <h4>${review.songTitle}</h4>
            <div class="review-rating">
                ${filledStars}${emptyStars}
            </div>
            <p>${review.reviewText}</p>
        `;
    } else {
        //Create a new review element (if it doesn't already exist)
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('review');
        reviewElement.classList.add(`review-${review.id}`);

        const filledStars = '★'.repeat(review.rating);
        const emptyStars = '☆'.repeat(5 - review.rating);

        reviewElement.innerHTML = `
            <h4>${review.songTitle}</h4>
            <div class="review-rating">
                ${filledStars}${emptyStars}
            </div>
            <p>${review.reviewText}</p>
        `;
        document.getElementById('reviews').appendChild(reviewElement);
    }
}

//Remove a specific review from localstorage
function deleteReview(reviewId) {
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews = reviews.filter(review => review.id !== reviewId);
    localStorage.setItem('reviews', JSON.stringify(reviews));
}

//Remove a specific playlist from localstorage
function deletePlaylist(playlistId) {
    let favPlaylists = JSON.parse(localStorage.getItem('favPlaylists')) || [];
    let favplaylistsFiltered = favPlaylists.filter(playlist => playlist.playlistId !== playlistId);
    localStorage.setItem('favPlaylists', JSON.stringify(favplaylistsFiltered));
}

function resetIcons() {
    document.querySelectorAll('.material-symbols-outlined').forEach((icon) => {
        icon.classList.remove('selected');
    });
}

function getSkipRateIcons(skipRate, maxSkipRate = 5) {
    let icons = '';
    for (let i = 1; i <= maxSkipRate; i++) {
        icons += `<span class=${i <= skipRate ? "'material-symbols-outlined selected'" : "'material-symbols-outlined'"}>skip_next</span>`;
    }
    return icons;
}

function getMoodIcons(mood) {
    const moodIcons = [
        'sentiment_very_dissatisfied',
        'sentiment_dissatisfied',
        'sentiment_calm',
        'sentiment_satisfied',
        'sentiment_very_satisfied'
    ];
    if (mood < 1 || mood > moodIcons.length) {
        mood = 3; //Default to no mood if out of range
    }
    let icons = '';
    for (let i = 0; i < moodIcons.length; i++) {
        icons += `<span class=${i == mood - 1 ? "'material-symbols-outlined selected'" : "'material-symbols-outlined'"}>${moodIcons[i]}</span>`;
    }
    return icons;
}

function getFrequencyIcons(frequency, maxFrequency = 5) {
    let icons = '';
    for (let i = 1; i <= maxFrequency; i++) {
        icons += `<span class=${i <= frequency ? "'material-symbols-outlined selected'" : "'material-symbols-outlined'"}>headphones</span>`;
    }
    return icons;
}

function getRatingIcons(rating, maxRating = 5) {
    let icons = '';
    for (let i = 1; i <= maxRating; i++) {
        icons += `<span class=${i <= rating ? "'material-symbols-outlined selected'" : "'material-symbols-outlined'"}>star_rate</span>`;
    }
    return icons;
}