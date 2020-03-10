import {generateUrl} from '@nextcloud/router'
import Axios from '@nextcloud/axios'

const deckBaseURL = '/apps/deck/api/v1.0'

// boards
export const getBoards = () => {
	const url = generateUrl(deckBaseURL + '/boards')
	return Axios.get(url).then(resp => resp.data)
}
export const createBoard = ({title, color}) => {
	const url = generateUrl(deckBaseURL + '/boards')
	return Axios.post(url, {
		title: title,
		color: color,
	}).then(resp => resp.data)
}
export const updatePermissionsBoard = ({
	boardId,
	type,
	participant,
	permissionEdit,
	permissionShare,
	permissionManage,
}) => {
	const url = generateUrl(deckBaseURL + '/boards/{boardId}/acl', {boardId: boardId})
	return Axios.put(url, {
		type: type,
		participant: participant,
		permissionEdit: permissionEdit,
		permissionShare: permissionShare,
		permissionManage: permissionManage,
	}).then(resp => resp.data)
}
//stacks
export const getStacks = boardId => {
	const url = generateUrl(deckBaseURL + '/boards/{boardId}/stacks', {boardId: boardId})
	return Axios.get(url).then(resp => resp.data)
}

export const createStack = ({boardId, title, order}) => {
	const url = generateUrl(deckBaseURL + '/boards/{boardId}/stacks', {boardId: boardId})
	return Axios.post(url, {
		title: title,
		order: order,
	}).then(resp => resp.data)
}
// cards
export const createCard = ({boardId, stackId, title, description}) => {
	const url = generateUrl(deckBaseURL + '/boards/{boardId}/stacks/{stackId}/cards', {
		boardId: boardId,
		stackId: stackId,
	})
	return Axios.post(url, {
		title: title,
		description: description,
	}).then(resp => resp.data)
}
