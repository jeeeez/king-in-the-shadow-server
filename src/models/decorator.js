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

// inset one or more documents and returns a document containing the status of all inserts
const insert = Constructor => {
	return target => {
		target.prototype.insert = data => Constructor.insert(data);
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

const updateAll = Constructor => {
	return target => {
		target.prototype.updateAll = (params, data) => Constructor.update(params, data, {
			multi: true
		});
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
		instance(Constructor)(target);
		count(Constructor)(target);
		create(Constructor)(target);
		insert(Constructor)(target);
		save(Constructor)(target);
		update(Constructor)(target);
		updateAll(Constructor)(target);
		get(Constructor)(target);
		getList(Constructor)(target);
	};
};
export default {
	instance,
	count,
	create,
	insert,
	save,
	update,
	updateAll,
	get,
	getList,
	ALL
};
