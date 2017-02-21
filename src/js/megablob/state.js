import Bacon  from 'baconjs'
import R      from 'ramda'
import * as L from 'partial.lenses'

import * as actions            from './actions'
import {contentIn, materialIn} from '../util'

export default (initialState = {}) => {
  const setContent = (courses, {path, content}) =>  L.set(
    contentIn(path),
    content,
    courses
  )
  const addMaterial = (courses, {path, material}) => L.set(
    materialIn(path, material),
    material,
    courses
  )
  const addCourse  = (courses, newCourse) => courses.concat(newCourse)
  const setCourses = (_, courses) => courses

  return Bacon.combineTemplate({
    admin: initialState.admin,
    courses: Bacon.update(
      initialState.courses,
      [actions.setContent.$],     setContent,
      [actions.addMaterial.$],    addMaterial,
      [actions.receiveCourses.$], addCourse,
      [actions.setCourses.$],     setCourses
    ),
    filter: actions.setFilter.$.toProperty(initialState.filter),
    path: initialState.path,
  })
}
