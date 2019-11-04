import React, { useState } from 'react';
import { Pagination } from 'semantic-ui-react'

/* pagination component */
function Pages(props) {

    const [value, setValue] = useState(1)

    const clickHandler = (e, data) => {
        setValue(()=>data.activePage)
    }

    React.useEffect(() => {
        props.pageHandler(value)
      }, [value]);

    return (
        <div
            style={{textAlign: "center", marginTop: "4em"}}
        >
            <Pagination 
                onPageChange={clickHandler}
                activePage={value} 
                totalPages={props.totalPages} 
            />
        </div>
    )
}


export default Pages;
