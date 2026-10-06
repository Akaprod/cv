// PM2 — gestionnaire de processus pour le VPS Hostinger
// Usage : pm2 start deploy/ecosystem.config.js && pm2 save
module.exports = {
  apps: [
    {
      name: 'novacv',
      script: '.next/standalone/server.js',
      cwd: __dirname + '/..',
      instances: 1, // SQLite : garder 1 instance (mono-processus)
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
      max_memory_restart: '512M',
      autorestart: true,
      // Les logs arrivent dans ~/.pm2/logs/
    },
  ],
}
