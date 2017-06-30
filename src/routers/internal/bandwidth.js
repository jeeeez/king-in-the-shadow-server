import router from '../router';
import Bandwidth from '../../models/bandwidth';
import { isAdmin } from '../../util/role';

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

	if (!isAdmin(port)) {
		return ctx.customResponse.error('权限不足');
	}


	const query = {
		port
	};

	const bandwidthList = await Bandwidth.getList(query).then().catch(error => {
		ctx.customResponse.error(error.message)
	});
});
