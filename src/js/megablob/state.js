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
  const setMaterial = (courses, {path, material}) => L.set(
    materialIn(path, material),
    material,
    courses
  )
  const addCourse = (courses, newCourse) => courses.concat(newCourse)

  return Bacon.combineTemplate({
    filter: actions.setFilter.$.toProperty(initialState.filter),
    courses: Bacon.update(
      initialState.courses,
      [actions.setContent.$],     setContent,
      [actions.setMaterial.$],    setMaterial,
      [actions.receiveCourses.$], addCourse
    )
  })
}
