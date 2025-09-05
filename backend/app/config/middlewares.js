module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      headers: '*',
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:1337', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:1337']
    }
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // {
  //   name: 'global::image-optimization',
  //   config: {},
  // },
  // {
  //   name: 'global::upload-security',
  //   config: {},
  // },
];
