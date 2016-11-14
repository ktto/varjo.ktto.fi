import Bluebird  from 'bluebird'
import R         from 'ramda'
import {resolve} from 'path'

import {normalize}        from '../src/js/util'
import {cache, bustCache} from './cache'

const fs          = Bluebird.promisifyAll(require('fs'))
const {execAsync} = Bluebird.promisifyAll(require('child_process'))

const DATA_DIR = resolve(`${__dirname}/../data`)


const getCourses = req => cache(
  req.path,
  () => fs.readFileAsync(`${DATA_DIR}/_courses.json`, 'utf8')
    .then(data => JSON.parse(data))
)

const getCourse = req => cache(
  req,
  () => fs.readFileAsync(`${DATA_DIR}/${req.params.course}.md`, 'utf8')
)

const getCourseHistory = req => cache(
  req.path,
  () => execAsync(`git log -- ${getFilename(req.params.course)}`)
    .then(R.pipe(
      R.split('\n'),
      R.filter(line => line.startsWith('commit') || line.startsWith('Date')),
      R.map(R.compose(R.join(' '), R.tail, R.split(/\s+/))),
      R.splitEvery(2),
      R.map(([commit, date]) => ({commit, date}))
    ))
)

const getCourseAt = req => cache(
  req.path,
  () => execAsync(`git show ${req.query.commit}:${getFilename(req.params.course)}`)
)

const commitAndPush = () => execAsync(
  'git commit -am "[update course data]" && git push'
)

export default {
  getCourses,
  getCourse,
  getCourseHistory,
  getCourseAt,
  commitAndPush
}

function getFilename (course) {
  return  `${DATA_DIR}/${normalize(course)}.md`
}

