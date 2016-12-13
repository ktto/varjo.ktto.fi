import React from 'react'

export default ({loading, content}) => (
  <div>
    {loading
      ? (
        <div className="loading">
          <img src="/public/img/loading.gif"/>
        </div>
      ) : content()
    }
  </div>
)
