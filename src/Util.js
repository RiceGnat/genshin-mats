export const getAscensionTotals = array => {
	const totals = {};

	array.forEach((a, i) => {
        ['ele1', 'ele2', 'local', 'common'].forEach(key => {
            if (!totals[key]) totals[key] = {};
            if (a[key] !== null) {
                if (!totals[key][a[key].name]) totals[key][a[key].name] = { ...a[key] };
                else totals[key][a[key].name].count += a[key].count;
            }
        });

        if (!totals.mora) totals.mora = a.mora;
        else totals.mora += a.mora;
    });
    
    return totals;
}