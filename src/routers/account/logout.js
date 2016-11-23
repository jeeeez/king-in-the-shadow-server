import router from '../router';
import User from '../../models/user';
import accountAuth from '../../middlewares/auth';

// 查看用户登录状态
router.post('account/logout', accountAuth.user, async function(ctx, next) {
	ctx.session.user = undefined;
	ctx.customResponse.success('登出成功！', 200);
});
