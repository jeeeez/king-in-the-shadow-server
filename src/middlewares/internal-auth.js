export const internalAuth = (ctx, next) => {
	const { AUTH } = ctx.reqest.headers;

	if (AUTH !== 'INTERNAL') {
		return ctx.customResponse.error('权限不足', 401);
	}

	return next();
};
