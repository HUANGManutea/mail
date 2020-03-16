import {getBoards, getStacks, getLabels, createCard, assignLabel} from '../../service/DeckService'
import find from 'lodash/fp/find'
import values from 'lodash/fp/values'
import {SECRETARIAT_LABEL_TITLE, ACCOUNTING_LABEL_TITLE} from './constants'

export default {
	getBoards: ({commit, dispatch}) => {
		return getBoards()
			.then(boards => {
				boards.forEach(board => commit('addBoard', board))
				return boards
			})
			.then(boards => {
				boards.forEach(board => {
					dispatch('getStacks', board.id)
				})
				return boards
			})
			.then(boards => {
				boards.forEach(board => {
					dispatch('getLabels', board.id)
				})
				return boards
			})
	},
	getStacks: ({commit}, boardId) => {
		return getStacks(boardId).then(stacks => {
			stacks.forEach(stack => commit('addStack', {boardId: boardId, stack: stack}))
			return stacks
		})
	},
	getLabels: ({commit}, boardId) => {
		return getLabels(boardId).then(labels => {
			labels.forEach(label => commit('addLabel', {boardId: boardId, label: label}))
			return labels
		})
	},
	createCards: ({commit, getters, dispatch}, {title, userTasksList}) => {
		const boards = getters.getBoards()
		const existingBoard = find({title: title}, values(boards))
		const boardTarget = existingBoard == null ? getters.getTempBoard() : existingBoard
		const stack = getters.getTodoStack(boardTarget.id)

		userTasksList.forEach(userTasks => {
			userTasks.tasks.forEach(task => {
				createCard({boardId: boardTarget.id, stackId: stack.id, title: task, description: task}).then(card => {
					console.log(card)
					dispatch('assignLabel', {
						user: userTasks.user,
						board: boardTarget,
						cardId: card.id,
					})
				})
			})
		})
	},
	assignLabel({commit}, {user, board, cardId}) {
		console.log(board)
		const secretariatLabel = find({title: SECRETARIAT_LABEL_TITLE}, board.labels)
		const accountingLabel = find({title: ACCOUNTING_LABEL_TITLE}, board.labels)

		const label = user === ACCOUNTING_LABEL_TITLE ? accountingLabel : secretariatLabel
		return assignLabel({boardId: board.id, cardId: cardId, labelId: label.id})
	},
	setCaseFilterBoard: ({commit}, {clientCaseId, boardId}) => {
		commit('setCaseFilterBoard', {clientCaseId: clientCaseId, boardId: boardId})
	},
}
