import {getBoards, createBoard, getStacks, createCard} from '../../service/DeckService'
import find from 'lodash/fp/find'
import values from 'lodash/fp/values'

export default {
	getBoards: ({commit}) => {
		return getBoards().then(boards => {
			boards.forEach(board => commit('addBoard', board))
			return boards
		})
	},
	createBoard: ({commit}, {title, color}) => {
		return createBoard({title: title, color: color}).then(board => {
			commit('addBoard', board)
			return board
		})
	},
	getStacks: ({commit}, boardId) => {
		return getStacks(boardId).then(stacks => {
			stacks.forEach(stack => commit('addStack', {boardId: boardId, stack: stack}))
			return stacks
		})
	},
	createTasks: ({commit, getters}, {boardId, userTasks}) => {
		const boards = getters.getBoards()
		const existingBoard = find({id: boardId}, values(boards))
		if (existingBoard == null) {
			// put in temp board
			const tempBoard = getters.getTempBoard()
			const todoTempStack = getters.getTodoStack(tempBoard.id)
			userTasks.forEach(userTask => {
				return createCard(tempBoard.id, todoTempStack.id, userTask.description)
			})
		} else {
			// put in existing board
			const todoTempStack = getters.getTodoStack(existingBoard.id)
			userTasks.forEach(userTask => {
				return createCard(existingBoard.id, todoTempStack.id, userTask.description)
			})
		}
	},
}
