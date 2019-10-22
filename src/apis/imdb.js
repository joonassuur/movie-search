import axios from 'axios';

export default axios.create({
    baseURL: "https://api.themoviedb.org/3/discover/movie"
    // search by title
    // baseURL: "https://api.themoviedb.org/3/search/movie"

    // discover
    // baseURL: "https://api.themoviedb.org/3/discover/movie"

    // search by person
    // baseURL: "https://api.themoviedb.org/3/search/person"
})
