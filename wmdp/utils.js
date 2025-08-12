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