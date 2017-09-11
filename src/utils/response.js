function entity(data, keys = []) {

	const result = keys.reduce((obj, key) => {
		obj[key] = key === 'id' ? (data.id || data._id) : data[key];
		return obj;
	}, {});

	return result;
}

function map(datas, keys) {
	return datas.map(data => entity(data, keys));
}

const ResponseUtils = {
	entity,
	map
};
export default ResponseUtils;
