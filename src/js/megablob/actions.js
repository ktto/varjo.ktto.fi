import {createAction} from 'megablob'

const setFilter      = createAction()
const setContent     = createAction()
const addMaterial    = createAction()
const receiveCourses = createAction()
const setCourses     = createAction()

export {
  setFilter,
  setContent,
  addMaterial,
  receiveCourses,
  setCourses
}
