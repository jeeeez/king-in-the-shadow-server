import router from '../router';
import User from '../../models/user';

// 查看用户登录状态
router.get('account/check', async function(ctx, next) {

	// 登录设置用户会话
	const user = ctx.session.user;
	if (!user) {
		return ctx.customResponse.error('未登录！', 500);
	}

	ctx.customResponse.success({
		id: user._id,
		email: user.email,
		createDate: user.createDate,
		port: user.port,
		auth: user.auth
	});
});
