/**
 * 服务器节点
 * @authors Picker Lee (https://github.com/li2274221)
 * @email   450994392@qq.com
 * @date    2016-10-09 12:44:02
 */

import router from '../router';

import Node from '../../models/node';
import accountAuth from '../../middlewares/auth';
import ShadowrocksService from '../../services/shadowrocks';
import ParameterValidator from '../../middlewares/parameter-valid';

// 节点列表
router.get('nodes', accountAuth.user, async function(ctx, next) {
	const condition = { state: true, ...ctx.request.params };

	const user = ctx.session.user;
	const nodes = await Node.getList(condition).sort({ sort: -1 }).exec().catch(error => ctx.customResponse.error(error.message));

	if (nodes === undefined) return;

	const resultNodes = nodes.map(node => {
		return {
			id: node._id,
			name: node.name,
			host: node.host,
			port: node.port,
			username: node.username,
			privateKeyPath: node.privateKeyPath,
			state: node.state,
			protocol: node.protocol,
			URI: '/api/qrcode?context=ss://' + new Buffer(`${node.protocol}:${user.auth}@${node.host}:${user.port}`).toString('base64')
		};
	});
	ctx.customResponse.success(resultNodes);
});


// 创建节点
router.post('nodes',
	accountAuth.admin, // 只有管理员才能添加节点
	// 参数验证
	ParameterValidator.body('name', 'host', 'port', 'username', 'protocol', 'privateKeyPath'),
	async function(ctx, next) {
		const user = ctx.session.user;

		const { name, host, port, username, protocol, privateKeyPath, sort, state = true } = ctx.request.body;

		// 判断是否已有同名或相同IP的服务器
		const count = await Node.count({ $or: [{ name }, { host }] }).catch(error => ctx.customResponse.error(error.message));
		if (count > 0) {
			return ctx.customResponse.error('已有相同名称或IP的服务器存在，不可重复添加');
		}

		const node = await Node.create({ name, host, port, username, protocol, privateKeyPath, state, sort }).catch(error => ctx.customResponse.error(error.message));

		ctx.customResponse.success({
			id: node._id,
			name: node.name,
			host: node.host,
			port: node.port,
			username: node.username,
			privateKeyPath: node.privateKeyPath,
			state: node.state,
			protocol: node.protocol,
			URI: '/api/qrcode?context=ss://' + new Buffer(`${node.protocol}:${user.auth}@${node.host}:${user.port}`).toString('base64')
		});
	}
);


// 修改某个节点的具体信息
router.put('node/:nodeId', accountAuth.admin,
	async function(ctx, next) {
		const user = ctx.session.user;

		// 检查节点是否存在
		const node = await Node.count({ _id: ctx.params.nodeId }).catch(error => ctx.customResponse.error(error.message));
		if (!node) return ctx.customResponse.error('节点不存在');

		const updateObj = {};
		Object.keys(ctx.request.body).forEach(curr => {
			if (~['name', 'host', 'port', 'username', 'protocol', 'privateKeyPath', 'sort'].indexOf(curr)) {
				updateObj[curr] = ctx.request.body[curr];
			}
		});

		await Node.update({ _id: ctx.params.nodeId }, updateObj).catch(error => ctx.customResponse.error(error.message));

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
