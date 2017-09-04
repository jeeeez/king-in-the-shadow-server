import router from '../router';
import uuid from 'node-uuid';

import EmailSender from '../../services/email/index.js';

import { md5, generateRamdomString } from '../../services/hash';

import G from '../../constants';

import User from '../../models/user';
import InvitationCodeModel from '../../models/invitation-code';

import ShadowrocksService from '../../services/shadowrocks';
import Validator from '../../services/validator';
import ParameterValidator from '../../middlewares/parameter-valid';

/**
 * 用户注册
 * 流程：
 * 1. 用户提交 邮箱和密码
 * 2. 验证该邮箱是否已经被注册
 * 3. 创建账户（未开通VPN服务）
 * 4. 发送邮件至用户邮箱
 * 5. 用户点击验证邮箱后开通VPN服务
 */
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

		if (count === undefined) return;

		if (count >= 1) return ctx.customResponse.error(`邮箱 ${email} 已被注册！`);

		// 验证邀请码的有效性
		if (invitationCode) {
			const invitationCodeCount = await InvitationCodeModel.count({ code: invitationCode, state: 1 }).catch(error => ctx.customResponse.error(error.message));

			if (invitationCodeCount === undefined) return;

			if (invitationCodeCount === 0) return ctx.customResponse.error('无效的邀请码');
		}

		// 邮箱验证用的随机字符串签名
		const signature = uuid.v4().replace(/\-/g, '');
		const createDate = +new Date();

		const user = await User.create({ email, password, createDate, signature }).catch(error => {
			return ctx.customResponse.error(error.message);
		});
		if (user === undefined) return;

		// 更新邀请码状态
		if (invitationCode) {
			await InvitationCodeModel.update({ code: invitationCode }, {
				state: 0,
				inviteeId: user.id,
				consumeDate: +new Date()
			}).catch(error => ctx.customResponse.error(error.message));
		}

		// 发送注册邮件
		const emailHTML = `<p>尊敬的用户，您好</p>
						<p>欢迎使用非匠VPN服务，点击<a href="${G.origin}/api/account/${signature}/validate">链接</a>即可完成非匠的注册！</p>`;
		EmailSender.sender(email, '用户注册', emailHTML);

		ctx.session.user = user;

		ctx.customResponse.success({
			id: user.id,
			email: user.email,
			createDate: user.createDate,
			port: user.port,
			auth: user.auth,
			token: ctx.session.token,
			expire: ctx.session.expire
		});
	});


/**
 * 用户邮箱验证
 * 1. 设置账户为已验证状态
 * 2. 邮箱验证后开通VPN服务
 */
router.get('account/:signature/validate', async function(ctx, next) {
	const signature = ctx.params.signature;

	const user = await User.get({ signature }).catch(error => {
		return ctx.customResponse.error(error.message);
	});

	if (!user) return ctx.customResponse.error('无效的验证码！');

	if (user.validated) return ctx.customResponse.error('当前账户已验证成功！');

	// 获取当前最大的端口号
	const lastUser = await User.getList().sort({ port: -1 }).limit(1).exec();
	if (lastUser === undefined) return;
	const lastPort = lastUser.length ? lastUser[0].port : 8000;

	const port = lastPort + 1;

	// 随机 VPN 密码
	const auth = generateRamdomString(8);

	await User.update({ _id: user.id }, {
		port,
		auth,
		validated: true,
		validateDate: +new Date()
	}).then(() => {
		ctx.customResponse.success('注册成功');

		// 为用户开通 shadowrocks 账户
		ShadowrocksService.updateOnePort(port, auth).catch(error => {
			// return ctx.customResponse.error(error);
		});
	}).catch(error => ctx.customResponse.error(error.message));
});
