import actions from './actions'
import mutations from './mutations'
import find from 'lodash/fp/find'
import values from 'lodash/fp/values'
import {STACK_TODO_TITLE} from './constants'

export const deck = {
	namespaced: true,
	state: {
		caseFilterBoards: {},
		boards: {},
		tempBoardId: null,
		tempStackId: null,
	},
	getters: {
		getBoards: state => () => {
			return state.boards
		},
		getLabels: state => boardId => {
			return state.boards[boardId].labels
		},
		getCaseFilterBoards: state => () => {
			return state.caseFilterBoards
		},
		getBoardByTitle: state => title => {
			return find({title: title}, values(state.boards))
		},
		getTempBoard: state => () => {
			if (state.tempBoardId != null) {
				return state.boards[state.tempBoardId]
			} else {
				return null
			}
		},
		getTodoStack: state => boardId => {
			if (boardId != null) {
				return find({title: STACK_TODO_TITLE}, state.boards[boardId].stacks)
			} else {
				return null
			}
		},
	},
	mutations,
	actions,
}
