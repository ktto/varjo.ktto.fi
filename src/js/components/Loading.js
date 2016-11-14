import React from 'react'

export default ({loading, content}) => (
  <div>
    {loading
      ? <img src="/public/img/loading.gif"/>
      : content()
    }
  </div>
)
