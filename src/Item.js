import React, { Fragment } from 'react';
import WikiApi from './WikiApi';

export default ({ item }) =>
    <div className="item">
        {item && <Fragment>
            <img src={WikiApi.file(`Item_${item.name}.png`)}
                alt={item.name}
                title={item.name} />
            <span className="h6"> {item.count}</span>
        </Fragment>}
    </div>;