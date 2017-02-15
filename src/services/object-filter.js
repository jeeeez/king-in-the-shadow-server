function objFilter(obj, keys = []) {
	return keys.reduce((prev, key) => {
		prev[key] = obj[key];
		return prev;
	}, {});
}
export default objFilter;
