import React, { Fragment, useState } from 'react';
import WikiApi from './WikiApi';

const cache = {};

const getItemDetails = async name => {
    if (!cache[name]) {
        const item = await WikiApi.getItem(name) || {};
        cache[name] = Object.keys(item)
            .filter(key => key.startsWith('source') && item[key])
            .sort()
            .map(key => item[key].replace(/\[\[(?:.*\|)?([^[\]]*)\]\]/g, '$1').replace(/<br\s*\/>/, ' '));
    } 

    return cache[name];
}

export default ({ item, filter }) => {
    const [sources, setSources] = useState(undefined);
    if (item && item.name && sources === undefined) {
        getItemDetails(item.name).then(s => setSources(s));
    }

    return (
        <div className={`item${filter ? (filter({ ...item, sources }) ? ' selected' : ' unselected') : ''}`}>
            {item && <Fragment>
                {item.name ?
                    <img src={WikiApi.file(`Item_${item.name}.png`)}
                        alt={item.name} /> :
                    <div className="h6 unknown" alt="Unknown" title="Unknown"></div>}
                <span className="h6"> {item.count}</span>
                {item.name && <div className="popup">
                    <h6>{item.name}</h6>
                    {sources === undefined && <span className="loading">Loading...</span>}
                    {sources && sources.map((s, i) => <div key={i}>{s}</div>)}
                </div>}
            </Fragment>}
        </div>);
}
    