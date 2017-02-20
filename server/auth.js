import {BasicStrategy} from 'passport-http'

export default (passport, config) => {
  passport.use(new BasicStrategy((username, password, done) => {
    if (username !== config.username || password !== config.password) {
      done(null, false)
    } else {
      done(null, true)
    }
  }))

  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((user, done) => done(null, user))

  return passport.authenticate('basic', {session: true})
}
