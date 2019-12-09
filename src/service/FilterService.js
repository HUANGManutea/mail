import {generateUrl} from '@nextcloud/router'
import Axios from '@nextcloud/axios'
import {filterToText} from '../util/Filter'

export const getFiltersByAccount = accountId => {
	const url = generateUrl('/apps/backupmail/api/filter/getByAccount')
	return Axios.post(url, {accountId: accountId})
		.then(resp => resp.data)
		.then(filters => filters.map(filterToText))
}

export const createFilter = ({accountId, clientTag, step, destination}) => {
	const url = generateUrl('/apps/backupmail/api/filter')
	return Axios.post(url, {
		accountId: accountId,
		clientTag: clientTag,
		step: step,
		destination: destination,
	})
		.then(resp => resp.data)
		.then(filter => {
			return filterToText(filter)
		})
}

export const updateFilter = ({id, accountId, clientTag, step, destination}) => {
	const url = generateUrl('/apps/backupmail/api/filter')
	return Axios.put(url, {
		id: id,
		accountId: accountId,
		clientTag: clientTag,
		step: step,
		destination: destination,
	})
		.then(resp => resp.data)
		.then(filter => {
			return filterToText(filter)
		})
}

export const deleteFilter = id => {
	const url = generateUrl('/apps/backupmail/api/filter')
	return Axios.delete(url, {id: id}).then(resp => resp.data)
}

export const getDestFromTag = ({accountId, tag}) => {
	const url = generateUrl('/apps/backupmail/api/filter/getDestFromTag')
	return Axios.post(url, {
		accountId: accountId,
		tag: tag,
	}).then(resp => resp.data)
}
