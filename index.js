require('babel-register')

const PORT = process.env.PORT || 3333

require('./server')().listen(
  PORT,
  () => console.log(`Server running at localhost:${PORT}`)
)
