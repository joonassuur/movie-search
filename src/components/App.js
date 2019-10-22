import React from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import Results from './Results';
import genres from './Genre-id';
import { Icon, Loader} from 'semantic-ui-react'
import image from '../images/no-image.png';
import '../style.css'

const KEY = "6df1763739d4dda8cf71c3daca202b2e";
let resultCount = 0;

class App extends React.Component {

    state = { 
            movies: [], 
            keywords: '', 
            inclEveryKW: false, 
            active: 'movies', 
            error: false,
            loaded: false
        }

    onTermSubmit = async (term) => {
        resultCount = 0
        this.setState({loaded:false})
        this.setState({error:false})
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

        //term = whatever was inserted into the search input


        //this function gets called as part of a GET request, to see where (URL) the request needs to be made depending on the active search mode
        const searchTerm = (term) => {
            if (term) {

                switch (this.state.active) {
                    case 'people':
                        return searchPerson;

                    case 'movies':
                        return searchMovie;

                    case 'tv':
                        return searchTV;

                    case 'all':
                        return searchAll;

                    default:
                        return discoverMovie;
                }

            //if input field is left blank
            } else {
                
                //if invalid search term (that has no results) is entered, check if state.error was set to true. if it was, then display error
                if (this.state.error) {
                    this.setState({loaded: true})
                    this.generateList()
                    return
                }
                //run "discover movies" by default when page loads
                return discoverMovie;
            }
        }


        // keyword search
        if (this.state.active === "keyword") {


            let keywordID = [];
            let promises = [];

            this.asyncPush = async () => {

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

            this.asyncCall = async () => {

                await this.asyncPush();
                // await until all promises have been added to the array
                let x = await Promise.all(promises)
                //wait until x is finished and then check to see if every result > 0
                let promiseLen = [];
                x.forEach((m) => promiseLen.push(m.data.results.length))
                //check if every element in promiseLen > 0. To see if every keyword exists
                function isAboveThreshold(promLen) {
                    return promLen > 0;
                }
                console.log(x)
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

            this.asyncCall2 = async () => {

                await this.asyncCall();
                

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

            this.asyncCall3 = async () => {

                await this.asyncCall2()

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
            this.asyncPush()
            this.asyncCall()
            this.asyncCall2()
            this.asyncCall3()

        } else {

        //unless specifically called, this function runs when keyword search is not enabled
        this.singleRequest = () => {

            axios.get(
                    this.state.active === 'keyword' && this.state.keywords.length > 0 ? 
                    discoverMovie : searchTerm(term), {
                params: {
                    // with genres takes an ID integer, not a string
                    // with_genres: term,
                    // query searches for title/name
                    query: term,
                    api_key: KEY,
                    poster_path: posterPath,
                    "vote_count.gte": this.state.keywords ? 0 : 100,
                    with_keywords: this.state.keywords ? this.state.keywords : undefined
                }
            })
                .then((response) => {

                    //if no results, display error
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
       this.onTermSubmit();
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

    reset = () => {
        //NOT IN USE right now, supposed to clear the list
        this.setState({ movies: [] })
    }

    activeSearch = (i) => {
        //tells the state which search mode is currently active (movies, TV, keyword, etc)
        this.setState({ active: i })
    }


    generateList = () => {

        //generate the list resulting from the API call, or generate an error

        if (this.state.error) {
            
            return <div>error</div>

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



    render() {
        return (
            <div className="ui container" >
                
                <SearchBar 
                    onTermSubmit={this.onTermSubmit} 
                    activeSearch={this.activeSearch} 
                    reset={this.reset} 
                    //function received from child component regarding toggle KW switch. Returns true/false
                    inclEveryKW={(i) => {
                        this.setState({inclEveryKW: i})
                    }} />
                <Loader size='large' 
                        style={{display: this.state.loaded  ? "none" : 
                                         this.state.error ? "none" : 
                                        "block" }} 
                        active 
                        inline='centered' />
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
