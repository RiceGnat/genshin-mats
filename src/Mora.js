import React from 'react';
import WikiApi from './WikiApi';

export default ({ amount }) =>
    <div className="item mora">
        <img src={WikiApi.file(`Icon_Mora.png`)}
            alt="Mora"
            title="Mora" />
        <span className="h6"> {amount === undefined ? '?' : amount}</span>
    </div>;