import React from 'react';
import axios from 'axios';
import genres from './Genre-id';

import SearchBar from './SearchBar';
import Results from './Results';

import { Icon, Loader, Dropdown } from 'semantic-ui-react'

import image from '../images/no-image.png';
import '../style.css'

const KEY = "6df1763739d4dda8cf71c3daca202b2e";
let resultCount = 0;

class App extends React.Component {

    state = { 
            movies: [], 

            term: '',
            genres: '',
            keywords: '', 
            
            error: false,
            responseError: false,
            loaded: false,

            posterPath:'https://image.tmdb.org/t/p/w200',
            activeURL:'https://api.themoviedb.org/3/discover/movie',

            voteCount: 100,

            //activeSearch: the dropdown left to "search" button, under "General tab"
            activeSearch: 'movies', 

            //sortState = Sort by
            sortState: 'vote_average.desc',

            //currently active tab (Movies/TV/General)
            activeTab: 'discMovies',
        }

        
    //term = whatever was inserted into the search input, under "General"
    onTermSubmitHandler = async (term, genres, keywords) => {

        if (genres) {
            this.setState({ genres: genres.join().replace(/,/g, ",") })
        }

        if (keywords) {
            this.setState({ keywords: keywords.join() })
        }


/* 
         if (genres.length > 0 || keywords.length > 0 || term.length > 0) {
            this.setState({voteCount: 25})
        } else {
            this.setState({voteCount: 90})
        }  */
        
        resultCount = 0

        this.setState({error: false})
        this.setState({responseError: false})
        this.setState({term: term})
        this.setState({movies: []})
        this.state.term === '' ? this.setState({loaded: true}) : this.setState({loaded:false})


        // define paths for different GET requests
        const discoverMovie = 'https://api.themoviedb.org/3/discover/movie'
        const discoverTV = 'https://api.themoviedb.org/3/discover/tv'
        const searchAll = 'https://api.themoviedb.org/3/search/multi'
        const searchMovie = 'https://api.themoviedb.org/3/search/movie'
     //   const movieID = 'https://api.themoviedb.org/3/movie/'

        const searchTV = 'https://api.themoviedb.org/3/search/tv'
        const searchPerson = 'https://api.themoviedb.org/3/search/person'


        //if invalid search term (that has no results) is entered, check if state.error was set to true. if it was, then display error

        this.assignURL = async () => {
            if (this.state.error) {
                this.setState({loaded: true})
                this.generateList()
                return;

            } else {

                if (this.state.activeTab === "discMovies") {
                        this.setState({activeURL: discoverMovie}) 
                }

                if (this.state.activeTab === "discTV") {
                        this.setState({activeURL: discoverTV}) 
                }

                if (this.state.activeTab === "general") {

                    switch (this.state.activeSearch) {
                        
                        case 'people':
                            this.setState({activeURL: searchPerson}) 
                            break;

                        case 'movies':
                            this.setState({activeURL: searchMovie}) 
                            break;

                        case 'tv':
                            this.setState({activeURL: searchTV}) 
                            break;

                        default:
                            this.setState({activeURL: searchAll}) 
                            break;
                    }
                }

            }

        }

        await this.assignURL()

        this.singleRequest()
    }


    singleRequest = () => {

        axios.get(
            this.state.activeURL, {
            params: {
                // with genres takes an ID integer, not a string
                // query searches for title/name
                with_genres: this.state.genres ? this.state.genres : undefined,
                query: this.state.term ? this.state.term : undefined,
                api_key: KEY,
                poster_path: this.state.posterPath,
                "vote_count.gte": this.state.voteCount,
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
                            image: item.poster_path ? this.state.posterPath + item.poster_path :
                                item.profile_path ? this.state.posterPath + item.profile_path : image,
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
                                    
            }).catch(()=> this.setState({responseError: true, loaded: true}) )
        }


    componentDidMount() {
        //run "discover" search by default when page loads, with default parameters
        this.singleRequest()
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

                        if (e === genres.genres[i].value && !arr.includes(genres.genres[i].text)) {
                            arr.push(genres.genres[i].text)
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



    activeSearchHandler = (i) => {
        //tells the state which search mode is currently active (movies, TV, keyword, etc)
        this.setState({ activeSearch: i })
    }


    generateList = () => {

        //generate the list resulting from the API call, or generate an error

        if (this.state.error) {
            return <div>Nothing found</div>
        }
        if (this.state.responseError) {
            return <div>Something went wrong... Please try again</div>
        } 
        else {

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
        let val = {value}.value
        
        this.setState({sortState: val}, ()=> {
            this.onTermSubmitHandler();
        })
       
    }


    handleTabChange = (tab, genres, keywords) => {

        this.setState({activeTab: tab, error:false, responseError: false,}, ()=> {
            if (tab === "general") {
                return
            }
            // call the tab immediately after click
            this.onTermSubmitHandler('', genres, keywords)
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
                    //function received from child component regarding toggle KW switch. Returns true/false
                    inclEveryKW={(i) => {
                        this.setState({inclEveryKW: i})
                    }} >

                    {/* "sort by" component */}
                    <div style={{display: this.state.activeTab === "general" ? "none" : "block", textAlign:"right"}} 
                        className="dropdown-cont">
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

                <div className="disc">
                    <div>
                        API provided by 
                        <a href="https://www.themoviedb.org/?language=en-US" rel="noopener noreferrer" target="_blank">TMDB</a>
                    </div>
                </div>

            </div>
        )
    }
}

export default App;
