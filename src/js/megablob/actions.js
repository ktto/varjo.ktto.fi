import {createAction} from 'megablob'

const setFilter      = createAction()
const setContent     = createAction()
const addMaterial    = createAction()
const receiveCourses = createAction()
const setCourses     = createAction()
const acceptCookies  = createAction()

export {
  setFilter,
  setContent,
  addMaterial,
  receiveCourses,
  setCourses,
  acceptCookies
}
