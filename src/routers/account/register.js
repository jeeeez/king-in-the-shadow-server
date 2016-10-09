import router from '../router';
import uuid from 'node-uuid';

import User from '../../models/user';
import shadowrocksService from '../../services/shadowrocks';
import Validator from '../../services/validator';
import ParameterValidator from '../../middlewares/parameter-valid';

// 注册用户
router.post('account/register',
	ParameterValidator.body({
		email: { required: '邮箱不能为空！', notEmpty: '邮箱不能为空！', email: '邮箱格式不正确！' },
		password: { required: '密码不能为空！', notEmpty: '密码不能为空！', pattern: /^[\S]{6,12}$/ }
	}),
	async function(ctx, next) {
		const { email, password } = ctx.request.body;

		const count = await User.count({ email }).catch(error => {
			return ctx.customResponse.error(error.message);
		});

		if (count >= 1) return ctx.customResponse.error(`邮箱 ${email} 已被注册！`);

		// 邮箱验证用的随机字符串签名
		const signature = uuid.v4().replace(/\-/g, '');
		const createDate = +new Date();

		// 获取当前最大的端口号
		const lastUser = await User.getList().sort({ port: -1 }).limit(1).exec();
		const lastPort = lastUser.length ? lastUser[0].port + 1 : 8000;

		const user = await User.create({ email, password, createDate, signature, port: lastPort, auth: `ss${lastPort}` }).catch(error => {
			return ctx.customResponse.error(error.message);
		});

		// 为用户开通 shadowrocks 账户
		const qrcodes = await shadowrocksService.update(lastPort, `ss${lastPort}`).catch(error => {
			return ctx.customResponse.error(error.message);
		});

		ctx.session.user = user;

		ctx.customResponse.success({
			id: user._id,
			email: user.email,
			createDate: user.createDate,
			port: user.port,
			auth: user.auth,
			qrcodes
		});

	});


// 用户邮箱验证
router.get('/account/:signature/validate', async function(ctx, next) {
	const signature = ctx.params.signature;

	const user = await User.findOne({ signature }).catch(error => {
		return ctx.customResponse.error(error.message);
	});

	if (!user) return ctx.customResponse.error('无效的验证码！');

	if (user.validated) return ctx.customResponse.error('当前账户已验证成功！');

	await User.update({ _id: user._id }, {
		validated: true,
		validateDate: +new Date()
	}).catch(error => ctx.customResponse.error(error.message));

	ctx.customResponse.success(`注册成功`);
});
