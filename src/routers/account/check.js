import router from '../router';
import User from '../../models/user';
// import accountAuth from '../../middlewares/auth';

// 查看用户登录状态
router.get('account/check', async function(ctx, next) {

	// 登录设置用户会话
	const user = ctx.session.user;
	if (!user) return ctx.customResponse.success('未登录');

	ctx.customResponse.success({
		id: user.id,
		email: user.email,
		createDate: user.createDate,
		port: user.port,
		auth: user.auth,
		role: user.role
	});
});
