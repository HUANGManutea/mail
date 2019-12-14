import {generateUrl} from '@nextcloud/router'
import Axios from '@nextcloud/axios'
import {filterToText} from '../util/Filter'

// Accounts
export const createBackupAccount = ({accountId, email}) => {
	const url = generateUrl('/apps/backupmail/api/account')
	return Axios.post(url, {
		extMailId: accountId,
		email: email,
	}).then(resp => resp.data)
}
export const deleteBackupAccount = accountId => {
	const url = generateUrl('/apps/backupmail/api/account/{extMailId}', {extMailId: accountId})
	return Axios.delete(url).then(resp => resp.data)
}

// Folders
export const createBackupFolders = ({accountId, folderIds}) => {
	const url = generateUrl('/apps/backupmail/api/mailbox/createMultiple')
	return Axios.post(url, {
		accountId: accountId,
		extMailboxIds: folderIds,
	}).then(resp => resp.data)
}
export const deleteBackupFolders = accountId => {
	const url = generateUrl('/apps/backupmail/api/mailbox/destroyMultiple/{accountId}', {accountId: accountId})
	return Axios.delete(url).then(resp => resp.data)
}

// filters
export const getFilters = accountId => {
	const url = generateUrl('/apps/backupmail/api/filter/getByAccount')
	return Axios.post(url, {accountId: accountId})
		.then(resp => resp.data)
		.then(filters => filters.map(filterToText))
}

// envelopes
export const postBackupEnvelopes = envelopes => {
	const url = generateUrl('/apps/backupmail/api/mail/createMultiple')
	return Axios.post(url, {envelopes: envelopes}).then(resp => resp.data)
}
export const getBackupMails = ({accountId, mailboxId}) => {
	const url = generateUrl('/apps/backupmail/api/mail/{accountId}/backups/{mailboxId}', {
		accountId: accountId,
		mailboxId: mailboxId,
	})
	return Axios.get(url).then(resp => resp.data)
}
