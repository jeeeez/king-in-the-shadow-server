import router from '../router';
import User from '../../models/user';
import { md5 } from '../../services/hash';
import accountAuth from '../../middlewares/auth';

// 查看用户登录状态
router.put('account/update', accountAuth.user, async function(ctx, next) {
	const user = ctx.session.user;
	const { password, newAuth, newPassword } = ctx.request.body;

	if (md5(password) !== user.password) {
		return ctx.customResponse.error('登录密码错误！');
	}

	const updateObj = {};
	if (newAuth) updateObj.auth = newAuth;

	if (newPassword) updateObj.password = md5(newPassword);

	const result = await User.update({ _id: user._id }, updateObj).catch(error => {
		return ctx.customResponse.error(error.message);
	});
	if (result === undefined) return;

	if (newAuth) user.auth = updateObj.auth;
	if (newPassword) user.password = updateObj.password;

	ctx.customResponse.success('修改成功！');
});
