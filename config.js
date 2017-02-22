module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3333,
  username: process.env.USERNAME || 'user',
  password: process.env.PASSWORD || 'pass',
  secret: process.env.SECRET || 'secret'
}
