// 获取某月的最开始时间
export function getMonthStartDate(month) {
	const now = new Date();

	const year = now.getFullYear();
	const date = 1;

	month = (month || now.getMonth()) + 1;

	return new Date(`${year}/${month}/${date} 00:00:00`).getTime();
}
