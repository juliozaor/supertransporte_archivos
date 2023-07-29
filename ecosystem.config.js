module.exports = {
  deploy : {
    production : {
      user : 'root',
      host : '157.230.190.144',
      ref  : 'origin/main',
      repo : 'https://github.com/jesidpolo04/backends_reportes_monteria.git',
      path : '/var/tesis/backend',
      'post-deploy': 'npm install && node ace build --production && cp .env build/.env && cd build && npm ci --production',
    }
  }
};
