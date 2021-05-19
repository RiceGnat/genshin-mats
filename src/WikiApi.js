import Axios from 'axios';
import {
	splitArray,
     parseCharacterDetails,
	parseAscensionMats,
	parseTalentMats,
	parseWeaponTable,
     parseWeaponDetails,
	parseWeaponMats,
     parseItemDetails
} from './Util';

const wiki = 'https://genshin-impact.fandom.com';
const api = `${wiki}/api.php?format=json&origin=*&`;
const file = `${wiki}/wiki/Special:Redirect/file/`;

export default class {
     static get = params => Axios.get(`${api}${params}`).then(response => response.data);

     static file = filename => `${file}${filename}`;

     static getPages = (pages, parser) =>
          Promise.all(splitArray(pages, 50).map(chunk =>
               this.get(`action=query&prop=revisions&rvslots=main&rvprop=content&titles=${chunk.join('|')}`)
                    .then(data => Object.values(data.query.pages).map(page => parser(page.title, page.revisions[0].slots.main['*'])))))
          .then(results => results.flat());

     static getCharacters = () => this.get(`action=query&list=categorymembers&cmtitle=Category:Playable_Characters&cmlimit=max`)
          .then(data => data.query.categorymembers
               .filter(({ ns }) => ns === 0)
               .map(({ title }) => title))
          .then(characters => this.getPages(characters, (title, wikitext) => ({
               name: title,
               ...parseCharacterDetails(wikitext),
               ascensions: parseAscensionMats(wikitext),
               talents: parseTalentMats(wikitext)
          })))
          .then(characters => Promise.all(characters.map(character =>
               this.getTalentNames(character.name).then(talentNames => ({
                    ...character,
                    talentNames
               }))
          )));

     static getWeapons = () => Promise.all([
               `action=query&list=categorymembers&cmtitle=Category:5-Star_Weapons&cmlimit=max&cmtype=page`,
               `action=query&list=categorymembers&cmtitle=Category:4-Star_Weapons&cmlimit=max&cmtype=page`,
               `action=query&list=categorymembers&cmtitle=Category:3-Star_Weapons&cmlimit=max&cmtype=page`
          ].map(url => this.get(url).then(data => data.query.categorymembers
               .filter(({ ns }) => ns === 0)
               .map(({ title }) => title))))
          .then(results => results.flat())
          .then(weapons => this.getPages(weapons, (title, wikitext) => ({
               name: title,
               ...parseWeaponDetails(wikitext),
               ascensions: parseWeaponMats(wikitext)
          })))
          .then(weapons => weapons.filter(({ released }) => released));
          
     static getAllWeapons = () => this.get(`action=expandtemplates&prop=wikitext&text=%7B%7B%23DPL%3A%7Cuses%20%3D%20Template%3AWeapon%20Infobox%7Cnamespace%3D%7Cinclude%3D%7BWeapon%20Infobox%7D%3A%25PAGE%25%7Ctable%3D%2CName%7Ctablesortcol%3D1%7Callowcachedresults%20%3D%20true%7D%7D`)
          .then(data => parseWeaponTable(data.expandtemplates.wikitext))
          .then(weapons => this.getPages(weapons, (title, wikitext) => ({
               name: title,
               ...parseWeaponDetails(wikitext),
               ascensions: parseWeaponMats(wikitext)
          })));

     static getItem = name =>
          this.getPages([name], (title, wikitext) => ({
               name: title,
               ...parseItemDetails(wikitext)
          })).then(results => results.length > 0 ? results[0] : null);

     static getTalentNames = character => Promise.all([
               `action=expandtemplates&prop=wikitext&text=%7B%7B%23DPL%3A%7Ccategory%3D${character}%20Talents%26Normal%20Attacks%7Cuses%3DTemplate%3ATalent%20Infobox%7Cinclude%3D%7BTalent%20Infobox%7D%3A%25PAGE%25%7Cformat%3D%2C%7Callowcachedresults%3Dtrue%7D%7D`,
               `action=expandtemplates&prop=wikitext&text=%7B%7B%23DPL%3A%7Ccategory%3D${character}%20Talents%26Elemental%20Skills%7Cuses%3DTemplate%3ATalent%20Infobox%7Cinclude%3D%7BTalent%20Infobox%7D%3A%25PAGE%25%7Cformat%3D%2C%7Callowcachedresults%3Dtrue%7D%7D`,
               `action=expandtemplates&prop=wikitext&text=%7B%7B%23DPL%3A%7Ccategory%3D${character}%20Talents%26Elemental%20Bursts%7Cuses%3DTemplate%3ATalent%20Infobox%7Cinclude%3D%7BTalent%20Infobox%7D%3A%25PAGE%25%7Cformat%3D%2C%7Callowcachedresults%3Dtrue%7D%7D`,
          ].map(url => this.get(url).then(data => data.expandtemplates.wikitext)))
          .then(results => ({
               attack: results[0],
               skill: results[1],
               burst: results[2]
          }));
}