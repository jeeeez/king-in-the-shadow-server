import router from '../router';
import uuid from 'node-uuid';

import { md5, generateRamdomString } from '../../services/hash';

import User from '../../models/user';
import InvitationCodeModel from '../../models/invitation-code';

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
		const { email, invitationCode } = ctx.request.body;
		const password = md5(ctx.request.body.password);

		const count = await User.count({ email }).catch(error => {
			return ctx.customResponse.error(error.message);
		});

		if (count >= 1) return ctx.customResponse.error(`邮箱 ${email} 已被注册！`);

		// 验证邀请码的有效性
		if (invitationCode) {
			const invitationCodeCount = await InvitationCodeModel.count({ code: invitationCode, state: 1 }).catch(error => ctx.customResponse.error(error.message));
			if (invitationCodeCount === 0) return ctx.customResponse.error('无效的邀请码');
		}

		// 邮箱验证用的随机字符串签名
		const signature = uuid.v4().replace(/\-/g, '');
		const createDate = +new Date();

		// 获取当前最大的端口号
		const lastUser = await User.getList().sort({ port: -1 }).limit(1).exec();
		const lastPort = lastUser.length ? lastUser[0].port + 1 : 8000;

		// 随机 VPN 密码
		const auth = generateRamdomString(8);

		const user = await User.create({ email, password, createDate, signature, port: lastPort, auth }).catch(error => {
			return ctx.customResponse.error(error.message);
		});

		// 为用户开通 shadowrocks 账户
		const qrcodes = await shadowrocksService.update(lastPort, `ss${lastPort}`).catch(error => {
			return ctx.customResponse.error(error.message);
		});

		// 更新邀请码状态
		if (invitationCode) {
			await InvitationCodeModel.update({ code: invitationCode }, {
				state: 0,
				inviteeId: user._id,
				consumeDate: +new Date()
			}).catch(error => ctx.customResponse.error(error.message));
		}

		ctx.session.user = user;

		ctx.customResponse.success({
			id: user._id,
			email: user.email,
			createDate: user.createDate,
			port: user.port,
			auth: user.auth,
			qrcodes,
			token: ctx.session.token
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
