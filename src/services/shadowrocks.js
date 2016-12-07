/**
 * 增/删/改/查 shadowrocks 用户
 * @authors Picker Lee (https://github.com/li2274221)
 * @email   450994392@qq.com
 * @date    2016-10-08 14:48:15
 */

import SSH2 from 'ssh2';
import Node from '../models/node';
import User from '../models/user';

let ServerList;

const makeServerSSHConfig = server => {
	return {
		id: server._id,
		name: server.name,
		host: server.host,
		port: server.port,
		username: server.username,
		privateKey: require('fs').readFileSync(server.privateKeyPath).toString()
	};
};

// 获取VPN服务器列表
const fetchServerList = (refresh = false) => {
	if (!refresh && ServerList) {
		return Promise.resolve(ServerList);
	}
	return Node.getList({ state: true }).then(servers => {
		ServerList = servers.map(server => {
			return makeServerSSHConfig(server);
		});
		return ServerList;
	}).catch(error => console.log(error));
};

// 在VPN服务器上执行脚本
const executeShadowsocksBash = (server, commandStr) => {
	const serverSSHConfig = server.privateKey ? server : makeServerSSHConfig(server);
	return new Promise((resolve, reject) => {
		const connect = new SSH2.Client();
		connect.on('ready', () => {
			// 请确保目标服务器已下载好配置脚本
			connect.exec(commandStr, (error, stream) => {
				if (error) {
					return reject(error);
				}
				stream.on('close', (code, signal) => {
					console.log('close connect');
					connect.end();
					resolve({ result: true });
				}).on('data', data => {
					console.log(`data:${data.toString()}`);
				}).stderr.on('data', data => {
					console.log(`error:${data.toString()}`);
					reject({ message: data.toString() });
				});
			});
		}).on('error', error => {
			reject(error);
		}).connect(serverSSHConfig);
	});
};

// 初始化某台VPN服务器
const initializeServer = serverId => {
	return Node.get({ _id: serverId }).then(server => {
		if (!server) return Promise.reject({ message: '服务器不存在' });
		if (!server.state) return Promise.reject({ message: '服务器不可用' });

		return User.getList({}).then(users => {
			const config = {};
			users.forEach(user => {
				config[user.port] = user.auth;
			});

			return executeShadowsocksBash(server, `node /root/shadowrocks/initialize.js '${JSON.stringify(config)}'`);
		});
	});
};

// 更新某个端口的VPN配置，针对所有服务器
const updateOnePort = (port, password) => {
	return Promise.all(ServerList.map(server => {
		const serverInfo = { id: server.id, name: server.name, host: server.host };
		return executeShadowsocksBash(server, `node /root/shadowrocks/add-port-password.js ${port} ${password}`).then(() => {
			return Promise.resolve({ result: 'SUCCESS', server: serverInfo });
		}).catch(error => {
			return Promise.resolve({ result: 'ERROR', message: error.message, server: serverInfo });
		});
	})).then(results => {
		return results;
	});
};

fetchServerList();

export default {
	fetchServerList,
	initializeServer,
	updateOnePort
};
