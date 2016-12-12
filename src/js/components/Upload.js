import React    from 'react'
import Dropzone from 'react-dropzone'

const cleanState = {file: null, title: ''}

export default React.createClass({

  getInitialState () {
    return cleanState
  },

  onDrop (files) {
    this.setState({file: files[0], title: files[0].name})
  },

  setTitle (e) {
    this.setState({title: e.target.value})
  },

  save () {
    const {file, title} = this.state
    const data = new FormData()
    data.append('file', file)
    data.append('title', title)
    this.setState(cleanState, () => this.props.upload(data))
  },

  cancel () {
    this.setState(cleanState)
  },

  render () {
    return (
      <div>
        {this.state.file ? (
          <div>
            <input onChange={this.setTitle}
                   placeholder="Otsikko"
                   defaultValue={this.state.file.name}/>
            <button onClick={this.cancel}>Peruuta</button>
            <button onClick={this.save}>Tallenna</button>
          </div>
        ) : (
          <Dropzone onDrop={this.onDrop} className="dropzone">
            <p>Klikkaa & lataa tai tiputa tähän kurssimateriaaleja.</p>
          </Dropzone>
        )}
      </div>
    )
  }
})
