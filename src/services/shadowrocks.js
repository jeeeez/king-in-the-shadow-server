/**
 * 增/删/改/查 shadowrocks 用户
 * @authors Picker Lee (https://github.com/li2274221)
 * @email   450994392@qq.com
 * @date    2016-10-08 14:48:15
 */

import SSH2 from 'ssh2';

const exec = require('child_process').exec;
const serverList = [{
	// ssh: 'www.pickerlee.com',
	host: '23.105.209.85',
	port: '27014',
	username: 'root',
	// privateKey: require('fs').readFileSync('/Users/picker/.ssh/id_rsa').toString()
	privateKey: ''
}];

export default {
	update: (port, password) => {
		return Promise.all(updatePromise2(port, password)).then(v => {
			console.log(v);
		}).catch(error => {
			console.log(error);
		});
	}
};

const updatePromise = (port, password) => {
	return serverList.map(server => {
		return new Promise((resolve, reject) => {
			const connect = new SSH2.Client();
			connect.on('ready', () => {
				// 请确保目标服务器已下载好配置脚本
				connect.exec(`node /root/shadowrocks/add-port-password.js ${port} ${password}`, (error, stream) => {
					if (error) {
						reject({ result: false, error });
					}
					stream.on('close', (code, signal) => {
						console.log('close connect');
						connect.end();
					}).on('data', data => {
						const qrcodeStr = new Buffer(`rc4-md5:ss${password}@${server.host}:${port}`).toString('base64');
						resolve({ result: true, qrcodeStr });
					}).stderr.on('data', data => {
						console.log(`error:${data.toString()}`);
						reject({ result: false, error: data.toString() });
					});
				});
			}).connect(server);
		});
	});
};
console.log(updatePromise);

const updatePromise2 = (port, password) => {
	return serverList.map(server => {
		return new Promise((resolve, reject) => {
			// 请确保目标服务器已下载好配置脚本
			exec(`node /root/shadowrocks/add-port-password.js ${port} ${password}`, (error, stream) => {
				if (error) {
					reject({ result: false, error });
				}

				const qrcodeStr = new Buffer(`rc4-md5:ss${password}@${server.host}:${port}`).toString('base64');
				resolve({ result: true, qrcodeStr });
			});
		});
	});
};
