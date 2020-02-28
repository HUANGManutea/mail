import {generateUrl} from '@nextcloud/router'
import Axios from '@nextcloud/axios'

// Accounts
export const getBackupAccounts = () => {
	const url = generateUrl('/apps/backupmail/api/account')
	return Axios.get(url).then(resp => resp.data)
}
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

// ClientFilters
export const getClientCaseFiltersByAccount = accountId => {
	const url = generateUrl('/apps/backupmail/api/case/byAccount/{accountId}', {accountId: accountId})
	return Axios.get(url).then(resp => resp.data)
}

// envelopes
export const postBackupEnvelopes = ({accountId, envelopes}) => {
	const url = generateUrl('/apps/backupmail/api/mail/{accountId}/createMultiple', {accountId: accountId})
	return Axios.post(url, {envelopes: envelopes}).then(resp => resp.data)
}
export const getBackupMails = ({accountId, mailboxId}) => {
	const url = generateUrl('/apps/backupmail/api/mail/{accountId}/backups/{mailboxId}', {
		accountId: accountId,
		mailboxId: mailboxId,
	})
	return Axios.get(url).then(resp => resp.data)
}

// backup
export const writeBackupMail = ({accountId, mailboxId, id, content, caseNumber, step}) => {
	const url = generateUrl('/apps/backupmail/api/mail/backup')
	return Axios.post(url, {
		accountId: accountId,
		mailboxId: mailboxId,
		id: id,
		content: content,
		caseNumber: caseNumber,
		step: step,
	}).then(resp => resp.data)
}
