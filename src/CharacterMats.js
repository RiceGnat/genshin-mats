import React from 'react';
import WikiApi from './WikiApi';
import Item from './Item';
import Mora from './Mora';
import { getAscensionTotals } from './Util';

const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

export default ({ character, onBoundsChanged, onDelete }) => {
	const current = character.bounds.current;
	const target = character.bounds.target;

	const totals = getAscensionTotals(character.ascension.filter((_, i) => i >= current && i < target));

	return (
		<div className="char container">
			<input type="button" className="delete-btn" value="&#215;" onClick={() => onDelete()} />
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
							onBoundsChanged(value, Math.max(value + 1, target));
						}} />
						<input type="number" value={target} onChange={e => {
							const value = clamp(e.target.value, 1, 6);
							onBoundsChanged(Math.min(value - 1, current), value);
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
					<Item key={item.name} item={item} />)}
					<Mora amount={totals.mora} />
				</div>
			</div>
		</div>
	);
}