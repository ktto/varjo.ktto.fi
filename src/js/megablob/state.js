import Bacon  from 'baconjs'
import R      from 'ramda'
import * as L from 'partial.lenses'

import * as actions from './actions'
import {contentIn}  from '../util'

export default (initialState = {}) => (
  Bacon.combineTemplate({
    filter: actions.setFilter.$.toProperty(initialState.filter),
    courses: actions.setContent.$.scan(
        initialState.courses,
        (courses, {path, content}) => L.set(contentIn(path), content, courses)
      ).changes().merge(actions.receiveCourses.$).toProperty(initialState.courses)
  })
)
