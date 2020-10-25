import React, { useState, Fragment } from 'react';
import WikiApi from './WikiApi';
import Item from './Item';
import Mora from './Mora';
import { getAscensionTotals } from './Util';

const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

export default ({ character, onBoundsChanged, onDelete }) => {
	const [showTalents, setShowTalents] = useState(false);

	const bounds = character.bounds;
	const current = bounds.ascension.current;
	const target = bounds.ascension.target;

	const totals = getAscensionTotals(character.ascensions.filter((_, i) => i >= current && i < target)
		.concat(character.talents.filter((_, i) => i >= bounds.attack.current - 1 && i < bounds.attack.target - 1))
		.concat(character.talents.filter((_, i) => i >= bounds.skill.current - 1 && i < bounds.skill.target - 1))
		.concat(character.talents.filter((_, i) => i >= bounds.burst.current - 1 && i < bounds.burst.target - 1))
	);

	return (
		<div className="char container">
			<input type="button" className="delete-btn" value="&#215;" onClick={() => onDelete()} />
			<h4>{character.name}</h4>
			<div className="ascension flex row">
				<div className="thumb">
					<img className="char_image"
						src={WikiApi.file(`Character_${character.name}_Thumb.png`)}
						alt={character.name}
						title={character.name}
						width={106}
						height={106} />
					<div>
						<input type="number" value={current} onChange={e => {
							const value = clamp(e.target.value, 0, 6);
							onBoundsChanged('ascension', value, Math.max(value, target));
						}} />
						<input type="number" value={target} onChange={e => {
							const value = clamp(e.target.value, 0, 6);
							onBoundsChanged('ascension', Math.min(value, current), value);
						}} />
					</div>
				</div>
				<div>{character.ascensions.map((a, i) =>
					<div key={`ascension_${i}`} className={`flex${i < current || i + 1 > target ? ' inactive' : ''}`}>
						<Item item={a.ele1} />
						<Item item={a.ele2} />
						<Item item={a.local} />
						<Item item={a.common} />
						<Mora amount={a.mora} />
					</div>)}
				</div>
			</div>
			<div className="talents row">
				<div className="flex container">
					<h5>Talents</h5>
					<button type="button" className="link-button h5 toggle" onClick={() => {
						if (showTalents) {
							onBoundsChanged('talents', 1, 1);
							setShowTalents(false);
						}
						else {
							onBoundsChanged('talents', 1, 10);
							setShowTalents(true);
						}
					}}>
						{showTalents ? <Fragment>&#65293;</Fragment> : <Fragment>&#65291;</Fragment>}
					</button>
				</div>
				<fieldset className={`flex${showTalents ? '' : ' hidden'}`}>
					<div className="thumb">
						<img className="talent_image"
							src={WikiApi.file(`Talent ${character.talentNames.attack}.png`)}
							alt={character.talentNames.attack}
							title={character.talentNames.attack} />
						<span className="h6 talent_name"> Attack</span>
						<div>
							<input type="number" value={bounds.attack.current} onChange={e => {
								const value = clamp(e.target.value, 1, 10);
								onBoundsChanged('attack', value, Math.max(value, bounds.attack.target));
							}} />
							<input type="number" value={bounds.attack.target} onChange={e => {
								const value = clamp(e.target.value, 1, 10);
								onBoundsChanged('attack', Math.min(value, bounds.attack.current), value);
							}} />
						</div>
						<img className="talent_image"
							src={WikiApi.file(`Talent ${character.talentNames.skill}.png`)}
							alt={character.talentNames.skill}
							title={character.talentNames.skill} />
						<span className="h6 talent_name"> Skill</span>
						<div>
							<input type="number" value={bounds.skill.current} onChange={e => {
								const value = clamp(e.target.value, 1, 10);
								onBoundsChanged('skill', value, Math.max(value, bounds.skill.target));
							}} />
							<input type="number" value={bounds.skill.target} onChange={e => {
								const value = clamp(e.target.value, 1, 10);
								onBoundsChanged('skill', Math.min(value, bounds.skill.current), value);
							}} />
						</div>
						<img className="talent_image"
							src={WikiApi.file(`Talent ${character.talentNames.burst}.png`)}
							alt={character.talentNames.burst}
							title={character.talentNames.busrt} />
						<span className="h6 talent_name"> Burst</span>
						<div>
							<input type="number" value={bounds.burst.current} onChange={e => {
								const value = clamp(e.target.value, 1, 10);
								onBoundsChanged('burst', value, Math.max(value, bounds.burst.target));
							}} />
							<input type="number" value={bounds.burst.target} onChange={e => {
								const value = clamp(e.target.value, 1, 10);
								onBoundsChanged('burst', Math.min(value, bounds.burst.current), value);
							}} />
						</div>
					</div>
					<div>{character.talents.map((a, i) =>
						<div key={`talent_${i}`} className={`flex`}>
							<Item item={a.talent} />
							<Item item={a.common} />
							<Item item={a.weekly} />
							<Mora amount={a.mora} />
						</div>)}
					</div>
				</fieldset>
			</div>
			<div className="row">
				<h5>Total character mats</h5>
				<div className="total flex">{[
					...Object.values(totals.ele1),
					...Object.values(totals.ele2),
					...Object.values(totals.local),
					...Object.values(totals.common),
					...Object.values(totals.talent),
					...Object.values(totals.weekly)].map(item =>
					<Item key={`subtotal_${item.name}`} item={item} />)}
					<Mora amount={totals.mora} />
				</div>
			</div>
		</div>
	);
}