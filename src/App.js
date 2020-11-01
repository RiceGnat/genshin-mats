import React, { Component, Fragment } from 'react';
import './App.scss';
import './App.mobile.scss';
import WikiApi from './WikiApi';
import CharacterMats from './CharacterMats';
import {
	getAscensionLevels,
	getTalentLevels,
	getWeaponAscensionLevels,
	checkBounds,
	checkBoundsOffset,
	getAscensionTotals,
	getDomainDay,
} from './Util';
import ItemList from './ItemList';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultSettings = {
	darkMode: false,
	showDetails: true
};

export default class extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ready: false,
			characters: [],
			characterNames: [],
			selectedCharacter: '',
			weapons: [],
			weaponNames: [],
			selectedWeapon: '',
			list: [],
			weekday: 'sunday',
			settings: { ...defaultSettings }
		};
	}

	componentDidMount = async () => {
		let list, settings;
		
		try {
			settings = JSON.parse(localStorage.getItem('settings')) || {};
		}
		catch {
			settings = { ...defaultSettings };
		}

		this.setState({ settings });

		const characters = await WikiApi.getCharacters();
		const characterNames = characters.map(({ name }) => name).sort();
		const weapons = await WikiApi.getWeapons();
		const weaponNames = weapons.map(({ name }) => name).sort((a, b) => {
			const _a = a.toLowerCase().startsWith('the') ? a.substr(4) : a;
			const _b = b.toLowerCase().startsWith('the') ? b.substr(4) : b;

			return _a.localeCompare(_b, 'en', { sensitivity: 'base' });
		});
		
		try {
			list = JSON.parse(localStorage.getItem('list')) || [];
		}
		catch {
			list = [];
		}

		list = list.map(item => {
			const isCharacter = item.type === 'character';
			const data = (isCharacter ? characters : weapons).find(({ name }) => name === item.name);
			if (data) return {
				...item,
				ascensions: isCharacter ? getAscensionLevels(data.ascensions) : getWeaponAscensionLevels(data.ascensions, data.rarity),
				talents: isCharacter ? getTalentLevels(data.talents) : []
			};
			else return item;
		})
		
		localStorage.setItem('list', JSON.stringify(list));

		this.setState({
			ready: true,
			characters,
			characterNames,
			selectedCharacter: characterNames[0],
			weapons,
			weaponNames,
			selectedWeapon: weaponNames[0],
			list
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
				this.updateList(list);
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
				this.updateList(list);
			}
		}
	}

	updateList = list => {
		this.setState({ list });
		localStorage.setItem('list', JSON.stringify(list));
	}

	updateSettings = settings => {
		this.setState({ settings });
		localStorage.setItem('settings', JSON.stringify(settings));
	}

	updateSetting = setting => this.updateSettings({
		...this.state.settings,
		...setting
	});

	clearList = () => this.updateList([]);

	reset = () => {
		this.updateSettings({ ...defaultSettings });
		this.clearList();
	}

	render = () => {
		const totals = getAscensionTotals(this.state.list
			.map(char => char.ascensions.filter((_, i) => checkBounds(char.bounds.ascension, i))
				.concat(char.talents.filter((_, i) => checkBoundsOffset(char.bounds.attack, i)))
				.concat(char.talents.filter((_, i) => checkBoundsOffset(char.bounds.skill, i)))
				.concat(char.talents.filter((_, i) => checkBoundsOffset(char.bounds.burst, i))))
			.flat());

		const overworld = ['local', 'common', 'boss'].map(key => Object.values(totals[key])).flat();
		const elites = ['ele1', 'ele2', 'weekly'].map(key => Object.values(totals[key])).flat();
		const talents = Object.values(totals.talent);
		const weapons = Object.values(totals.weapon);

		return (
			<div className={`main container${this.state.settings.darkMode ? ' dark' : ''}`}>
				<div className="controls row flex wrap">
					<div>
						<h4>Characters</h4>
						{this.state.ready ?
							<div>
								<select onChange={e => this.setState({ selectedCharacter: e.target.value })}>
									{this.state.characterNames.map(name => <option key={name}>{name}</option>)}
								</select>
								<input type="button" value="Add" onClick={this.addCharacter} />
							</div> :
							<span className="h6 loading">Loading...</span>
						}
					</div>
					<div>
						<h4>Weapons</h4>
						{this.state.ready ?
							<div>
								<select onChange={e => this.setState({ selectedWeapon: e.target.value })}>
									{this.state.weaponNames.map(name => <option key={name}>{name}</option>)}
								</select>
								<input type="button" value="Add" onClick={this.addWeapon} />
							</div> :
							<span className="h6 loading">Loading...</span>
						}
					</div>
					<div>
						<h4>Settings</h4>
						<span className="checkbox container">
							<input type="checkbox" id="darkMode" checked={this.state.settings.darkMode}
								onChange={e => this.updateSetting({ darkMode: e.target.checked })} />
							<label htmlFor="darkMode"><span className="check large"></span>Dark mode</label>
						</span>
						<span className="checkbox container">
							<input type="checkbox" id="showDetails" checked={this.state.settings.showDetails}
								onChange={e => this.updateSetting({ showDetails: e.target.checked })} />
							<label htmlFor="showDetails"><span className="check large"></span>Show details</label>
						</span>
						<input type="reset" value="Clear list" onClick={this.clearList} />
						<input type="reset" value="Reset" onClick={this.reset} />
					</div>
				</div>
				<div className="list row flex wrap">
					{this.state.list.map((char, i) =>
						<CharacterMats key={char.name} type={char.type} character={char}
							showDetails={this.state.settings.showDetails}
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
								this.updateList(list);
							}}
							onDelete={() => {
								const list = this.state.list;
								list.splice(i, 1);
								this.updateList(list);
							}} />)}
				</div>
				{this.state.list.length > 0 && 
					<div className="total row">
						<h4>Total mats for all {this.state.list.map(({ type }) => `${type}s`).filter((value, index, self) => self.indexOf(value) === index).sort().join(' and ')}</h4>
						<div className="flex wrap">
							{overworld.length > 0 &&
								<div className="subtotal">
									<h5>Overworld</h5>
									<ItemList className="flex wrap" mora={totals.mora} items={overworld} />
								</div>
							}
							{elites.length > 0 &&
								<div className="subtotal">
									<h5>Elites and weekly bosses</h5>
									<ItemList className="flex wrap" mora={null} items={elites} />
								</div>
							}
						</div>
						{talents.length + weapons.length > 0 &&
							<div className="domain">
								<h5>Domains</h5>
								<div className="row segmented-radio-group container">
									{days.map(day => {
										const key = day.toLowerCase();
										return (
											<Fragment key={key}>
												<input type="radio" id={key} value={key} name="weekday"
													checked={this.state.weekday === key}
													onChange={e => this.setState({ weekday: e.target.value })} />
												<label htmlFor={key}>{day}</label>
											</Fragment>);
									})}
								</div>
								<div className="flex wrap">
									{talents.length > 0 &&
										<div className="subtotal">
											<h6>Talents</h6>
											<ItemList className="flex wrap" mora={null} items={talents}
												filter={item => this.state.weekday === 'sunday' || (item && item.name && getDomainDay(item.name).includes(this.state.weekday))} />
										</div>
									}
									{weapons.length > 0 &&
										<div className="subtotal">
											<h6>Weapons</h6>
											<ItemList className="flex wrap" mora={null} items={weapons}
												filter={item => this.state.weekday === 'sunday' || (item && item.name && getDomainDay(item.name).includes(this.state.weekday))} />
										</div>
									}
								</div>
							</div>
						}
					</div>
				}
			</div>
		);
	}
}
