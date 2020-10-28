import React from 'react';
import Item from './Item';
import Mora from './Mora';

export default ({ items, mora, filter, ...others }) => 
<div {...others}>{items.map((item, i) =>
    <Item key={item ? (item.name || `unknown${i}`) : `null${i}`} item={item} filter={filter} />)}
    {mora !== null && <Mora amount={mora} />}
</div>