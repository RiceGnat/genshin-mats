import Axios from 'axios';

const wiki = 'https://genshin-impact.fandom.com';
const api = `${wiki}/api.php?action=query&format=json&origin=*&`;
const file = `${wiki}/wiki/Special:Redirect/file/`;

export default class {
     static get = params => Axios.get(`${api}${params}`).then(response => response.data);
     static file = filename => `${file}${filename}`;
}