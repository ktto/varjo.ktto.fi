import {createAction} from 'megablob'

const setFilter      = createAction()
const setContent     = createAction()
const setMaterial    = createAction()
const receiveCourses = createAction()

export {
  setFilter,
  setContent,
  setMaterial,
  receiveCourses
}
