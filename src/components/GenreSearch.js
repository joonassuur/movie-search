import React, { Component } from 'react'
import genres from './Genre-id';
import { Dropdown } from 'semantic-ui-react'

class GenreSearch extends Component {
  state = {
    multiple: true,
    value: [],
    options: genres.genres
  }

  handleChange = (e, { value }) => {
      this.setState({ value }, 
        //send state value to parent as a callback
        () => this.props.selectGenres(this.state.value)
    )}
  
  render() {

    const { multiple, options, value } = this.state

    return (

          <Dropdown
            fluid
            selection
            multiple={multiple}
            options={options}
            value={value}
            placeholder='Search genres'
            onChange={this.handleChange}
          />

    )
  }

}

export default GenreSearch
