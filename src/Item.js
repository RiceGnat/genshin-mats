import React, { Fragment, useState } from 'react';
import WikiApi from './WikiApi';

const cache = {};

const getItemDetails = async name => {
    if (!cache[name]) {
        const item = await WikiApi.getItem(name);
        cache[name] = Object.keys(item)
            .filter(key => key.startsWith('source') && item[key])
            .sort()
            .map(key => item[key].replace(/\[\[(?:.*\|)?(.*)\]\]/g, '$1'));
    } 

    return cache[name];
}

export default ({ item }) => {
    const [sources, setSources] = useState(undefined);
    if (item && item.name && sources === undefined) {
        getItemDetails(item.name).then(s => setSources(s));
    }

    return <div className="item">
        {item && <Fragment>
            {item.name ?
                <img src={WikiApi.file(`Item_${item.name}.png`)}
                    alt={item.name} /> :
                <div className="h6 unknown" alt="Unknown" title="Unknown"></div>}
            <span className="h6"> {item.count}</span>
            {item.name && <div className="popup">
                <h6>{item.name}</h6>
                {sources && sources.map(s => <div>{s}</div>)}
            </div>}
        </Fragment>}
    </div>;
}
    