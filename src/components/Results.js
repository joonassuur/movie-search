import React from 'react';


function Results (props) {

    return (
        <div className="ui relaxed divided items" style={props.displayOnLoad} >
            {props.children}
        </div>
    )
    
    
}

export default Results;

