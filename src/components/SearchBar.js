import React from 'react';
import { Button, Select, Input, Checkbox } from 'semantic-ui-react'

//initialize select input options menu
const options = [
    { key: 'all', text: 'All', value: 'all' },
    { key: 'movies', text: 'Movies', value: 'movies' },
    { key: 'tv', text: 'TV', value: 'tv' },
    { key: 'people', text: 'People', value: 'people' },
    { key: 'keyword', text: 'Keyword', value: 'keyword' }
  ]

class SearchBar extends React.Component {

    state = { 
            term: '', 
            value: 'movies', 
            error: false, 
            inclEveryKW: false 
        }

    onInputChange = (event) => {
        //term = whatever was inserted into the search input
        this.setState({term: event.target.value});
    };

    onTermSubmit = (event) => {
        
        event.preventDefault();

        if(this.state.term === '') {
            // make the input bar red if input bar is left empty and dont send a request to parent
            this.setState({error: true})
            return
        } else if (this.state.value === 'keyword') {
            //send keyword request to parent, if input field is not empty
            this.setState({error: false})
            //remove spaces around keyword commas
            
            let removeSpaceAroundCommas = this.state.term.replace(/\s*,\s*/g, ",")            
            let removeSpaceAroundString = removeSpaceAroundCommas.trim()

            //pushes the keywords into an array, separated by commas
            let keywords = removeSpaceAroundString.split(',')

            let removeEmptyKWArrays = keywords.filter(keyword => keyword.length > 1)

            //send an array of strings to parent 
            this.props.onTermSubmit(removeEmptyKWArrays);
        } else {
            //submit a request to parent (if input field is not empty)
            this.setState({error: false})
            this.props.onTermSubmit(this.state.term);
        }
        
    }

    //set current dropdown value for state
    setValue = (event, {value}) => {
        let val = {value}
        //because react setState is async, function dependant on the state value needs to be called as a callback
        this.setState({value: val.value}, function() {
            this.activeSearch()
        })
    }
    
    activeSearch = () => {
        //set the active search mode and send it to parent
        this.props.activeSearch(this.state.value)
    }

    reset = () => {
        //reset/clear field. Currently not in use
        this.setState({term: ''})
        //this.props.reset()
    }


    hideToggle = () => {
        // show toggle bar when keyword search is active
        return this.state.value === "keyword" ? "inline-block" : "none"
    }

    inclEveryKW = () => {
        //set inclEveryKW state value to the parent component, as a callback to setState
        this.setState({inclEveryKW: !this.state.inclEveryKW}, 
            function() {
                this.props.inclEveryKW(this.state.inclEveryKW)
            })
    }

    render() {
        return (
        <div className="search-bar ui segment">
            <form  className="ui form">
                <Checkbox 
                        style={{display: this.hideToggle()}} 
                        onClick={this.inclEveryKW}
                        toggle 
                        label="Include every keyword?" />
                <Input  className={`fluid ${this.state.error === true ? "error" : ""}`}
                        onSubmit={this.onTermSubmit} 
                        value={this.state.term} 
                        action
                        onChange={this.onInputChange}
                        type='text' 
                        placeholder={this.state.value === "keyword" ? "Enter comma separated list of keywords" : this.state.error === true ? "Please enter search term" : 'Search...'}>
                    <input/>
                    <Select onChange={this.setValue} compact options={options} value={this.state.value} />
                    <Button onClick={this.onTermSubmit} type='submit'>Search</Button>
                </Input>
            </form>
        </div>
        )
    }
}

export default SearchBar;
