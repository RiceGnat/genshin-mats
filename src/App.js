import React, { Component } from 'react';
import './App.scss';
import WikiApi from './WikiApi';
import CharacterMats from './CharacterMats';

const parseAscension = wikitext => {
	const mats = {};
	wikitext.match(/\{\{Character Ascension Materials\s*\|(.+?)\}\}/s)[1]
		.split('|')
		.map(mat => mat.split('='))
		.forEach(o => mats[o[0]] = o[1].trim());
	return mats;
}

const getAscensionLevels = data => {
	const item = (name, count) => ({ name, count });
	const ascension = (ele1, ele2, local, common, mora) => ({ ele1, ele2, local, common, mora });
	return [
		ascension(
			item(`${data.ele1} Sliver`, 1),
			null,
			item(`${data.local}`, 3),
			item(`${data.common1}`, 3),
			20000
		),
		ascension(
			item(`${data.ele1} Fragment`, 3),
			item(`${data.ele2}`, 2),
			item(`${data.local}`, 10),
			item(`${data.common1}`, 15),
			40000
		),
		ascension(
			item(`${data.ele1} Fragment`, 6),
			item(`${data.ele2}`, 4),
			item(`${data.local}`, 20),
			item(`${data.common2}`, 12),
			60000
		),
		ascension(
			item(`${data.ele1} Chunk`, 3),
			item(`${data.ele2}`, 8),
			item(`${data.local}`, 30),
			item(`${data.common2}`, 18),
			80000
		),
		ascension(
			item(`${data.ele1} Chunk`, 6),
			item(`${data.ele2}`, 12),
			item(`${data.local}`, 45),
			item(`${data.common3}`, 12),
			100000
		),
		ascension(
			item(`${data.ele1} Gemstone`, 6),
			item(`${data.ele2}`, 20),
			item(`${data.local}`, 60),
			item(`${data.common3}`, 24),
			120000
		)
	];
}

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
				.then(data => Object.values(data.query.pages).map(page => ({
					name: page.title,
					ascension: parseAscension(page.revisions[0].slots.main['*'])
				}))));

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
					ascension: getAscensionLevels(char.ascension)
				});
				this.setState({ list });
			}
		}
	}

	render = () =>
		<div className="container">
			<div className="controls row">
				<select id="character" onChange={e => this.setState({ selectedCharacter: e.target.value })}>
					{this.state.names.map(name => <option key={name}>{name}</option>)}
				</select>
				<input type="button" id="addCharacter" value="Add" onClick={this.addCharacter} />
			</div>
			<div className="list flex row">
				{this.state.list.map(char => <CharacterMats key={char.name} character={char} />)}
			</div>
		</div>;
}
