/**
 * 套餐
 * @authors Picker Lee (https://github.com/pickerlee)
 * @email   450994392@qq.com
 * @date    2016-10-09 12:44:02
 */

import G from '../../constants/index';
import router from '../router';

import Plan from '../../models/plan';
import accountAuth from '../../middlewares/auth';
import ParameterValidator from '../../middlewares/parameter-valid';


// 套餐列表
router.get('plans', accountAuth.user, async function(ctx, next) {
	// 查询条件
	const condition = {};

	const user = ctx.session.user;

	// 如果为超级管理员，则返回所有套餐
	// 否则仅返回可使用的套餐列表
	if (user.role === G.accountRoles.member ||
		user.role === G.accountRoles.VIP ||
		user.role === G.accountRoles.admin) {
		condition.state = true;
	}

	const plans = await Plan.getList(condition).sort({ sort: 1 }).exec().catch(error => ctx.customResponse.error(error.message));

	if (plans === undefined) return;

	const resultPlans = plans.map(plan => {
		return {
			id: plan._id,
			name: plan.name,
			price: plan.price,
			state: plan.state
		};
	});
	ctx.customResponse.success(resultPlans);
});


// 添加套餐
router.post('plans',
	accountAuth.superAdmin, // 只有超级管理员才能添加套餐
	// 参数验证
	ParameterValidator.body('name', 'price', 'month'),
	async function(ctx, next) {
		const user = ctx.session.user;

		const { name, price, month, state = true } = ctx.request.body;

		// 判断是否已有同名或相同IP的服务器
		const count = await Plan.count({ name }).catch(error => ctx.customResponse.error(error.message));
		if (count > 0) {
			return ctx.customResponse.error('已有相同名称的套餐存在，不可重复添加');
		}

		const plan = await Plan.create({ name, price, month, state }).catch(error => ctx.customResponse.error(error.message));

		ctx.customResponse.success({
			id: plan._id,
			name: plan.name,
			price: plan.price,
			month: plan.month,
			state: plan.state
		});
	}
);


// 修改某个套餐的具体信息
router.put('plan/:planId', accountAuth.superAdmin,
	async function(ctx, next) {
		const user = ctx.session.user;

		// 检查节点是否存在
		const plan = await Plan.count({ _id: ctx.params.planId }).catch(error => ctx.customResponse.error(error.message));
		if (!plan) return ctx.customResponse.error('节点不存在');

		const updateObj = {};
		Object.keys(ctx.request.body).forEach(curr => {
			if (~['name', 'price', 'month', 'state'].indexOf(curr)) {
				updateObj[curr] = ctx.request.body[curr];
			}
		});

		await Plan.update({ _id: ctx.params.planId }, updateObj).catch(error => ctx.customResponse.error(error.message));

		ctx.customResponse.success(`修改成功`);
	}
);

// 初始化节点（SS用户列表&配置信息）
router.post('node/:nodeId/initialize',
	accountAuth.admin,
	ParameterValidator.params('nodeId'),
	async function(ctx, next) {
		const nodeId = ctx.params.nodeId;

		const result = await ShadowrocksService.initializeServer(nodeId).catch(error => ctx.customResponse.error(error.message));
		if (!result || !result.result) return;
		ctx.customResponse.success('初始化成功');
	}
);
