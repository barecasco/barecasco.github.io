function deepMergeImmutable(...objects) {
    function isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    function mergeDeep(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (isObject(source[key]) && isObject(target[key])) {
                result[key] = mergeDeep(target[key], source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    return objects.reduce(mergeDeep, {});
}


function loadDefaultLayout(layoutPath) {
    try {
        const layoutRequest = new XMLHttpRequest();
        layoutRequest.open('GET', layoutPath, false);
        layoutRequest.send();

        if (layoutRequest.status === 200) {
            const defaultLayout = JSON.parse(layoutRequest.responseText);
            return defaultLayout;
        } else {
            throw new Error('Failed to load data file');
        }
    } catch (error) {
        console.error('Error loading data files:', error);
    }    
}


function loadLayouts(layoutPath, layoutName) {
    try {
        const layoutRequest = new XMLHttpRequest();
        layoutRequest.open('GET', layoutPath, false);
        layoutRequest.send();

        if (layoutRequest.status === 200) {
            const layouts       = JSON.parse(layoutRequest.responseText);
            const defaultLayout = layouts["default"];
            const selectLayout  = layouts[layoutName];
            const layout        = deepMergeImmutable(defaultLayout, selectLayout);
            return layout;
        } else {
            throw new Error('Failed to load data file');
        }
    } catch (error) {
        console.error('Error loading data files:', error);
    }    
}


function generateStochasticSineData(spread=0.1) {
    const x     = [];
    const y     = [];
    const upper = [];
    const lower = [];
    
    for (let i = 0; i <= 50; i++) {
        const xVal = i * 0.2;
        const yVal = Math.sin(xVal) + Math.random() * spread;
        const error = 0.3 + Math.random() * 0.2;
        
        x.push(xVal);
        y.push(yVal);
        upper.push(yVal + error);
        lower.push(yVal - error);
    }
    
    return { x, y, upper, lower };
}