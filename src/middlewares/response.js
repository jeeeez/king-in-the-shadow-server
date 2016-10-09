const error = message => {
	return {
		status: 'ERROR',
		message,
		time: +new Date()
	};
};

const success = data => {
	return {
		status: 'OK',
		result: data,
		time: +new Date()
	};
};


const customResponse = (ctx, next) => {
	ctx.customResponse = {
		success(data, status = 200) {
			ctx.response.status = status;
			ctx.response.body = success(data);
		},

		error(message, status = 500) {
			ctx.response.status = status;
			ctx.response.body = error(message);
		}
	};
	return next();
};


export default customResponse;
