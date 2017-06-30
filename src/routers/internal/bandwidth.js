import router from '../router';
import Bandwidth from '../../models/bandwidth';
import { isAdmin } from '../../utils/role';
import { getMonthStartDate } from '../../utils/date';
import { internalAuth } from '../../middlewares/internal-auth';

/**
 * 查看用户所使用的流量数据
 * 关于权限有如下几种情况
 * 1、普通用户仅能看到自己的数据
 * 2、管理员可看到所有人的数据
 */
router.get('bandwidth/:port', async function(ctx, next) {
	// 当前用户会话信息
	const user = ctx.session.user;
	if (!user) return ctx.customResponse.error('未登录', 401);

	const port = ctx.params.port;

	if (!isAdmin(port) && port !== user.port) {
		return ctx.customResponse.error('权限不足');
	}

	// 查询当月流量使用情况
	const query = {
		port,
		createDate: {
			$gte: getMonthStartDate(),
			$lte: getMonthStartDate(new Date().getMonth() + 1) - 1
		}
	};

	const bandwidthList = await Bandwidth.getList(query).then().catch(error => {
		ctx.customResponse.error(error.message)
	});

	if (bandwidthList === undefined) return;

	// 整合每条记录到一个集合数据
	const result = bandwidthList.reduce((accu, record) => {
		accu.total += record.input + record.output;
		const nodeRecord = (accu.data[record.nodeId] || { input: 0, output: 0 });
		nodeRecord.input += record.input;
		nodeRecord.output += record.output;
		return accu;
	}, { total: 0, data: {} });

	ctx.customResponse.success(result);
});

// 导入流量使用信息
router.post('bandwidth/import', internalAuth, async function(ctx, next) {
	const { input, output, nodeId } = ctx.request.body;

	const record = {};

	Object.keys(input).concat(Object.keys(output)).forEach(port => {
		const data = record[port] || {};
		data.input = input[port];
		data.output = output[port];
		record[port] = data;
	});
	const documents = Object.keys(record).map(port => {
		return Bandwidth.instance({
			port,
			nodeId,
			...record[port]
		});
	});

	const results = await Bandwidth.insert(documents).then(res => {
		console.log(res);
	}).catch(error => ctx.customResponse.error('操作失败'));
});
