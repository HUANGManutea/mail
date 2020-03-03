import {generateUrl} from '@nextcloud/router'
import axios from '@nextcloud/axios'
import {curry, map} from 'ramda'

import {parseErrorResponse} from '../http/ErrorResponseParser'
import {convertAxiosError} from '../errors/convert'

const amendEnvelopeWithIds = curry((accountId, folderId, envelope) => ({
	accountId,
	folderId,
	uid: `${accountId}-${folderId}-${envelope.id}`,
	...envelope,
}))

export function fetchEnvelope(accountId, folderId, id) {
	const url = generateUrl('/apps/mail/api/accounts/{accountId}/folders/{folderId}/messages/{id}', {
		accountId,
		folderId,
		id,
	})

	return axios
		.get(url)
		.then(resp => resp.data)
		.catch(error => {
			if (error.response && error.response.status === 404) {
				return undefined
			}
			return Promise.reject(parseErrorResponse(error.response))
		})
}

export function fetchEnvelopes(accountId, folderId, query, cursor) {
	const url = generateUrl('/apps/mail/api/accounts/{accountId}/folders/{folderId}/messages', {
		accountId,
		folderId,
	})
	const params = {}

	if (query) {
		params.filter = query
	}
	if (cursor) {
		params.cursor = cursor
	}

	return axios
		.get(url, {
			params,
		})
		.then(resp => resp.data)
		.then(map(amendEnvelopeWithIds(accountId, folderId)))
		.catch(error => {
			throw convertAxiosError(error)
		})
}

export async function syncEnvelopes(accountId, folderId, uids, init = false) {
	const url = generateUrl('/apps/mail/api/accounts/{accountId}/folders/{folderId}/sync', {
		accountId,
		folderId,
	})

	try {
		const response = await axios.get(url, {
			params: {
				uids,
				init,
			},
		})

		const amend = amendEnvelopeWithIds(accountId, folderId)
		return {
			newMessages: response.data.newMessages.map(amend),
			changedMessages: response.data.changedMessages.map(amend),
			vanishedMessages: response.data.vanishedMessages.map(amend),
		}
	} catch (e) {
		throw convertAxiosError(e)
	}
}

export function setEnvelopeFlag(accountId, folderId, id, flag, value) {
	const url = generateUrl('/apps/mail/api/accounts/{accountId}/folders/{folderId}/messages/{id}/flags', {
		accountId,
		folderId,
		id,
	})

	const flags = {}
	flags[flag] = value

	return axios
		.put(url, {
			flags: flags,
		})
		.then(() => {
			value
		})
}

export function fetchMessage(accountId, folderId, id) {
	const url = generateUrl('/apps/mail/api/accounts/{accountId}/folders/{folderId}/messages/{id}/body', {
		accountId,
		folderId,
		id,
	})

	return axios
		.get(url)
		.then(resp => resp.data)
		.catch(error => {
			if (error.response && error.response.status === 404) {
				return undefined
			}
			return Promise.reject(parseErrorResponse(error.response))
		})
}

export function saveDraft(accountId, data) {
	const url = generateUrl('/apps/mail/api/accounts/{accountId}/draft', {
		accountId,
	})

	return axios.post(url, data).then(resp => resp.data)
}

export function sendMessage(accountId, data) {
	const url = generateUrl('/apps/mail/api/accounts/{accountId}/send', {
		accountId,
	})

	return axios.post(url, data).then(resp => resp.data)
}

export function deleteMessage(accountId, folderId, id) {
	const url = generateUrl('/apps/mail/api/accounts/{accountId}/folders/{folderId}/messages/{id}', {
		accountId,
		folderId,
		id,
	})

	return axios.delete(url).then(resp => resp.data)
}

export function getFullText(accountId, folderId, id) {
	const url = generateUrl('/apps/mail/api/accounts/{accountId}/folders/{folderId}/messages/{id}/getFullText', {
		accountId,
		folderId,
		id,
	})
	return HttpClient.post(url).then(resp => resp.data)
}
