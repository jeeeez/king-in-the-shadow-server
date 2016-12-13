import router from '../router';
import uuid from 'node-uuid';
import accountAuth from '../../middlewares/auth';
import InvitationCode from '../../models/invitation-code';

import CONFIG from '../../constants/config';

// 查看今日邀请码
router.get('account/invitation-codes', accountAuth.user, async function(ctx, next) {
	const user = ctx.session.user;

	const today = new Date();
	const todayStart = +new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const todayEnd = todayStart + 1 * 24 * 60 * 60 * 1000 - 1;
	const invitationCodes = await InvitationCode.getList({
		inviterId: user._id,
		createDate: { $gt: todayStart, $lt: todayEnd }
	}).catch(error => ctx.customResponse.error(error.message));

	if (!invitationCodes) return;

	ctx.customResponse.success(invitationCodes.map(invitationCode => {
		return {
			code: invitationCode.code,
			state: invitationCode.state,
			createDate: invitationCode.createDate,
			consumeDate: invitationCode.consumeDate,
			inviteeId: invitationCode.inviteeId
		};
	}));
});


// 创建邀请码
router.post('account/invitation-codes', accountAuth.user, async function(ctx, next) {
	const user = ctx.session.user;

	const today = new Date();
	const todayStart = +new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const todayEnd = todayStart + 1 * 24 * 60 * 60 * 1000 - 1;

	const count = await InvitationCode.count({
		inviterId: user._id,
		createDate: { $gt: todayStart, $lt: todayEnd }
	}).catch(error => ctx.customResponse.error(error.message));

	if (count >= CONFIG.maxInvitationAmount) {
		return ctx.customResponse.error(`每日最多能创建${CONFIG.maxInvitationAmount}个邀请码，今日邀请码额度已用完`);
	}

	const code = await createInvitationCode().catch(error => ctx.customResponse.error(error.message));
	const createDate = +new Date();
	const codeEntity = InvitationCode.create({
		code,
		createDate,
		inviterId: user._id,
		state: 1
	}).catch(error => ctx.customResponse.error(error.message));

	ctx.customResponse.success({ code, createDate, state: 1 });
});

/**
 * 创建邀请码，确保唯一性
 */
function createInvitationCode() {
	const code = uuid.v4().split('-')[4];
	return InvitationCode.count({ code }).then(count => {
		if (count > 0) {
			return createInvitationCode();
		} else {
			return Promise.resolve(code);
		}
	});
}
