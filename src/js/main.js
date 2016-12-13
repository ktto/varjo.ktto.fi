import './polyfills'
import './analytics'
import React     from 'react'
import {render}  from 'react-dom'
import R         from 'ramda'
import {startApp} from 'megablob'

import appState from './megablob/state'
import App      from './components/App'

startApp(window.INITIAL_STATE, appState, state => {
  render(
    <App {...state} history={true}/>,
    document.getElementById('app')
  )
})
