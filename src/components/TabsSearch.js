import React from 'react';
import Tabs from './Tabs';
import SearchBar from './SearchBar'; 

//this component is not in use
class TabsSearch extends React.Component {


    state = {
        //activeSearch: the dropdown left to "search" button
        activeSearch: 'keyword', 
        //currently active tab
        activeTab: 'discMovies'
    }

    activeSearch = (i) => {
        //tells the state which search mode is currently active (movies, TV, keyword, etc)
        this.setState({ activeSearch: i }, function() {
            this.props.activeSearch(this.state.activeSearch)
        })
    }

    //handle the tab click events, and corresponding function calls
    tabHandler = (e) => {
        let children = e.target.parentElement.children

        for (let i = 0; i < children.length; i++) {
            children[i].className = "item"
        }

        e.target.className = "item active";

        this.setState({activeTab: e.target.getAttribute("value")}, function(){
            this.props.onTermSubmit();
        })
    }

    render () {
        return (
            <>
                <Tabs tabHandler={this.tabHandler}/>
                <SearchBar 
                    reset={this.props.reset}
                    inclEveryKW={this.props.inclEveryKW}
                    onTermSubmit={this.props.onTermSubmit} 
                    activeSearch={this.props.activeSearch}
                />
            </>
        )
    }

}


export default TabsSearch;
