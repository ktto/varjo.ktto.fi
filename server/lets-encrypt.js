
export default config => require('letsencrypt-express').create({
  server: config.env === 'production' ? 'https://acme-v01.api.letsencrypt.org/directory' : 'staging',
  email: 'hallitus@ktto.fi',
  agreeTos: true,
  approveDomains: ['varjo.ktto.fi']
})
