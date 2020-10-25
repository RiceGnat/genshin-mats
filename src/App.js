import React, { Component } from 'react';
import './App.scss';
import WikiApi from './WikiApi';
import CharacterMats from './CharacterMats';
import {
	parseAscensionMats,
	parseTalentMats,
	parseTalentNames,
	getAscensionLevels,
	getAscensionTotals,
	getTalentLevels
} from './Util';
import ItemList from './ItemList';

export default class extends Component {
	constructor(props) {
		super(props);

		this.state = {
			characters: [],
			names: [],
			selectedCharacter: '',
			list: []
		};
	}

	componentDidMount = async () => {
		const characters = await WikiApi.get(`list=categorymembers&cmtitle=Category:Playable_Characters&cmlimit=max`)
			.then(data => data.query.categorymembers
				.filter(({ ns }) => ns === 0)
				.map(({ title }) => title))
			.then(characters => WikiApi.get(`prop=revisions&rvslots=main&rvprop=content&titles=${characters.join('|')}`)
				.then(data => Object.values(data.query.pages).map(page => {
					const wikitext = page.revisions[0].slots.main['*'];
					return {
						name: page.title,
						ascensions: parseAscensionMats(wikitext),
						talents: parseTalentMats(wikitext),
						talentNames: parseTalentNames(wikitext)
					};
				})));

		const names = characters.map(({ name }) => name).sort();

		this.setState({
			characters,
			names,
			selectedCharacter: names[0]
		});
	}

	addCharacter = () => {
		const list = this.state.list;
		const selected = this.state.selectedCharacter;
		if (!list.find(({ name }) => name === selected)) {
			const char = this.state.characters.find(({ name }) => name === selected);
			if (char) {
				list.push({
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

	render = () => {
		const totals = getAscensionTotals(this.state.list
			.map(char => char.ascensions.filter((_, i) => i >= char.bounds.ascension.current && i < char.bounds.ascension.target)
				.concat(char.talents.filter((_, i) => i >= char.bounds.attack.current - 1 && i < char.bounds.attack.target))
				.concat(char.talents.filter((_, i) => i >= char.bounds.skill.current - 1 && i < char.bounds.skill.target))
				.concat(char.talents.filter((_, i) => i >= char.bounds.burst.current - 1 && i < char.bounds.burst.target)))
			.flat());

		return (
			<div className="main container">
				<div className="controls row">
					<select id="character" onChange={e => this.setState({ selectedCharacter: e.target.value })}>
						{this.state.names.map(name => <option key={name}>{name}</option>)}
					</select>
					<input type="button" id="addCharacter" value="Add" onClick={this.addCharacter} />
				</div>
				<div className="list row flex">
					{this.state.list.map((char, i) =>
						<CharacterMats key={char.name} character={char}
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
						<h4>Total mats for all characters</h4>
						<ItemList className="flex total" mora={totals.mora} items={[
							...Object.values(totals.ele1),
							...Object.values(totals.ele2),
							...Object.values(totals.local),
							...Object.values(totals.common),
							...Object.values(totals.talent),
							...Object.values(totals.weekly)]} />
					</div>
				}
			</div>
		);
	}
}
