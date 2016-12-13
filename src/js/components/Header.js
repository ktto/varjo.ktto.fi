import React from 'react'
import Bacon from 'baconjs'

import {setFilter} from '../megablob/actions'


export default React.createClass({

  getInitialState () {
    return {
      inputStream: new Bacon.Bus(),
      dirty: false
    }
  },

  componentDidMount () {
    const {inputStream} = this.state

    inputStream
      .map(value =>  !!value.length)
      .onValue(dirty => this.setState({dirty}))

    inputStream
      .onValue(setFilter)
  },

  render () {
    const {inputStream, dirty} = this.state
    const {showFilter}         = this.props
    
    return (
      <header className="header">
        <nav className="wrapper">
          <h2 className="header__title">
            <a href="/">KTTO</a>
          </h2>
          {showFilter && (
            <div className="header__filter">
              <input className={dirty ? 'dirty' : ''}
                     placeholder="Etsi kursseja"
                     onChange={e => inputStream.push(e.target.value)}/>
            </div>
          )}
        </nav>
      </header>
    )
  }
})

