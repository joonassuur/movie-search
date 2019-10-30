import React from 'react';
import Tabs from './Tabs';
import GenreSearch from './GenreSearch';
import KeywordSearch from './KeywordSearch';
import { Button, Select, Input, Grid } from 'semantic-ui-react'

//initialize select input options menu

  const genOptions = [
    { key: 'movies', text: 'Movies', value: 'movies' },
    { key: 'tv', text: 'TV', value: 'tv' },
    { key: 'people', text: 'People', value: 'people' },
    { key: 'all', text: 'All', value: 'all' }
  ]

class SearchBar extends React.Component {

    state = { 
            term: '', 
            value: 'movies', 
            selectedGenres: [],
            selectedKeywords: [],
            error: false, 
            activeTab: 'discMovies'
        }

    onInputChange = (event) => {
        //term = whatever was inserted into the search input, under "general" tab
        this.setState({term: event.target.value});
    };

    onTermSubmit = (event) => {
        
        event.preventDefault();
        this.setState({error: false})

        if(this.state.activeTab === 'general' && this.state.term === '') {
            // make the input bar red if input bar is left empty and dont send a request to parent
            this.setState({error: true})
            return 
        }
        

        //send KW/genre arrays to parent 
        if (this.state.activeTab !== 'general') {
            this.props.onTermSubmit('', this.state.selectedGenres, this.state.selectedKeywords);
        } else {
        //submit a search term to parent
            this.props.onTermSubmit(this.state.term);
        }
        
    }

    //set current dropdown value for state
    setValue = (event, {value}) => {
        let val = {value}

        //because react setState is async, function dependant on the state value needs to be called as a callback
        this.setState({value: val.value}, () => {
             //set the active search mode and send it to parent
            this.props.activeSearch(this.state.value)
        })
    }
    



    //handle the tab click events, and corresponding function calls
    tabHandler = (e) => {
        let children = e.target.parentElement.children

        for (let i = 0; i < children.length; i++) {
            children[i].className = "item"
        }

        e.target.className = "item active";

        this.setState({activeTab: e.target.getAttribute("value")}, ()=>{
            
            this.props.activeTab(this.state.activeTab)
        })

    }


    render() {
        
        return (
        <>
            <Tabs tabHandler={this.tabHandler} />
            
            <div className="search-bar ui segment">
                <form  className="ui form">
                    
                    {/* container for genre and keyword search */}
                    <Grid style={{display: this.state.activeTab === 'general' ? 'none' : 'block'}}>

                        <Grid.Column width={8}>
                            <GenreSearch 
                                
                                selectGenres={(e) => {
                                    this.setState({selectedGenres: e})
                                }}
                            />
                        </Grid.Column>

                        <Grid.Column width={8}>
                            <KeywordSearch 
                                    selectedKeywords={(e) => {
                                        this.setState({selectedKeywords: e})
                                    }} 
                                />
                        </Grid.Column>

                    </Grid>

                    <Input  className={`fluid ${this.state.error === true ? "error" : ""}`}
                            style={{display: this.state.activeTab === 'general' ? 'flex' : 'none'}}
                            onSubmit={this.onTermSubmit} 
                            value={this.state.term} 
                            action
                            onChange={this.onInputChange}
                            type='text' 
                            placeholder={this.state.value === "keyword" ? "Enter comma separated list of keywords" : this.state.error === true ? "Please enter search term" : 'Search...'}>
                        <input/>
                        <Select onChange={this.setValue} 
                                value={this.state.value}
                                compact options={genOptions}  
                        />
                        <Button onClick={this.onTermSubmit} type='submit'>Search</Button>
                    </Input>

                </form>

                <Button content='Search' 
                        className="search-button"
                        onClick={this.onTermSubmit} 
                        style={{display: this.state.activeTab === "general" ? "none" : "inline-block"}} 
                />
                
                {/* "sort by" component */}
                {this.props.children}
            </div>
        </>
        )
    }
}

export default SearchBar;
