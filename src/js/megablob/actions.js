import {createAction} from 'megablob'

const setFilter      = createAction()
const setContent     = createAction()
const receiveCourses = createAction()

export {
  setFilter,
  setContent,
  receiveCourses
}
