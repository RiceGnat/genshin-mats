import React from 'react';
import Item from './Item';
import Mora from './Mora';

export default ({ items, mora, ...others }) => 
<div {...others}>{items.map((item, i) =>
    <Item key={`${item ? item.name : 'undefined'}${i}`} item={item} />)}
    <Mora amount={mora} />
</div>