import Bacon from 'baconjs'

import * as actions from './actions'

export default (initialState = {}) => (
  Bacon.combineTemplate({
    filter: actions.setFilter.$.toProperty(''),
    courses: initialState.courses
  })
)
