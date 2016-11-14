import {createAction} from 'megablob'

const setFilter  = createAction()
const setEditing = createAction()
const setContent = createAction()

export {
  setFilter,
  setEditing,
  setContent
}
