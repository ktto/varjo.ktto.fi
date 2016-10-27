import Bluebird  from 'bluebird'
import R         from 'ramda'
import {resolve} from 'path'

import {normalize} from '../src/js/util'

const fs          = Bluebird.promisifyAll(require('fs'))
const {execAsync} = Bluebird.promisifyAll(require('child_process'))

const DATA_DIR = resolve(`${__dirname}/../data`)


const getCourses = () => (
  fs.readFileAsync(`${DATA_DIR}/_courses.json`)
    .then(data => JSON.parse(data))
)

const commitAndPush = () => execAsync(
  'git commit -am "[update course data]" && git push'
)

const getCourseHistory = course => (
  execAsync(`git log -- ${getFilename(course)}`)
    .then(R.pipe(
      R.split('\n'),
      R.filter(line => line.startsWith('commit') || line.startsWith('Date')),
      R.map(R.compose(R.join(' '), R.tail, R.split(/\s+/))),
      R.splitEvery(2),
      R.map(([commit, date]) => ({commit, date}))
    ))
)

const getCourseAt = (course, commit) => (
  execAsync(`git show ${commit}:${getFilename(course)}`)
)

export default {
  getCourses,
  getCourseHistory,
  getCourseAt,
  commitAndPush
}

function getFilename (course) {
  return  `${DATA_DIR}/${normalize(course)}.md`
}

