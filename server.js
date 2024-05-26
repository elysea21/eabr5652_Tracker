const express = require('express');
const app = express();
app.use(express.static(__dirname + '/dist'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/dist/index.html')
   })
let server = app.listen(8888, function(){
    console.log("App server is running on port 8888");
   });
   
// This code sets up a basic web server using Express.js, a popular web framework for Node.js. Let's break it down:

// 1. **Require Express**: The code begins by importing the Express.js framework using the `require` function. This allows you to use Express's features in your code.

// 2. **Create an Express App**: An Express application is created by calling the top-level express function, which creates an Express application object named `app`.

// 3. **Serve Static Files**: The `app.use(express.static('public'))` line sets up Express to serve static files from the 'public' directory. This means that any files in the 'public' directory (such as HTML, CSS, JavaScript, images, etc.) can be accessed directly by clients without needing to explicitly define routes for them.

// 4. **Define Route for the Root URL ("/")**: The `app.get('/', ...)` function defines a route for the root URL ("/"). When a client sends an HTTP GET request to the root URL, Express will execute the callback function provided as the second argument. In this case, it sends the file 'index.html' located in the 'public' directory using the `res.sendFile()` method.

// 5. **Start the Server**: Finally, the `app.listen()` function is called to start the server. It binds the server to port 8888 and listens for incoming connections. When the server starts successfully, it logs a message to the console indicating that the server is running.

// Here's a breakdown of the code flow:

// - Express is initialized and configured.
// - Static files in the 'public' directory are served.
// - A route is defined for the root URL ('/') to serve the 'index.html' file.
// - The server starts listening on port 8888.

// This setup is commonly used for serving static web pages and assets in web applications.
   
   


