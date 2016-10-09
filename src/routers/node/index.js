/**
 * 服务器节点
 * @authors Picker Lee (https://github.com/li2274221)
 * @email   450994392@qq.com
 * @date    2016-10-09 12:44:02
 */

import router from '../router';

import Node from '../../models/node';
import accountAuth from '../../middlewares/auth';
import ParameterValidator from '../../middlewares/parameter-valid';

// 节点列表
router.get('nodes', accountAuth.user, async function(ctx, next) {
	const nodes = await Node.getList({ state: true }).catch(error => ctx.customResponse(error.message));

	ctx.customResponse.success(nodes);
});


// 创建节点
router.post('nodes', //accountAuth.admin,
	// 参数验证
	ParameterValidator.body('name', 'host', 'protocol'),
	async function(ctx, next) {
		const { name, host, protocol, state = true } = ctx.request.body;
		const node = await Node.create({ name, host, protocol, state }).catch(error => ctx.customResponse(error.message));

		ctx.customResponse.success(node);
	});

// 获取某个节点的具体信息
router.get('node/:nodeId', accountAuth.user, async function(ctx, next) {

});
