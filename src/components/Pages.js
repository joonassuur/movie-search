import React from 'react';
import { Pagination } from 'semantic-ui-react'

class Pages extends React.Component {

    state = {
        value: 1
    }

    clickHandler = (e, data) => {

        this.setState({value: data.activePage}, ()=> 
            this.props.pageHandler(this.state.value)
        )        
    }

    render () {
        return (
            <div
                style={{textAlign: "center", marginTop: "4em"}}
            >
                <Pagination 
                    onPageChange={this.clickHandler}
                    activePage={this.state.value} 
                    totalPages={this.props.totalPages} 
                />
            </div>
        )
    }

}


export default Pages;
