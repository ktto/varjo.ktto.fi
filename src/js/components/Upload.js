import React    from 'react'
import Dropzone from 'react-dropzone'

export default React.createClass({

  getInitialState () {
    return {
      files: []
    }
  },

  onDrop (files) {
    this.setState({files})
  },

  save () {
  },

  render () {
    return (
      <div>
        <Dropzone onDrop={this.onDrop} className="dropzone">
          <p>Klikkaa & lataa tai tiputa tähän kurssimateriaaleja.</p>
        </Dropzone>
        <div className="preview">
          {this.state.files.map(f => (
            <img src={f.preview}/>
          ))}
        </div>
        <button onClick={this.save}>Tallenna</button>
      </div>
    )
  }
})
