module.exports = {
  apps: [{
    name: 'tung-thien-backend',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      RATE_LIMIT_WINDOW_MS: 900000,
      RATE_LIMIT_GLOBAL_MAX_REQUESTS: 1000,
      RATE_LIMIT_AUTH_MAX_REQUESTS: 30,
      RATE_LIMIT_ADMIN_QUIZ_MAX_REQUESTS: 500,
      RATE_LIMIT_PUBLIC_QUIZ_MAX_REQUESTS: 500
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
