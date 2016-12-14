/**
 * 用户身份验证 -- [普通用户,管理员用户]
 * @authors Picker Lee (https://github.com/pickerlee)
 * @email   450994392@qq.com
 * @date    2016-10-09 13:34:38
 */

const accountAuth = {
	user: (ctx, next) => {
		// 验证当前用户是否登录
		if (!ctx.session.user) {
			return ctx.customResponse.error('请登录！', 401);
		}
		return next();
	},
	admin: (ctx, next) => {
		// 验证管理员之前需要先验证是否登录
		if (!ctx.session.user) {
			return ctx.customResponse.error('请登录！', 401);
		}

		if (ctx.session.user.role !== 'admin') {
			return ctx.customResponse.error('权限不足', 500);
		}
		return next();
	}
};

export default accountAuth;
