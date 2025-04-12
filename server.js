const express = require('express');
const app = express();
const port = 4000;

// Serve static files from the current directory
app.use(express.static('./'));

// Add error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server with error handling
const server = app.listen(port, '0.0.0.0', (err) => {
    if (err) {
        console.error('Error starting server:', err);
        return;
    }
    console.log(`Game running at http://localhost:${port}`);
    console.log('Server is listening on all network interfaces');
}); 