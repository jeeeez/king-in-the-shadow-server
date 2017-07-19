/**
 * 验证接口参数的合理性
 * @authors Picker Lee (https://github.com/jeezlee)
 * @email   450994392@qq.com
 * @date    2016-10-09 14:13:15
 */

import Validator from '../services/validator';


// 验证 [obj] 中的 [key] 属性是否满足要求
const validate = (obj, key, opts = { required: true }) => {
	const value = obj[key];

	if (opts.required && !obj.hasOwnProperty(key)) {
		return Validator.string(opts.required) ? opts.required : `${key} is required.`;
	}

	if (opts.notEmpty && Validator.empty(value)) {
		return Validator.string(opts.notEmpty) ? opts.notEmpty : `${key} mustn't be empty.`;
	}

	if (opts.pattern && !opts.pattern.test(value)) {
		return `Invalidate ${key}.`;
	}
};

const validatorCreator = type => {
	return (...props) => {
		return (ctx, next) => {
			let obj;
			if (type === 'body') {
				obj = ctx.request.body || {};
			} else if (type === 'params') {
				obj = ctx.params || {};
			}
			const messages = [];

			props.forEach(key => {
				if (Validator.string(key)) {
					valid(key, { required: true });
				} else {
					Object.keys(key).forEach(key2 => {
						valid(key2, key[key2]);
					});
				}

			});
			if (messages.length > 0) {
				return ctx.customResponse.error(messages.join(','), 400);
			}
			return next();

			function valid(key, opts) {
				const result = validate(obj, key, opts);
				result && (messages.push(result));
			}
		};
	};
};


export default {
	body: validatorCreator('body'),
	params: validatorCreator('params')
};
