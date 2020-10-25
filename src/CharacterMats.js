import React, { useState, Fragment } from 'react';
import WikiApi from './WikiApi';
import ItemList from './ItemList';
import { checkBounds, checkBoundsOffset, getAscensionTotals } from './Util';

const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

const talentLabels = ['Attack', 'Skill', 'Burst'];
const talentKeys = talentLabels.map(str => str.toLowerCase());

export default ({ type, character, onBoundsChanged, onDelete }) => {
	const [showTalents, setShowTalents] = useState(false);
	const [focused, setFocus] = useState('');

	const isCharacter = type === 'character';

	const toggleTalents = () => {
		if (showTalents) {
			onBoundsChanged('talents', 1, 1);
			setShowTalents(false);
		}
		else {
			onBoundsChanged('talents', 1, 10);
			setShowTalents(true);
		}
	};

	const bounds = character.bounds;

	const totals = getAscensionTotals(character.ascensions.filter((_, i) => checkBounds(bounds.ascension, i))
		.concat(talentKeys.map(key => character.talents.filter((_, i) => checkBoundsOffset(bounds[key], i))).flat()));

	return (
		<div className="char container">
			<input type="button" className="delete-btn" value="&#215;" onClick={() => onDelete()} />
			<h4>{character.name}</h4>
			<div className="ascension flex row">
				<div className="thumb">
					<img className="char_image"
						src={WikiApi.file(isCharacter ? `Character_${character.name}_Thumb.png` : `Weapon_${character.name}.png`)}
						alt={character.name}
						title={character.name} />
					<div className="rarity">
						<img src={WikiApi.file(`Icon_${character.rarity}_Stars.png`)}
							alt={`${character.rarity}-star ${type}`}
							title={`${character.rarity}-star ${type}`} />
					</div>
					<div onFocus={() => setFocus('ascension')} onBlur={() => setFocus('')}>
						<input type="number" value={bounds.ascension.current} onChange={e => {
							const value = clamp(e.target.value, 0, 6);
							onBoundsChanged('ascension', value, Math.max(value, bounds.ascension.target));
						}} />
						<input type="number" value={bounds.ascension.target} onChange={e => {
							const value = clamp(e.target.value, 0, 6);
							onBoundsChanged('ascension', Math.min(value, bounds.ascension.current), value);
						}} />
					</div>
				</div>
				<div>{character.ascensions.map((a, i) =>
					<ItemList key={`ascension_${i}`} className={`flex${!checkBounds(bounds.ascension, i) ? ' inactive' : ''}`}
						mora={a.mora} items={isCharacter ? [a.ele1, a.ele2, a.local, a.common] : [a.weapon, a.boss, a.common]} />)}
				</div>
			</div>
			{isCharacter &&
				<div className="talents row">
					<div className="flex container">
						<h5 onClick={toggleTalents}>Talents</h5>
						<button type="button" className="link-button h5 toggle" onClick={toggleTalents}>
							{showTalents ? <Fragment>&#65293;</Fragment> : <Fragment>&#65291;</Fragment>}
						</button>
					</div>
					<fieldset className={`flex${showTalents ? '' : ' hidden'}`} disabled={!showTalents}>
						<div className="thumb">{talentKeys.map((key, i) =>
							<div key={`talent_${i}`}>
								<img className="talent_image"
									src={WikiApi.file(`Talent ${character.talentNames[key]}.png`)}
									alt={character.talentNames[key]}
									title={character.talentNames[key]} />
								<span className="h6 talent_name"> {talentLabels[i]}</span>
								<div onFocus={() => setFocus(key)} onBlur={() => setFocus('')}>
									<input type="number" value={bounds[key].current} onChange={e => {
										const value = clamp(e.target.value, 1, 10);
										onBoundsChanged(key, value, Math.max(value, bounds[key].target));
									}} />
									<input type="number" value={bounds[key].target} onChange={e => {
										const value = clamp(e.target.value, 1, 10);
										onBoundsChanged(key, Math.min(value, bounds[key].current), value);
									}} />
								</div>
							</div>)}
						</div>
						<div>{character.talents.map((a, i) =>
							<ItemList key={`talent_${i}`} className={`flex${talentKeys.includes(focused) && !checkBoundsOffset(bounds[focused], i) ? ' inactive' : ''}`}
								mora={a.mora} items={[a.talent, a.common, a.weekly]} />)}
						</div>
					</fieldset>
				</div>
			}
			<div className="row">
				<h5>Total {type} mats</h5>
				<ItemList className="total flex" mora={totals.mora} items={[
					...Object.values(totals.ele1),
					...Object.values(totals.ele2),
					...Object.values(totals.weapon),
					...Object.values(totals.local),
					...Object.values(totals.boss),
					...Object.values(totals.common),
					...Object.values(totals.talent),
					...Object.values(totals.weekly)]} />
			</div>
		</div>
	);
}