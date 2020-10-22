import React, { useState } from 'react';
import WikiApi from './WikiApi';
import Item from './Item';
import Mora from './Mora';

const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

export default ({ character }) => {
	const [current, setCurrent] = useState(0);
	const [target, setTarget] = useState(6);

	const totals = {};

	character.ascension.forEach((a, i) => {
		if (i >= current && i < target) {
			['ele1', 'ele2', 'local', 'common'].forEach(key => {
				if (!totals[key]) totals[key] = {};
				if (a[key] !== null) {
					if (!totals[key][a[key].name]) totals[key][a[key].name] = { ...a[key] };
					else totals[key][a[key].name].count += a[key].count;
				}
			});

			if (!totals.mora) totals.mora = a.mora;
			else totals.mora += a.mora;
		}
	});

	return (
		<div className="char">
			<h4>{character.name}</h4>
			<div className="flex row">
				<div>
					<img className="thumb"
						src={WikiApi.file(`Character_${character.name}_Thumb.png`)}
						alt={character.name}
						width={106}
						height={106} />
					<div className="ascension">
						<input type="number" value={current} onChange={e => {
							const value = clamp(e.target.value, 0, 5);
							setCurrent(value);
							setTarget(Math.max(value + 1, target));
						}} />
						<input type="number" value={target} onChange={e => {
							const value = clamp(e.target.value, 1, 6);
							setTarget(value);
							setCurrent(Math.min(value - 1, current));
						}} />
					</div>
				</div>
				<div>{character.ascension.map((a, i) =>
					<div key={`ascension_${i}`} className={`flex${i < current || i + 1 > target ? ' inactive' : ''}`}>
						<Item item={a.ele1} />
						<Item item={a.ele2} />
						<Item item={a.local} />
						<Item item={a.common} />
						<Mora amount={a.mora} />
					</div>)}
				</div>
			</div>
			<div className="row">
				<h5>Total ascension mats</h5>
				<div className="total flex">{[
					...Object.values(totals.ele1),
					...Object.values(totals.ele2),
					...Object.values(totals.local),
					...Object.values(totals.common)].map(item =>
					<Item item={item} />)}
					<Mora amount={totals.mora} />
				</div>
			</div>
		</div>
	);
}