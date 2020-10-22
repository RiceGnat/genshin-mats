import React from 'react';
import WikiApi from './WikiApi';

export default ({ amount }) =>
    <div className="item mora">
        <img src={WikiApi.file(`Icon_Mora.png`)}
            alt="Mora"
            width={30}
            height={30} />
        <span className="h6"> {amount}</span>
    </div>;