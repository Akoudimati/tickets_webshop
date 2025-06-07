/**
 * Restart script - run this to cleanly restart the server
 */
const { exec } = require('child_process');
const { spawn } = require('child_process');

// Kill any existing Node.js processes (this is a forceful restart)
exec('taskkill /f /im node.exe', (error, stdout, stderr) => {
    if (error && !error.message.includes('not found')) {
        console.error('Error stopping processes:', error);
    }
    
    if (process.env.NODE_ENV === 'development') {
        console.log('No existing Node.js processes found or could not kill them all.');
    }
    
    // Start the server
    if (process.env.NODE_ENV === 'development') {
        console.log('Starting server...');
    }
    const server = spawn('node', ['index.js'], {
        stdio: 'inherit',
        shell: true
    });
    
    server.on('error', (error) => {
        console.error('Error starting server:', error);
    });
}); 