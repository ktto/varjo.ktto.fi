import Bluebird         from 'bluebird'
import R                from 'ramda'
import * as L           from 'partial.lenses'
import fetch            from 'node-fetch'
import React            from 'react'
import {renderToString} from 'react-dom/server'
import {resolve}        from 'path'

import App                                    from '../src/js/components/App'
import {cache, resetCache}                    from './cache'
import {contentIn, courseMatching, normalize} from '../src/js/util'

const fs          = Bluebird.promisifyAll(require('fs'))
const {execAsync} = Bluebird.promisifyAll(require('child_process'))

const DATA_DIR = resolve(__dirname, '..', 'data')

const getCourses = req => cache(req.user, req.path, () => {
  return fs.readdirAsync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(read)
    .map(JSON.parse)
})

const setCourses = req => resetCache(req.path, () => {
  const {course} = req.body
  const title    = normalize(course.title)
  return Bluebird.all([
    write(`${title}.json`, JSON.stringify(course, null, 2)),
    write(`${title}.md`, '')
  ]).then(() => {
    commitAndPush('Add %s', title)
    return course
  })
})

const getCourse = req => cache(req.user, req.path, () => {
  return read(`${req.params.course}.md`)
    .then(content => ({content}))
})

const setCourse = req => resetCache(req.path, () => {
  const name    = req.params.course
  const content = req.body.content
  return write(`${name}.md`, content)
    .then(() => {
      commitAndPush('Edit %s [len: %s]', name, content.length)
      return {content}
    })
})

const deleteCourse = req => resetCache(req.path, () => {
  const name = req.params.course
  return read(`${name}.json`)
    .then(JSON.parse)
    .then(({material}) => {
      const files = material
        .map(({filename}) => `${DATA_DIR}/files/${filename}`)
        .concat(['json', 'md'].map(ext => `${DATA_DIR}/${name}.${ext}`))
        .join(' ')
      if (R.any(potentiallyHarmful, files)) {
        return Promise.reject()
      }
      return execAsync(`rm ${files}`)
    }).then(() => {
      commitAndPush('Delete %s', name)
      resetCache('/api/courses')
      resetCache(`/api/${name}`)
      return getCourses({path: '/api/courses'})
    })
})

const setMaterial = req => {
  const name = req.params.course
  const file = `${name}.json`
  return read(file)
    .then(JSON.parse)
    .then(json => {
      const {material} = json
      const {filename} = req.file
      const {title}    = req.body
      const uploaded   = {title, filename}
      const data       = R.merge(json, {material: material.concat(uploaded)})
      return write(file, JSON.stringify(data, null, 2))
        .then(() => {
          commitAndPush('Add %s', filename)
          resetCache('/api/courses')
          resetCache(`/api/${name}`)
          return uploaded
        })
    })
}

const deleteMaterial = req => resetCache(req.path, () => {
  const {filename} = req.params
  if (potentiallyHarmful(filename)) {
    return Promise.reject()
  }
  const course = `${R.init(filename.split('-')).join('-')}.json`
  return read(course)
    .then(JSON.parse)
    .then(json => {
      const material = json.material.filter(m => m.filename !== filename)
      const data     = R.merge(json, {material})
      return write(course, JSON.stringify(data, null, 2))
        .then(() => execAsync(`rm ${DATA_DIR}/files/${filename}`))
        .then(() => {
          commitAndPush('Delete %s', filename)
          resetCache('/api/courses')
          resetCache(`/api/${course}`)
          return getCourses({path: '/api/courses'})
        })
    })
})

const getCourseHistory = req => cache(req.user, req.path, () => {
  if (potentiallyHarmful(req.params.course)) {
    return Promise.reject()
  }
  return execAsync(`git log -- data/${req.params.course}.md`)
    .then(R.pipe(
      R.split('\n'),
      R.filter(line => line.startsWith('commit') || line.startsWith('Date')),
      R.map(R.compose(R.join(' '), R.tail, R.split(/\s+/))),
      R.splitEvery(2),
      R.map(([commit, date]) => ({commit, date}))
    ))
})

const getCourseAt = req => cache(req.user, req.path, () => {
  if (R.any(potentiallyHarmful, [course, commit])) {
    return Promise.reject()
  }
  const {course, commit} = req.params
  return execAsync(`git show ${commit}:data/${course}.md`)
    .then(content => ({content}))
})

const commitAndPush = (template, ...vars) => {
  if (R.any(potentiallyHarmful, vars)) {
    return Promise.reject()
  }

  let msg = template
  vars.forEach(v => msg = msg.replace('%s', v))

  return process.env.NODE_ENV === 'production'
    ? execAsync(`git commit -am "${msg}" && git push backup master`)
        .catch(err => console.error(err))
    : console.log('Committing only in production', msg)
}

const renderHTML = req => cache(req.user, req.path, () => {
  return Bluebird.props({
    courses: getCourses({path: '/api/courses'}),
    content: req.path === '/' ? Bluebird.resolve({}) : fetchData(req)
  }).then(data => {
    const courses = L.set(contentIn(req.path), data.content.content, data.courses)
    const course  = L.get(courseMatching(req.path), data.courses)
    const state   = {courses, filter: '', admin: !!req.user, path: req.path, history: true}
    const html    = renderToString(<App {...state}/>)
    return renderApp(html, state, course || {})
  }).catch(() => {
    return getCourses({path: '/api/courses'})
      .then(courses => {
        const state   = {courses, filter: '', admin: !!req.user, path: '/404',  history: true}
        const html    = renderToString(<App {...state}/>)
        return renderApp(html, state, {})
      })
  })
})


export default {
  getCourses,
  setCourses,
  getCourse,
  setCourse,
  deleteCourse,
  setMaterial,
  deleteMaterial,
  getCourseHistory,
  getCourseAt,
  renderHTML
}

function read (path) {
  return fs.readFileAsync(`${DATA_DIR}/${path}`, 'utf8')
    .catch(err => `Error reading ${path}: ${err}`)
}

function write (path, content) {
  return fs.writeFileAsync(`${DATA_DIR}/${path}`, content, 'utf8')
    .catch(err => `Error writing ${path}: ${err}`)
}

function renderApp (appHTML, appState, course) {
  const title = `${course.title ? course.title + ' | ' : ''}KTTO:n varjo-opinto-opas`
  const desc  = `Kansantaloustieteen opiskelijat KTTO ry:n varjo-opinto-opas. Vanhoja tenttejä, laskareita ja kurssivinkkejä.${course.title ? ' ' + course.title + '.' : ''}`
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="KTTO taloustiede tilastotiede matematiikka Helsingin yliopisto valtiotieteellinen opinto-opas koe kokeita tentti tenttejä kurssi kurssivinkkejä" />
    <meta name="author" content="KTTO ry" />
    <meta name="copyright" content="KTTO ry" />
    <meta name="application-name" content="Varjo-opinto-opas" />
    <meta property="og:title" content="${title}" />
    <meta property="og:type" content="article" />
    <meta property="og:image" content="http://varjo.ktto.fi/public/img/ktto.jpg" />
    <meta property="og:url" content="http://varjo.ktto.fi${appState.path}" />
    <meta property="og:description" content="${desc}" />
    <meta name="twitter:card" content="KTTO" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="http://varjo.ktto.fi/public/img/ktto.jpg" />
    <link href='https://fonts.googleapis.com/css?family=Cambay:400,700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="/public/css/all.min.css">
    <title>KTTO | ${course.title ? course.title + ' | ' : ''}varjo-opinto-opas</title>
  </head>
  <body>
    <main id="app">${appHTML}</main>
    <script>window.INITIAL_STATE = ${JSON.stringify(appState)}</script>
    <script src="/public/js/all.min.js" async></script>
  </body>
</html>`
}

function fetchData (req) {
  return fetch(`${req.protocol}://${req.headers.host}/api${req.path}`)
    .then(res => res.json())
}

function potentiallyHarmful (str) {
  const s = decodeURIComponent(str)
  const shouldBeConcerned = /\s/.test(s)
    || s.indexOf(';') !== -1
    || s.indexOf('&') !== -1
    || s.indexOf('|') !== -1
    || s.indexOf('"') !== -1
    || s.indexOf('`') !== -1
    || s.indexOf("'") !== -1
    || s.indexOf('$') !== -1
  if (shouldBeConcerned) {
    console.error('Someone tried something nasty:', str, s)
    return true
  }
  return false
}
