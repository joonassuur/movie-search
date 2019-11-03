import React from 'react';


function Tabs(props) {

    return (
        <div className="ui orange inverted menu">
            <a  value="discMovies" onClick={props.tabHandler} className="active item">Movies</a>
            <a  value="discTV" onClick={props.tabHandler} className="item">TV</a>
            <a  value="general" onClick={props.tabHandler} className="item">General</a>
        </div>
    )

}


export default Tabs;
