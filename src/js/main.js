import React    from 'react'
import {render} from 'react-dom'

import App from './components/App'


function update (state) {
  render(
    <App {...state} history={true} onState={update}/>,
    document.getElementById('app')
  )
}

update(window.INITIAL_STATE)

