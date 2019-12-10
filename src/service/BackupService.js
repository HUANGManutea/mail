import {generateUrl} from '@nextcloud/router'
import Axios from '@nextcloud/axios'
import {filterToText} from '../util/Filter'

// Accounts
export const createBackupAccount = accountId => {
	const url = generateUrl('/apps/backupmail/api/account')
	return Axios.post(url, {extMailId: accountId}).then(resp => resp.data)
}

// filters
export const getFilters = accountId => {
	const url = generateUrl('/apps/backupmail/api/filter/getByAccount')
	return Axios.post(url, {accountId: accountId})
		.then(resp => resp.data)
		.then(filters => filters.map(filterToText))
}
