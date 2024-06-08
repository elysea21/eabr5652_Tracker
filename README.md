**Github Repository**
https://github.com/elysea21/eabr5652_Tracker

**Project Overview:**
It's designed to simplify the process of tracking and refining users' individual musical tastes. The app enables users to explore their musical preferences in depth by reviewing songs and recording specific data like tempo and key for their favourite tracks in a personalised library. By analysing this data, the app can recommend similar tracks, creating seamlessly curated playlists tailored to user-specific data.

When gathering feedback, the app prompts users to rate their enjoyment of a song. This gives each song an overall rating that influences its popularity and likelihood of being recommended to other users. Users can also revisit their past reviews to better understand which genres resonate most with them.

**Spotify API interface:**
This project leverages the SPotify API https://developer.spotify.com/documentation/web-api to provide the key data elements for albums, artists and track. This data is used by the application to help the user navigate and find music that suits their interests. This is done by providing the user with a review function to capture their interests and preferences. Finally linking these back to the Spotify API to get recommendations that match these interests and preferences. Ideally creating a much better next best song suggestion and flow from one track to the next.
Key API endpoints:
Get Several Browse Categories: 
    Documentation: https://developer.spotify.com/documentation/web-api/reference/get-categories
    Endpoint: https://api.spotify.com/v1/browse/categories
Get Recommendations: 
    Documentation: https://developer.spotify.com/documentation/web-api/reference/get-recommendations
    Endpoint: https://api.spotify.com/v1/recommendations
Search for Item:
    Documentation: https://developer.spotify.com/documentation/web-api/reference/search
    Endpoint: https://api.spotify.com/v1/search
Get Track's Audio Features:
    Documentation: https://developer.spotify.com/documentation/web-api/reference/get-audio-features
    Endpoint: https://api.spotify.com/v1/audio-features/{id}


Data Model:

    Sample data model for **Reviews**: 
        [{"id":"1d93b02b-cb86-49c0-bf19-05fcc021b071",
        "trackId":"4JehYebiI9JE8sR8MisGVb",
        "reviewerName":"Anonymous",
        "rating":3,
        "frequency":3,
        "mood":3,
        "skipRate":3,
        "reviewText":"testing again",
        "songTitle":"Halo",
        "songArtist":"Beyoncé",
        "songArtwork":"https://i.scdn.co/image/ab67616d0000b273801c4d205accdba0a468a10b",
        "reviewDate":"08/06/2024"}]

    Sample data model for **Playlists**:
        [{"playlistId":"e9d33a4c-4092-4bd5-bce3-d1b4fe685a2b",
        "playlistName":"Anonymous",
        "playlistArtistId":"7hJcb9fa4alzcOq3EaNPoG",
        "playlistArtistName":"Snoop Dogg",
        "playlistTrackId":"5Sm1X46tna50RstHZvw072",
        "playlistTrackName":"B**** Please",
        "playlistTrackArtwork":"https://i.scdn.co/image/ab67616d0000b2733d6eb4c042d7d78776d26fd2",
        "playlistGenre":"pop",
        "playlistDate":"08/06/2024",
        "playlistCollection":
            [{"album":{"album_type":"SINGLE",
            "artists":[{"external_urls":{"spotify":"https://open.spotify.com/artist/5CCwRZC6euC8Odo6y9X8jr"},
            "href":"https://api.spotify.com/v1/artists/5CCwRZC6euC8Odo6y9X8jr",
            "id":"5CCwRZC6euC8Odo6y9X8jr",
            "name":"Rita Ora",
            "type":"artist",
            "uri":"spotify:artist:5CCwRZC6euC8Odo6y9X8jr"}]}]

The data model for Reviews is a simple table structure. While the data model for playlists has a one to many relationship from the parent record which contains the primary artist and track that was used to create the playlist. With a collection of child records that contain the recommended songs that match with the parent. 


**Development Process:**

    HTML Layout: First started by setting up the HTML structure to understand the layout and pages needed for the application. This step was crucial for visualizing the overall structure and ensuring that all necessary elements were in place.
    Spotify API integration was the next crucial step. The APIController module was created to handle all communication with the API, including authentication (getting a token), fetching genres, tracks, recommendations, and search results.
    
    UI Development: The UIController module was built to manage the user interface elements. Functions were written to dynamically create genre options, song cards, and display track details. Event listeners were added to handle user interactions with the UI elements. Focus was placed on creating a responsive and visually appealing design using CSS and Material Design icons.
    
    Core Functionality: The APPController module was created to orchestrate the interaction between the UI and the API. Functions like loadGenres, loadRecommendations, and populateReviewTab were implemented to fetch and display data from the Spotify API. The ability to search for tracks and display autocomplete suggestions was added.

    Data Persistence with Local Storage: Functionality to save favorite playlists and user reviews locally was implemented using the browser's localStorage. This ensured that user data would persist even after closing the browser.

    Review System: The "Review" tab was developed to allow users to rate and review tracks. The UI was updated to display existing reviews and allow users to add new reviews. A rating system using emojis was incorporated.

    Playlist Creation: The ability to create favorite playlists based on a specific track was added. This involved fetching recommendations similar to the track and saving the playlist data to local storage.

    Deletion of reviews and playlists: Delete buttons were implemented to allow the deletion of playlists and reviews

    Lessons Learned and Best Practices
        Modular Code: Dividing the code into modules (APIController, UIController, APPController) enhanced organization and maintainability. Each module focused on a specific aspect of the application.
        Asynchronous Operations: The use of async/await made asynchronous operations with the Spotify API more manageable.
        Local Storage: Using localStorage effectively provided data persistence without relying on a server-side database.

**Challenges**

    JavaScript Implementation:
        Access API key: Had to develop a app in the spotify developer website and sign up to get credentials of my client ID and client secrect.
        API Integration: The biggest challenge was integrating the Spotify API. Although importing the API was straightforward, I encountered a major issue with a 429 error, which indicated that I was exceeding the API usage limit. To overcome this, I mocked up fake data for four songs to continue development without interruption. This approach allowed me to simulate API responses and maintain progress. 
        Genre Data Handling: Another challenge was handling genre data. Initially, I expected genre information to be readily available in the track data, but discovered that this data was not included. Instead, genres were only accessible through the Spotify categories endpoint. This required adjusting my approach to fetch and use genre data correctly.
        Creating functioning application: Used spotify developers documentation to help me create all the functions and storing data 
    
    CSS:
        After finally getting code to work, then fixed uop the style and design to fit in with web design standards and make it fit user centered design needs.

    User Interface Development:
        Song Cards: Creating song cards for displaying track data was relatively straightforward. However, storing data from user interactions (e.g., clicking emojis for ratings) was complex. Utilised ChatGPT to troubleshoot issues and understand the correct approach for tracking and storing user interactions.

    Error Handling and Debugging:
        Stored Playlists: Encountered an issue where each time a playlist was reviewed, additional delete buttons were appended, disrupting the page layout. 

**Iterations and Improvements:**

    Wireframe Adjustments:
        Navigation Bar: Initially, the navigation bar was placed at the top. However, found that a sidebar layout was more common and user-friendly for music websites and apps. This change improved navigation and usability.
        Simplification: To streamline the user experience, removed the loading page and an explanation page. These elements were unnecessary for this application.
    Consistent Design:
        Song Review Page: The layout for the song review page remained consistent with the initial wireframes, as it provided a simplistic and modern design that I liked.
        Reviewed Songs and Playlists: Revised the layout to ensure consistency across different screen sizes, enhancing the overall user experience. The playlists were also changed from a list format to song cards for a more cohesive design.
    Responsive Design:
        Responsive Layout: Ensuring the layout was responsive across different screen sizes was crucial. Adjusted the design to maintain consistency and usability on various devices, providing a seamless experience for users.
    Lessons Learned and Best Practices:
        Mock Data Usage: Using mock data was essential for continued development when encountering API rate limits. This approach allowed me to test and refine the application's functionality without being hindered by external limitations.
        Error Handling: Proactively handling errors, such as the 429 rate limit error, and implementing fallback solutions, like mock data, is crucial for maintaining development progress.

**Configuration and Deployment Procedures:**
    
    Application Setup:
        Clone Repository:Clone the project repository from GitHub using the following command: git clone <repository-url>
        Install Dependencies:
            Navigate to the project directory and run: npm install. This command will install all necessary dependencies listed in the package.json file.
    
    Deployment:
        Build Application:
            Create a production build of the application by running: npm run build
            Deploy to Server: Deploy the production build to your preferred hosting service. Follow the specific deployment instructions provided by the hosting service.

    Future Development:
        Recommendations for Improvements:
            Enhanced User Personalization: Implement more advanced algorithms for personalised recommendations based on user reviews and interactions. This could include machine learning techniques to analyze user preferences.
            Social Features: Add social features that allow users to share playlists and reviews with friends. This can enhance user engagement and provide a more interactive experience.

        Detailed Script Analysis:
        Here’s a breakdown of the key functions in your script.js to further assist future developers:
        APIController:
            Handles API token retrieval, genre fetching, track searching, and recommendations fetching.
            Key methods include:
            _getToken: Retrieves the API token.
            _getGenres: Fetches available genres from Spotify.
            _getRecommendations: Fetches track recommendations based on genres.
            _searchTracks: Searches for tracks based on a query.
            _getAudioFeaturesForTrack: Retrieves audio features for a specific track.
            
        UIController:
            Manages DOM elements and UI interactions.
            Key methods include:
            createGenreOption: Creates options for genre selection.
            createRecommendationsDetail: Displays recommended tracks.
            resetRecommendations: Clears previous recommendations.
            storeToken: Stores the API token in the DOM.
            getStoredToken: Retrieves the stored API token.
            
        APPController:
            Orchestrates the application logic by integrating APIController and UIController.
            Key methods include:
            loadGenres: Loads and displays available genres.
            loadRecommendations: Loads and displays track recommendations based on selected genres.
            loadInitialRecommendations: Loads and displays initial track recommendations.
            addEventListenersToSongCards: Adds event listeners to song cards for user interaction.
            populateReviewTab: Populates the review tab with track details and user feedback options.
            showReviewTab: Displays the review tab for user interaction.


    Privacy and Security:
        I chose to put my ClientID and Client secret in a separate javascript file for my privacy and keep my API access keys safe.

    Declaration of usage of AI:
        I used ChatGBT to help me understand and diagnose errors in my code. 
