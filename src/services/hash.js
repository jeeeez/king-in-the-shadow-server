/**
 * 字符串加密
 * @authors Picker Lee (https://github.com/li2274221)
 * @email   450994392@qq.com
 * @date    2016-11-21 20:14:31
 */

import crypto from 'crypto';

export const md5 = (context = '') => {
	const md5 = crypto.createHash('md5');
	md5.update(context);
	return md5.digest('hex');
};

const STR = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// 生成随机字符
const generateRamdomChar = (caseSensitive = true) => {
	const index = Math.floor(Math.random() * STR.length + 1);
	return caseSensitive ? STR[index] : STR[index].toLowerCase();
};

export const generateRamdomString = (length, caseSensitive = true) => {
	return Array.from(new Array(length)).map(() => {
		return generateRamdomChar(caseSensitive);
	}).join('');
};
