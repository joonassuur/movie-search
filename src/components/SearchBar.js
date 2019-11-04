import React from 'react';
import Tabs from './Tabs';
import GenreSearch from './GenreSearch';
import KeywordSearch from './KeywordSearch';
import PersonSearch from './PersonSearch';
import YearSearch from './YearSearch';
import { Button, Select, Input, Grid, Dropdown } from 'semantic-ui-react'

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
            selectedPersons: [],
            selectedYear : '',
            error: false, 
            activeTab: 'discMovies',

            //sortState = Sort by
            sortState: 'popularity.desc',
        }

    onInputChange = (event) => {
        //term = whatever was inserted into the search input, under "general" tab
        this.setState({term: event.target.value});
    };

    onTermSubmit = (event) => {

        if(event)
        event.preventDefault();

        this.setState({error: false})
        
        if(this.state.activeTab === 'general' && this.state.term === '') {
            // make the input bar red if input bar is left empty and dont send a request to parent
            this.props.searchHandler('', this.state.activeTab);
            this.setState({error: true})
            return 
        }

        if (this.state.activeTab === 'general') {
            //submit a search term to parent
            this.props.searchHandler(this.state.term, this.state.activeTab);   
            return
        }

        //send search info to parent
        this.props.searchHandler(
            '', 
            this.state.activeTab,
            this.state.selectedGenres.join().replace(/,/g, ","), 
            this.state.selectedKeywords.join(), 
            this.state.selectedPersons.join(),
            this.state.selectedYear
        );
         

    }


    //handle the tab click events, and corresponding function calls
    tabHandler = (e) => {

        //  const {activeTab, SelectedGenres, selectedKeywords} = this.state;
  
          let children = e.target.parentElement.children
  
          for (let i = 0; i < children.length; i++) {
              children[i].className = "item"
          }
  
          e.target.className = "item active";
  
          this.setState({activeTab: e.target.getAttribute("value")}, ()=>{
                if (this.state.activeTab === "general")
                    return;
                    
                this.onTermSubmit()          
          })
  
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


        //set current dropdown value for state
        setSortValue = (event, {value}) => {
            let val = {value}.value
            
            this.setState({sortState: val}, ()=> {
                this.props.sortHandler(this.state.sortState);
            })
        }

    render() {
        
        const sortOptions = [
            {
                key: 'popularity',
                text: 'Popularity',
                value: 'popularity.desc'
            },
            {
                key: 'rating',
                text: 'Rating',
                value: 'vote_average.desc'
            },
            {
                key: 'date_des',
                text: 'Date (des)',
                value: 'release_date.desc' || 'first_air_date.desc'
            },
            {
                key: 'date_asc',
                text: 'Date (asc)',
                value: 'release_date.asc' || 'first_air_date.asc'
            }

          ]

        return (
        <>
            
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
                            <PersonSearch 
                                isDisabled={this.state.activeTab !== 'discMovies' ? 'disabled' : ''}
                                selectedPersons={(e) => {
                                    this.setState({selectedPersons: e})
                                }} 
                            />
                        </Grid.Column>

                        <Grid.Column width={8}>
                            <KeywordSearch 
                                selectedKeywords={(e) => {
                                    this.setState({selectedKeywords: e})
                                }} 
                            />
                            <YearSearch
                                selectedYear={(e) => {
                                    this.setState({selectedYear: Number(e)})
                                }} 
                                
                            />
                        </Grid.Column>

                    </Grid>


                    <Input  className={`fluid ${this.state.error ? "error" : ""}`}
                            style={{display: this.state.activeTab === 'general' ? 'flex' : 'none'}}
                            onSubmit={this.onTermSubmit} 
                            value={this.state.term} 
                            action
                            onChange={this.onInputChange}
                            type='text' 
                            placeholder={this.state.value === "keyword" ? "Enter comma separated list of keywords" : this.state.error ? "Please enter search term" : 'Search...'}>
                        <input/>
                        <Select onChange={this.setValue} 
                                value={this.state.value}
                                compact options={genOptions}  
                        />
                        {/* button for General tab */}
                        <Button onClick={this.onTermSubmit} type='submit'>Search</Button>
                    </Input>

                </form>

                {/* button for Movies and TV tabs */}
                <Button content='Search' 
                        className="search-button"
                        onClick={this.onTermSubmit} 
                        style={{display: this.state.activeTab === "general" ? "none" : "inline-block"}} 
                />
                {/* "sort by" component */}
                <div 
                    style={{display: this.state.activeTab === "general" ? "none" : "block", textAlign:"right"}} 
                    className="dropdown-cont">
                    <span style={{marginRight: "5px"}}>Sort by</span>
                    <Dropdown
                        inline
                        options={sortOptions}
                        onChange={this.setSortValue}
                        value={this.state.sortState}
                    />
                </div>
                {/* "sort by" component */}
                {this.props.children}
            </div>
            <Tabs tabHandler={this.tabHandler} />
        </>
        )
    }
}

export default SearchBar;
