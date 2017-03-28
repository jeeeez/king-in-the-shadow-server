import https from 'https';
import crypto from 'crypto';
import qs from 'querystring';
import dateFormatter from 'date-formatter/dist/date-formatter';

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA6HdaLEuVhISKVPjyr3WBtDWxOpylkoYfX11xjRz6cwSkmZXJ
kcbbI/L4jyoD5uBg37SnMOgLo/n3ob04QeY47GGzLMSqME5GE/tk7vuFn5dX9fpR
8OlenKACtWRhfQHpiKMZwGngzDyOddfQglVwwjZ9/iZRoHigZ0v0YaU7kHSmlRLc
cicHM9d7iiCVissOWSaVJ0IFuXOinTV5KaQSUNEeOW3TDoXWALZrLh3qyyeZwrf1
7pToyZ4WhMcZ/vS+2KtD7QdWPBweYOWVnz2MxYQd3ABxu5XUCMScMCaGLi7H1NDy
Spc2tNgufRw7Gycx1tcEC3T8UTWLO7eQn63qPQIDAQABAoIBAQCNZBKXgH13dXoB
xs0tBQaXylR6ds6J+UPZqCcpkieOj5NhyuYn4VBmZCDkSsTGx1CEoAdUyr5RxPbm
DAXMpy+WLrJhF1kAOouLGcvBQ4B5mf6pINB3/ClMkFI1a9GTy/bz4WgHTR6qemaX
rGUo8Li9l5E4ZKwfM180lNEWFv7Mk83T5eHHrGVyYXPfUDqABPtV9lQnZmsEbBg4
BpHm92jwuheG7TEOI0RHfu7/5V6VK74gWo7VzcV7H8ZrAEmI/UA6RqNoxyyvTAlN
dSzbd7vu5H2g6FI1dNxdmg2qJOBQhLMDALumfQaBYNMs5K1oDnaP7btH43znBSzr
XVv68D+NAoGBAPx+x+/nWHl2EDZ0wSv1Lbj7cVr23NZYJkS0cLouoGhWOsShsvPX
/rC0m1/lUgEq6vbaaCkXZ3fKwDYSKk9sMuo4I3JPAJozgkcImnd55x+7mbH11pR8
f1v1dswhJ9D0Q60DQKIIjonrB/tTBduXTCJmvQQVqzoRvlq3o3Aj+tarAoGBAOux
ZmGn8ZsdMGHerFVvn5xxM6moEkvEi6pl9csxPGY6nHZe+KlBymQfNleYbk+II2No
zhgEkq5UUgb9TecMTQbIMHBUUElNYsDMpLuVt8rIAdV6uzhFeJprQuZFqILT6aFx
9NGOmlOk223O8wDj7ZDBUp4eWLboxS0VO+rXk2K3AoGBAOxx4NMkZnKff8EvBnIe
j6mJNPaE8/p446U0/9cpsKbkEPZvob+9BdD93/4mJevX/94YWrAYLZk9MU+xJRPo
86jn1zHFD4BXOelBAj1d13Sc3emLmFzGVRGNRKkVZ07CXtmWkSDrOGeow3mznmmr
Pe19HgXEMOsZEJOtIgzydIQvAoGADq/7ZVKF59ilzzOFIb3XAHS9d3EV0srouTGp
Y4Qp82TroyS/8iw7ZIndZRAGr8YYDnXVggGm8l4mznCyjhdiJW4MNrPKXQcJhGI8
UcQ+s9BK7Pa8/AC4R0cv4BGvMpfqEzl6vCRa0aOQWQNweTm68C5b66aQeLWAtBKC
rVvJv3kCgYAGVzL61fTEWRMqLKhs7W6Bgz8n0VIxtI8i2GyyfIQJEQf04eR3PAFX
ixK0gfeEZptcSSoxCxNuz6DFEpf839vnuVxB5wQfC4K1Nds7tKVYqSm/WJaWE2ch
QT99yr30/xmD3HLYzJOfWUUPvWCKCWEW6hSpFK9jPRjb/3IDICj8eg==
-----END RSA PRIVATE KEY-----`;

const PARAMS = {
	app_id: '2016073000127661',
	method: 'alipay.trade.wap.pay',
	charset: 'utf-8',
	sign_type: 'RSA2',
	timestamp: '2017-03-08 21:10:50',
	version: '1.0',
	biz_content: {
		"subject": "HAHA",
		"out_trade_no": "70501111111S001111119",
		"total_amount": '9.00',
		"product_code": "QUICK_WAP_PAY"
	}
};

const create = ({ subject, out_trade_no, total_amount }) => {
	const params = {
		...PARAMS,
		timestamp: dateFormatter(new Date(), 'yyyy-MM-dd hh:mm:ss'),
		biz_content: {
			subject,
			out_trade_no,
			total_amount,
			product_code: 'QUICK_WAP_PAY'
		}
	};

	// 待签名内容
	// 将参数按参数名从小到大排序，生成[key=value]格式的字符串并用&连接
	const signatureKey = Object.keys(params).sort().map(key => {
		const value = key === 'biz_content' ? JSON.stringify(params[key]) : params[key];
		return `${key}=${value}`
	}).join('&');
	const sign = crypto.createSign('RSA-SHA256');
	sign.update(signatureKey);

	const signature = sign.sign(privateKey, 'base64');
	// console.log('签名：' + signature);

	const query = { sign: encodeURI(signature) };
	Object.keys(params).forEach(function(key) {
		if (key === 'timestamp') {
			query.timestamp = params[key];
		} else if (key === 'biz_content') {
			const content = {};
			Object.keys(params.biz_content).forEach(function(k) {
				content[k] = params.biz_content[k]; //encodeURI(params.biz_content[k]);
			});
			query.biz_content = JSON.stringify(content);
		} else {
			query[key] = encodeURI(params[key]);
		}
	});

	const postData = qs.stringify(query);

	return new Promise((resolve, reject) => {
		const req = https.request({
			hostname: 'openapi.alipaydev.com',
			path: '/gateway.do',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		}, function(res) {
			res.setEncoding('utf-8');
			if (res.statusCode === 302) {
				resolve(res.headers.location);
			} else {
				reject(new Error('something wrong'));
			}

			// console.log('STATUS: ' + res.statusCode);
			// console.log('HEADERS: ' + JSON.stringify(res.headers));
			// res.on('data', function(chunk) {
			// 	console.log('BODY: ' + chunk);
			// });

			res.on('error', function(error) {
				reject(error);
			});
		});
		req.write(postData);
		req.end();
	});
};

export default { create };
