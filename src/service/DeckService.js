import {generateUrl} from '@nextcloud/router'
import Axios from '@nextcloud/axios'

const deckBaseURL = '/apps/deck/api/v1.0'

// boards
export const getBoards = () => {
	const url = generateUrl(deckBaseURL + '/boards')
	return Axios.get(url).then(resp => resp.data)
}
//stacks
export const getStacks = boardId => {
	const url = generateUrl(deckBaseURL + '/boards/{boardId}/stacks', {boardId: boardId})
	return Axios.get(url).then(resp => resp.data)
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

// labels
export const getLabels = boardId => {
	const url = generateUrl(deckBaseURL + '/boards/{boardId}/labels', {boardId: boardId})
	return Axios.get(url).then(resp => resp.data)
}

export const assignLabel = ({boardId, cardId, labelId}) => {
	const url = generateUrl(deckBaseURL + '/boards/{boardId}/stacks/{stackId}/cards/{cardId}/assignLabel', {
		boardId: boardId,
		cardId: cardId,
		labelId: labelId,
	})
	return Axios.put(url, {
		boardId: boardId,
		cardId: cardId,
		labelId: labelId,
	}).then(resp => resp.data)
}
