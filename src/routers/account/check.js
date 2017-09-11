import router from '../router';
import User from '../../models/user';
import ResponseUtils from '../../utils/response';

// 查看用户登录状态
router.get('account/check', async function(ctx, next) {
	// 当前用户会话信息
	const user = ctx.session.user;
	if (!user) return ctx.customResponse.success('未登录');

	const responseKeys = ['id', 'email', 'createDate', 'port', 'auth', 'role', 'expireDate'];
	ctx.customResponse.success(ResponseUtils.entity(user, responseKeys));
});
