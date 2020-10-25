import React, { Fragment } from 'react';
import WikiApi from './WikiApi';

export default ({ item }) =>
    <div className="item">
        {item && <Fragment>
            {item.name ?
                <img src={WikiApi.file(`Item_${item.name}.png`)}
                    alt={item.name}
                    title={item.name} /> :
                <div className="h6 unknown" alt="Unknown" title="Unknown"></div>}
            <span className="h6"> {item.count}</span>
        </Fragment>}
    </div>;