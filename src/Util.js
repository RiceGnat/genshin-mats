export const splitArray = (array, chunkSize) => Array(Math.ceil(array.length / chunkSize)).fill().map((_, index) => index * chunkSize).map(begin => array.slice(begin, begin + chunkSize));

const extractWikiTemplateParams = (wikitext, template) => {
    const params = {};
    try {
        [...wikitext.match(new RegExp(`\\{\\{${template}\\s*(.+?)\\}\\}`, 's'))[1]
            .matchAll(/\|([^|]+?)=(.+?)(?=(?:\|(?:[^|]+?)=)|$)/gs)
        ].forEach(o => params[o[1].trim()] = o[2].trim());
    } finally {
        return params;
    }
}

export const parseCharacterDetails = wikitext => {
    const params = extractWikiTemplateParams(wikitext, 'Character Infobox');
    return {
        rarity: parseInt(params.rarity)
    }
}

export const parseAscensionMats = wikitext =>
    extractWikiTemplateParams(wikitext, 'Character Ascension Materials');

export const parseTalentMats = wikitext => 
    extractWikiTemplateParams(wikitext, 'Talent Leveling Table');

export const parseTalentNames = wikitext => 
    extractWikiTemplateParams(wikitext, 'Talents Table');

export const parseWeaponTable = wikitext => 
    wikitext.replace(/\n/g, '').replace(/\{\|/g, '').replace(/\|\}/g, '').split('|-|').slice(1).map(row => row.split('|').pop());
    
export const parseWeaponDetails = wikitext => {
    const params = extractWikiTemplateParams(wikitext, 'Weapon Infobox');
    const versionMatches = wikitext.match(/\{\{Version.+?\}\}/s);

    return {
        rarity: parseInt(params.rarity),
        released: versionMatches !== null      
    }
}

export const parseWeaponMats = wikitext =>
    extractWikiTemplateParams(wikitext, 'Weapon Ascension Materials'); 

export const parseItemDetails = wikitext =>
    extractWikiTemplateParams(wikitext, 'Item Infobox'); 

const item = (name, count) => ({ name, count });

export const getAscensionLevels = data => {
	const ascension = (ele1, ele2, local, common, mora) => ({ ele1, ele2, local, common, mora });
	return [
		ascension(
			item(`${data.ele1} Sliver`, 1),
			null,
			item(data.local, 3),
			item(data.common1, 3),
			20000
		),
		ascension(
			item(`${data.ele1} Fragment`, 3),
			data.ele2 && item(data.ele2, 2),
			item(data.local, 10),
			item(data.common1, 15),
			40000
		),
		ascension(
			item(`${data.ele1} Fragment`, 6),
			data.ele2 && item(data.ele2, 4),
			item(data.local, 20),
			item(data.common2, 12),
			60000
		),
		ascension(
			item(`${data.ele1} Chunk`, 3),
			data.ele2 && item(data.ele2, 8),
			item(data.local, 30),
			item(data.common2, 18),
			80000
		),
		ascension(
			item(`${data.ele1} Chunk`, 6),
			data.ele2 && item(data.ele2, 12),
			item(data.local, 45),
			item(data.common3, 12),
			100000
		),
		ascension(
			item(`${data.ele1} Gemstone`, 6),
			data.ele2 && item(data.ele2, 20),
			item(data.local, 60),
			item(data.common3, 24),
			120000
		)
	];
}

export const getTalentLevels = data => {
    const talent = (talent, common, weekly, mora) => ({ talent, common, weekly, mora });
    return [
        talent(
            item(data.talentMat1, 3),
            item(data.commonMat1, 6),
            null,
            12500
        ),
        talent(
            item(data.talentMat2, 2),
            item(data.commonMat2, 3),
            null,
            17500
        ),
        talent(
            item(data.talentMat2, 4),
            item(data.commonMat2, 4),
            null,
            25000
        ),
        talent(
            item(data.talentMat2, 6),
            item(data.commonMat2, 6),
            null,
            30000
        ),
        talent(
            item(data.talentMat2, 9),
            item(data.commonMat2, 9),
            null,
            37500
        ),
        talent(
            item(data.talentMat3, 4),
            item(data.commonMat3, 4),
            item(data.bossMat, 1),
            120000
        ),
        talent(
            item(data.talentMat3, 6),
            item(data.commonMat3, 6),
            item(data.bossMat, 1),
            260000
        ),
        talent(
            item(data.talentMat3, 12),
            item(data.commonMat3, 9),
            item(data.bossMat, 2),
            450000
        ),
        talent(
            item(data.talentMat3, 16),
            item(data.commonMat3, 12),
            item(data.bossMat, 2),
            undefined
        )
    ];
}

export const getWeaponAscensionLevels = (data, rarity) => {
    const ascension = (weapon, boss, common, mora) => ({ weapon, boss, common, mora });
    
    switch (rarity) {
        case 5:
            return [
                ascension(
                    item(data.ascendMat1, 5),
                    item(data.bossMat1, 5),
                    item(data.commonMat1, 3),
                    10000
                ),
                ascension(
                    item(data.ascendMat2, 5),
                    item(data.bossMat1, 18),
                    item(data.commonMat1, 12),
                    20000
                ),
                ascension(
                    item(data.ascendMat2, 9),
                    item(data.bossMat2, 9),
                    item(data.commonMat2, 9),
                    30000
                ),
                ascension(
                    item(data.ascendMat3, 5),
                    item(data.bossMat2, 18),
                    item(data.commonMat2, 14),
                    45000
                ),
                ascension(
                    item(data.ascendMat3, 9),
                    item(data.bossMat3, 14),
                    item(data.commonMat3, 9),
                    55000
                ),
                ascension(
                    item(data.ascendMat4, 6),
                    item(data.bossMat3, 27),
                    item(data.commonMat3, 18),
                    undefined
                )
            ];
        case 4:
            return [
                ascension(
                    item(data.ascendMat1, 3),
                    item(data.bossMat1, 3),
                    item(data.commonMat1, 2),
                    5000
                ),
                ascension(
                    item(data.ascendMat2, 3),
                    item(data.bossMat1, 12),
                    item(data.commonMat1, 8),
                    15000
                ),
                ascension(
                    item(data.ascendMat2, 6),
                    item(data.bossMat2, 6),
                    item(data.commonMat2, 6),
                    20000
                ),
                ascension(
                    item(data.ascendMat3, 3),
                    item(data.bossMat2, 12),
                    item(data.commonMat2, 9),
                    30000
                ),
                ascension(
                    item(data.ascendMat3, 6),
                    item(data.bossMat3, 9),
                    item(data.commonMat3, 6),
                    35000
                ),
                ascension(
                    item(data.ascendMat4, 4),
                    item(data.bossMat3, 18),
                    item(data.commonMat3, 12),
                    45000
                )
            ];
        case 3:
            return [
                ascension(
                    item(data.ascendMat1, 2),
                    item(data.bossMat1, 2),
                    item(data.commonMat1, 1),
                    5000
                ),
                ascension(
                    item(data.ascendMat2, 2),
                    item(data.bossMat1, 8),
                    item(data.commonMat1, 5),
                    10000
                ),
                ascension(
                    item(data.ascendMat2, 4),
                    item(data.bossMat2, 4),
                    item(data.commonMat2, 4),
                    15000
                ),
                ascension(
                    item(data.ascendMat3, 2),
                    item(data.bossMat2, 8),
                    item(data.commonMat2, 8),
                    20000
                ),
                ascension(
                    item(data.ascendMat3, 4),
                    item(data.bossMat3, 6),
                    item(data.commonMat3, 4),
                    25000
                ),
                ascension(
                    item(data.ascendMat4, 3),
                    item(data.bossMat3, 12),
                    item(data.commonMat3, 8),
                    undefined
                )
            ];
        default: return [];
    }
}

export const checkBounds = ({ current, target }, i) => i >= current && i < target;

export const checkBoundsOffset = ({ current, target }, i) => checkBounds({ current: current - 1, target: target - 1 }, i);

export const getAscensionTotals = array => {
    const fields = ['ele1', 'ele2', 'local', 'common', 'boss', 'talent', 'weapon', 'weekly'];
    const totals = { mora: 0 };
    fields.forEach(key => totals[key] = {});

	array.forEach(a => {
        fields.forEach(key => {
            if (a[key]) {
                if (!totals[key][a[key].name]) totals[key][a[key].name] = { ...a[key] };
                else totals[key][a[key].name].count += a[key].count;
            }
        });

        if (a.mora) totals.mora += a.mora;
    });
    return totals;
}