import React from 'react';
import { Input, Label } from 'semantic-ui-react'


class YearSearch extends React.Component {

    state = {
        year: '',
        error:false
    }

    handleChange = (e) => {
        e.preventDefault();
        if (e.target.value.length > 4) {
            return
        }        

        this.setState({year: e.target.value},()=> {
            if (this.state.year.length === 0 || 
                this.state.year.length > 3) {
                    
                this.setState({error: false})
            } else {
                this.setState({error: true})
            }
            
            this.props.selectedYear(this.state.year)
        
        })
    }

    render() {
       return (
                <>
                    <Input 
                    input={{ type: 'number' }}
                    onChange={this.handleChange} 
                    value={this.state.year} 
                    placeholder='Year' 
                    />
                    <Label 
                    style={{display: this.state.error ? "inline-block" : "none"}} 
                    pointing>Please enter a valid number</Label>
                </>
            )
    }


}


export default YearSearch;

