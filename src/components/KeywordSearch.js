import React, { Component } from 'react';
import _ from 'lodash';
import { Dropdown } from 'semantic-ui-react';
import axios from 'axios';

const KEY = "6df1763739d4dda8cf71c3daca202b2e";


class KeywordSearch extends Component {
    state = {
        isFetching: false,
        search: true,
        searchQuery: null,
        value: [],
        options: [],
        combined: [],
    }
    
    getOptions = () => {
       
        if(this.state.searchQuery) {
            this.setState({isFetching:true})
            axios.get('https://api.themoviedb.org/3/search/keyword', {
                params: {
                    query: this.state.searchQuery,
                    api_key: KEY
                }
            })  
            
            .then( (response) => {

                this.setState({
                    
                    options: [
                    ...response.data.results.map( (e,i) => {  
                        
                                return {
                                
                                    key: i.id,
                                    text: e.name, 
                                    value: e.id
                                }   
                    
                            }),
                            ...this.state.combined
                        ]
                    
                }, () => this.setState({isFetching:false}))
                
            }).catch( ()=> {
                return
            })
        }
    }




  handleChange = (e,  data ) => { 

        const { value } = data; 
        this.setState({value, searchQuery: null})


        if(e.target.className !== "delete icon" && e.target.textContent.length > 0) {
            this.state.combined.push({
                key: value[value.length-1], 
                text: e.target.textContent, 
                value: value[value.length-1]
        })
        } else {
            let IDs = []

            this.state.combined.forEach(e=>{IDs.push(e.key)})

            const index = this.state.combined.map( x => {
                if( x.key === _.difference(IDs, value)[0] ) {
                    return x.key
                }
                return undefined
            }).indexOf(_.difference(IDs, value)[0]) 

            this.state.combined.splice(index, 1)
        }


            this.props.selectedKeywords(value)

    }
  
  handleSearchChange = (e, { searchQuery }) => {
      this.setState({ searchQuery }, () => {
  
        if( searchQuery.length < 3 ) {this.setState({options: this.state.combined})}
        if( searchQuery.length > 2 ) {this.getOptions()}  }
    )}

  render() {
    const { options, isFetching, search, value } = this.state

    return (
            <Dropdown
                fluid
                onAddItem={this.handleAddition}
                selection
                multiple
                search={search}
                options={options}
                value={value}
                placeholder="Search keywords"
                onChange={this.handleChange}
                onSearchChange={this.handleSearchChange}
                disabled={isFetching}
                loading={isFetching}
            />
        )
    }
}

export default KeywordSearch
