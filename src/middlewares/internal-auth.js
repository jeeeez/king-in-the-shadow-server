export const internalAuth = (ctx, next) => {

	const { auth } = ctx.request.headers;

	if (auth !== 'INTERNAL') {
		return ctx.customResponse.error('权限不足', 401);
	}

	return next();
};
