import React, { Component } from 'react';
import './App.scss';
import WikiApi from './WikiApi';
import CharacterMats from './CharacterMats';
import {
	getAscensionLevels,
	getAscensionTotals,
	getTalentLevels,
	getWeaponAscensionLevels
} from './Util';
import ItemList from './ItemList';

export default class extends Component {
	constructor(props) {
		super(props);

		this.state = {
			characters: [],
			characterNames: [],
			selectedCharacter: '',
			weapons: [],
			weaponNames: [],
			selectedWeapon: '',
			list: []
		};
	}

	componentDidMount = async () => {
		const characters = await WikiApi.getCharacters();
		const characterNames = characters.map(({ name }) => name).sort();
		const weapons = await WikiApi.getWeapons();
		const weaponNames = weapons.map(({ name }) => name).sort();

		this.setState({
			characters,
			characterNames,
			selectedCharacter: characterNames[0],
			weapons,
			weaponNames,
			selectedWeapon: weaponNames[0]
		});
	}

	addCharacter = () => {
		const list = this.state.list;
		const selected = this.state.selectedCharacter;
		if (!list.find(({ name }) => name === selected)) {
			const char = this.state.characters.find(({ name }) => name === selected);
			if (char) {
				list.push({
					type: 'character',
					...char,
					ascensions: getAscensionLevels(char.ascensions),
					talents: getTalentLevels(char.talents),
					bounds: {
						ascension: { current: 0, target: 6 },
						attack: { current: 1, target: 1 },
						skill: { current: 1, target: 1 },
						burst: { current: 1, target: 1 }
					}
				});
				this.setState({ list });
			}
		}
	}

	addWeapon = () => {
		const list = this.state.list;
		const selected = this.state.selectedWeapon;
		if (!list.find(({ name }) => name === selected)) {
			const weapon = this.state.weapons.find(({ name }) => name === selected);
			if (weapon) {
				list.push({
					type: 'weapon',
					...weapon,
					ascensions: getWeaponAscensionLevels(weapon.ascensions, weapon.rarity),
					talents: [],
					bounds: {
						ascension: { current: 0, target: 6 }
					}
				});
				this.setState({ list });
			}
		}
	}

	render = () => {
		const totals = getAscensionTotals(this.state.list
			.map(char => char.ascensions.filter((_, i) => i >= char.bounds.ascension.current && i < char.bounds.ascension.target)
				.concat(char.talents.filter((_, i) => i >= char.bounds.attack.current - 1 && i < char.bounds.attack.target))
				.concat(char.talents.filter((_, i) => i >= char.bounds.skill.current - 1 && i < char.bounds.skill.target))
				.concat(char.talents.filter((_, i) => i >= char.bounds.burst.current - 1 && i < char.bounds.burst.target)))
			.flat());

		return (
			<div className="main container">
				<div className="controls row flex">
					<div>
						<h4>Characters</h4>
						<select onChange={e => this.setState({ selectedCharacter: e.target.value })}>
							{this.state.characterNames.map(name => <option key={name}>{name}</option>)}
						</select>
						<input type="button" value="Add" onClick={this.addCharacter} />
					</div>
					<div>
						<h4>Weapons</h4>
						<select onChange={e => this.setState({ selectedWeapon: e.target.value })}>
							{this.state.weaponNames.map(name => <option key={name}>{name}</option>)}
						</select>
						<input type="button" value="Add" onClick={this.addWeapon} />
					</div>
				</div>
				<div className="list row flex">
					{this.state.list.map((char, i) =>
						<CharacterMats key={char.name} type={char.type} character={char}
							onBoundsChanged={(key, current, target) => {
								const list = this.state.list;
								const bounds = key === 'talents' ? {
									...char.bounds,
									attack: { current, target },
									skill: { current, target },
									burst: { current, target }
								} : {
									...char.bounds,
									[key]: { current, target }
								};
								list[i] = {
									...char,
									bounds
								};
								this.setState({ list });
							}}
							onDelete={() => {
								const list = this.state.list;
								list.splice(i, 1);
								this.setState({ list });
							}} />)}
				</div>
				{this.state.list.length > 1 && 
					<div className="row">
						<h4>Total mats for all {this.state.list.map(({ type }) => `${type}s`).filter((value, index, self) => self.indexOf(value) === index).sort().join(' and ')}</h4>
						<ItemList className="flex total" mora={totals.mora} items={[
							...Object.values(totals.ele1),
							...Object.values(totals.ele2),
							...Object.values(totals.local),
							...Object.values(totals.common),
							...Object.values(totals.boss),
							...Object.values(totals.talent),
							...Object.values(totals.weapon),
							...Object.values(totals.weekly)]} />
					</div>
				}
			</div>
		);
	}
}
