import router from '../router';
import User from '../../models/user';
import { md5 } from '../../services/hash';
import accountAuth from '../../middlewares/auth';
import ShadowrocksService from '../../services/shadowrocks';

// 查看用户登录状态
router.put('account/update', accountAuth.user, async function(ctx, next) {
	const user = ctx.session.user;
	const { password, newAuth, newPassword } = ctx.request.body;

	if (newAuth && newPassword) {
		return ctx.customResponse.error('不能同时修改登录密码和VPN密码');
	}

	if (!newAuth && !newPassword) {
		return ctx.customResponse.error('请指定修改登录密码或VPN密码');
	}

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

	if (newPassword) {
		user.password = updateObj.password;
		return ctx.customResponse.success('修改成功');
	} else if (newAuth) {
		user.auth = updateObj.auth;
		const serverUpdateResults = await ShadowrocksService.updateOnePort(user.port, newAuth).catch(error => {
			return ctx.customResponse.error(error.message);
		});
		if (!serverUpdateResults) return;
		ctx.customResponse.success(serverUpdateResults);
	} else {
		ctx.customResponse.success('虽然我不知道你要修改什么鬼，但是看上去是成了！');
	}
});
