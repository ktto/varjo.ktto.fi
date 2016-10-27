import React from 'react'

export default React.createClass({
  render () {
    const {title} = this.props.course
    return <div>{title}</div>
  }
})
