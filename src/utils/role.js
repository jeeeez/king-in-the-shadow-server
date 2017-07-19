import G from '../constants';

export function isAdmin(role) {
	return role === G.accountRoles.admin || role === G.accountRoles.superAdmin;
}
