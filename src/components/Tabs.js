import React from 'react';

class Tabs extends React.Component {


    render() {
        return (
            <div className="ui secondary menu">
                <a href="!#" value="discMovies" onClick={this.props.tabHandler} className="active item">Movies</a>
                <a href="!#" value="discTV" onClick={this.props.tabHandler} className="item">TV</a>
                <a href="!#" value="general" onClick={this.props.tabHandler} className="item">General</a>
            </div>
        )
    }


}

export default Tabs;
