export const parseAscensionMats = wikitext => {
	const mats = {};
	wikitext.match(/\{\{Character Ascension Materials\s*\|(.+?)\}\}/s)[1]
		.split('|')
		.map(mat => mat.split('='))
		.forEach(o => mats[o[0].trim()] = o[1].trim());
	return mats;
}

export const parseTalentMats = wikitext => {
    const mats = {};
    try {
        wikitext.match(/\{\{Talent Leveling Table\s*\|(.+?)\}\}/s)[1]
            .split('|')
            .map(mat => mat.split('='))
            .forEach(o => mats[o[0].trim()] = o[1].trim());
    } finally {
        return mats;
    }
}

export const parseTalentNames = wikitext => {
    const names = {};
    try {
        wikitext.match(/\{\{Talents Table\s*\|(.+?)\}\}/s)[1]
            .split('|')
            .map(talent => talent.split('='))
            .forEach(o => names[o[0].trim()] = o[1].trim());
    } finally {
        return names;
    }
}

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
            undefined
        ),
        talent(
            item(data.talentMat3, 6),
            item(data.commonMat3, 6),
            item(data.bossMat, 1),
            undefined
        ),
        talent(
            item(data.talentMat3, 12),
            item(data.commonMat3, 9),
            item(data.bossMat, 2),
            undefined
        ),
        talent(
            item(data.talentMat3, 16),
            item(data.commonMat3, 12),
            item(data.bossMat, 2),
            undefined
        )
    ];
}

export const getAscensionTotals = array => {
    const fields = ['ele1', 'ele2', 'local', 'common', 'talent', 'weekly'];
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