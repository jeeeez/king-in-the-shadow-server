const instance = Constructor => {
	return target => {
		target.prototype.instance = params => new Constructor(params);
	};
};

const count = Constructor => {
	return target => {
		target.prototype.count = params => Constructor.count(params);
	};
};

const create = Constructor => {
	return target => {
		target.prototype.create = data => Constructor.create(data);
	};
};

const save = Constructor => {
	return target => {
		target.prototype.save = params => new Constructor(params).save();
	};
};

const update = Constructor => {
	return target => {
		target.prototype.update = (params, data) => Constructor.findOneAndUpdate(params, data);
	};
};

const get = Constructor => {
	return target => {
		target.prototype.get = params => Constructor.findOne(params);
	};
};

const getList = Constructor => {
	return target => {
		target.prototype.getList = (params, opts) => Constructor.find(params, null, opts);
	};
};

const ALL = Constructor => {
	return target => {
		getList(Constructor)(target);
	};
};
export default { instance, count, create, save, update, get, getList, ALL };
