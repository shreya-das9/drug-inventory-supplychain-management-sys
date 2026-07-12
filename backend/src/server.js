import app, { initializeApp } from './app.js';

const BASE_PORT = Number(process.env.PORT || 5000);
const MAX_PORT_RETRIES = 10;

const startServer = (port, retryCount = 0) => {
  // Bind to all interfaces to avoid IPv4/IPv6 localhost resolution mismatches
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API running on http://0.0.0.0:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      if (retryCount >= MAX_PORT_RETRIES) {
        console.error(
          `❌ Could not start server: ports ${BASE_PORT}-${port} are already in use.`
        );
        process.exit(1);
      }

      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort, retryCount + 1);
      return;
    }

    console.error('❌ Server startup error:', error);
    process.exit(1);
  });
};

await initializeApp();
startServer(BASE_PORT);
