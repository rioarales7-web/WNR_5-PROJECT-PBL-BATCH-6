module.exports = {
  apps: [
    {
      name: 'agro-maritim',
      script: 'server/server.js',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '400M',
    },
  ],
};
