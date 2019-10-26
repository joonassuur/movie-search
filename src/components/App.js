import React from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import Results from './Results';
import Tabs from './Tabs';
import genres from './Genre-id';
import { Icon, Loader, Dropdown } from 'semantic-ui-react'
import image from '../images/no-image.png';
import '../style.css'

const KEY = "6df1763739d4dda8cf71c3daca202b2e";
let resultCount = 0;


class App extends React.Component {

    state = { 
            movies: [], 
            keywords: '', 
            inclEveryKW: false, 
            error: false,
            loaded: false,
            term: '',

            //activeSearch: the dropdown left to "search" button
            activeSearch: 'keyword', 

            //sortState = sort by
            sortState: 'vote_average.desc',

            //currently active tab
            activeTab: 'discMovies',
        }

        
    //term = whatever was inserted into the search input
    onTermSubmitHandler = async (term) => {

        resultCount = 0
        this.setState({loaded: false})
        this.setState({error: false})
        this.setState({term: term})
        this.setState({movies: []})
        

        // define paths for different GET requests
        const discoverMovie = 'https://api.themoviedb.org/3/discover/movie'
        const discoverTV = 'https://api.themoviedb.org/3/discover/tv'
        const posterPath = 'https://image.tmdb.org/t/p/w200'
        const searchAll = 'https://api.themoviedb.org/3/search/multi'
        const searchMovie = 'https://api.themoviedb.org/3/search/movie'
        const movieID = 'https://api.themoviedb.org/3/movie/'

        const searchKeyword = 'https://api.themoviedb.org/3/search/keyword'

        const searchTV = 'https://api.themoviedb.org/3/search/tv'
        const searchPerson = 'https://api.themoviedb.org/3/search/person'


        //this function gets called as part of a GET request, to see where (URL) the request needs to be made depending on the active mode
        const getURL = () => {

            if (this.state.activeTab === "discMovies") {

                switch (this.state.activeSearch) {
                    
                    case 'keyword':
                        return discoverMovie;
    
                    default:
                        return discoverMovie;
                }
            }

            if (this.state.activeTab === "discTV") {

                switch (this.state.activeSearch) {
                    
                    case 'keyword':
                        return discoverTV;
    
                    default:
                        return discoverTV;
                }
            }

            if (this.state.activeTab === "general") {

                switch (this.state.activeSearch) {
                    
                    case 'people':
                        return searchPerson;

                    case 'movies':
                        return searchMovie;

                    case 'tv':
                        return searchTV;

                    case 'all':
                        return searchAll;

                    case 'keyword':
                        return searchKeyword;

                    default:
                        return searchMovie;
                }
            }

            else {

                //if invalid search term (that has no results) is entered, check if state.error was set to true. if it was, then display error
                if (this.state.error) {
                    this.setState({loaded: true})
                    this.generateList()
                    return
                }

            }
        }

        // keyword search, can search many requests in parallel
        if (this.state.activeSearch === "keyword" && term !== undefined) {

            let keywordID = [];
            let promises = [];

            this.pushPromiseToArr = async () => {

                keywordID = [];
                promises = [];

                //do a get request on every keyword (term), then push each request into promises array
                term.forEach((item) => {

                    promises.push(
                        axios.get(searchKeyword, {
                            params: {
                                query: item,
                                api_key: KEY
                            }
                        }))
                })
            }

            this.checkIfKeywordsExist = async () => {

                await this.pushPromiseToArr();
                // await until all promises have been added to the array
                let x = await Promise.all(promises)
                //wait until x is finished and then check to see if every result > 0
                let promiseLen = [];
                x.forEach((m) => promiseLen.push(m.data.results.length))
                //check if every element in promiseLen > 0. To see if every keyword exists
                function isAboveThreshold(promLen) {
                    return promLen > 0;
                }
                //clear state keyword object before new query
                this.setState({keywords: ''})

                // if all keywords exist, then resolve requests and push keywords into keywordID array
                if (promiseLen.every(isAboveThreshold)) {
                    x.map((response) => {

                        if(response.data.results.length > 0) {
                            for (let t = 0; t < term.length; t++) {
    
                                response.data.results.map((i) => {
        
                                    if (term[t] === i.name && !keywordID.includes(i.id.toString())) {
                                        keywordID.push(i.id.toString())
                                    }
        
                                })
        
                            }
                        } 
                    }) 
                // if at least 1 keyword does not exist, return 
                } else {
                    this.setState({error: true})
                    this.setState({loaded: true})
                }
               
            }

            this.joinKeywords = async () => {

                await this.checkIfKeywordsExist();
                

                if (this.state.inclEveryKW) {
                    this.setState({
                        //join the keywords in keywordID array together for the API call
                        keywords: keywordID.join()
                    })
                } else {
                    this.setState({
                        //join the keywords in keywordID array together for the API call. Replace comma with | as an OR statement instead of AND
                        keywords: keywordID.join().replace(/,/g, "|")
                    })
                }

            }

            this.makeRequest = async () => {

                await this.joinKeywords()

                if (this.state.keywords !== '') {
                    this.setState({error: false})
                    this.singleRequest()
                // set the state error true if keywords are not set and render error message
                } else {
                    this.setState({error: true})
                    this.generateList()
                }
                
            }
            //call every async function in order and each one waits until previous is finished
            this.pushPromiseToArr()
            this.checkIfKeywordsExist()
            this.joinKeywords()
            this.makeRequest()

        } else {

        //unless specifically called, this function runs when keyword search is not performed
        this.singleRequest = () => {

            axios.get(
                getURL(), {
                params: {
                    // with genres takes an ID integer, not a string
                    // with_genres: term,
                    // query searches for title/name
                    query: term,
                    api_key: KEY,
                    poster_path: posterPath,
                    "vote_count.gte": this.state.activeTab === "discMovies" || this.state.activeTab === "discTV" ? 90 : undefined,
                    sort_by: this.state.activeTab === "discMovies" || this.state.activeTab === "discTV"  ?this.state.sortState : undefined,
                    with_keywords: this.state.keywords ? this.state.keywords : undefined
                }
            })
                .then((response) => {

                    //if no results, display "nothing found"
                    if (response.data.total_results < 1) {
                        this.setState({error: true})
                    }

                    this.setState({
                        movies: response.data.results.map((item) => {
                            return {
                                id: item.id,
                                title: item.title ? item.title : item.name,
                                // name: item.name,
                                release_date: item.release_date ? item.release_date : item.first_air_date,
                                image: item.poster_path ? posterPath + item.poster_path :
                                    item.profile_path ? posterPath + item.profile_path : image,
                                linkPath: item.title ? "movie/" : item.known_for ? "person/" : "tv/",
                                overview: item.overview,
                                //map returned genre array to appropriate item ID and return a span element
                                genres: this.genres(item.genre_ids).map((g, i) => {
                                    return (
                                        <span key={i}> {g} </span>
                                    )
                                }),
                                rating: item.vote_average > 0 ? item.vote_average :
                                        item.vote_average === 0 ? "NR" : ''
                            }
                        })
                    })
                    //generate the components based on received values
                    this.generateList()
                                        
                })
            }

            //if keyword search is not active, call "singleRequest" function by default
            this.singleRequest()
        }
    }


    componentDidMount() {
        //run "discover" search by default when page loads, with default parameters
       this.onTermSubmitHandler();
    }



    doneLoading = () => {
        //display spinner while movies are loading
        resultCount++

        if (resultCount === this.state.movies.length) {

            this.setState({loaded:true})
            
        }
    }

    parseReleaseDate = (item) => {
        //modify the release date received from the API to reflect only year
        return item.release_date ? <span> {"(" + item.release_date.slice(0, 4) + ")"} </span> : null
    }



    genres = (item) => {
        //map every Genre ID against GENRES object and return the names of matched ID's in an array
        const arr = [];

        //checks if genre value exists, otherwise return empty array
        if (item) {

            for (let l = 0; l < item.length; l++) {

                //match every received genre ID from server against values in GENRES object
                for (let i = 0; i < genres.genres.length; i++) {
                    item.forEach(e => {
                        //if received value matches the ID in GENRES object, push corresponding genre, with corresponding name (received from GENRES object) to arr
                        if (e === genres.genres[i].id && !arr.includes(genres.genres[i].name)) {
                            arr.push(genres.genres[i].name)
                        }

                    });

                }
            }
        }
        //pass the array with values back to state
        return arr
    }

    rating = (item) => {
        //modify the rating display, show "NR" when item is not rated
        if (item && item !== "NR") {
            return item + "/10"
        } else if (item === "NR") {
            return "NR"
        }

    }

    handleReset = () => {
        //NOT IN USE right now, supposed to clear the list
        
        this.setState({ term: ''})
        this.setState({ keywords: ''})
        this.setState({ movies: [] }, function() {this.onTermSubmitHandler()})
        
    }

    activeSearchHandler = (i) => {
        //tells the state which search mode is currently active (movies, TV, keyword, etc)
        this.setState({ activeSearch: i })
    }


    generateList = () => {

        //generate the list resulting from the API call, or generate an error

        if (this.state.error) {
            
            return <div>nothing found</div>

        } else {

            return (
                
                this.state.movies.map(item => (
    
                    <div className="item" key={item.id} >
                        <div className="ui small image">
                            <a className="header" target="_blank" rel="noopener noreferrer" href={"https://www.themoviedb.org/" + item.linkPath + item.id}>
                                <img onLoad={this.doneLoading} key={item.id} src={item.image} alt="" />
                            </a>
                        </div>
                        <div className="content">
                            <a className="header" target="_blank" rel="noopener noreferrer" href={"https://www.themoviedb.org/" + item.linkPath + item.id}>
                                {item.title} {this.parseReleaseDate(item)}
                            </a>
                            <div className="meta"> <Icon name='star' /> {this.rating(item.rating)} </div>
    
                            <div className="description">
                                {item.overview}
                            </div>
                            <div className="extra" key={item.id} > {item.genres} </div>
                        </div>
                    </div>
    
                )
            ))
        }
    }

    //set current dropdown value for state
    setValue = (event, {value}) => {
        //because react setState is async, function dependant on the state value needs to be called as a callback
        let val = {value}.value
        
        this.setState({sortState: val}, function() {
            this.onTermSubmitHandler();
        })
       
    }


    handleTabChange = (event) => {

        this.setState({activeTab: event}, function(){
            if (event === "general") {
                return
            }
            // would call the tab immediately after click
            //  this.onTermSubmitHandler() 
        })
    }

    render() {

        const sortOptions = [
            {
                key: 'rating',
                text: 'Rating',
                value: 'vote_average.desc'
            },
            {
                key: 'popularity',
                text: 'Popularity',
                value: 'popularity.desc'
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
            <div className="ui container" >


                <SearchBar
                    activeTab={this.handleTabChange}
                    onTermSubmit={this.onTermSubmitHandler} 
                    activeSearch={this.activeSearchHandler} 
                    reset={this.handleReset} 
                    //function received from child component regarding toggle KW switch. Returns true/false
                    inclEveryKW={(i) => {
                        this.setState({inclEveryKW: i})
                    }} >

                    <div style={{display: this.state.activeTab === "general" ? "none" : "block", textAlign:"right"}} className="dropdown-cont">
                        <span style={{marginRight: "5px"}}>Sort by</span>
                        <Dropdown
                            inline
                            options={sortOptions}
                            onChange={this.setValue}
                            value={this.state.sortState}
                        />
                    </div>
                    
                </SearchBar>
                

                <Loader size='large' 
                    style={{display: this.state.loaded  ? "none" : 
                                     this.state.error ? "none" : 
                                     "block" }} 
                    active 
                    inline='centered' 
                />

                <Results 
                    displayOnLoad={{display: this.state.loaded ? "block" : 
                                             this.state.error ? "block" : 
                                             "none" }}>
                    {/* generates the results list */}
                    {this.generateList()}
                </Results>

            </div>
        )
    }
}

export default App;
