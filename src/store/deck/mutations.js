import Vue from 'vue'
import isEmpty from 'lodash/fp/isEmpty'
import find from 'lodash/fp/find'
import {TEMP_BOARD_TITLE, STACK_TODO_TITLE} from './constants'
export default {
	addBoard(state, board) {
		if (isEmpty(state.boards)) {
			Vue.set(state, 'boards', {
				[board.id]: board,
			})
		} else {
			Vue.set(state.board, board.id, board)
		}
		// add temp board to state
		if (board.title === TEMP_BOARD_TITLE) {
			Vue.set(state, 'tempBoardId', board.id)
		}
	},
	addStack(state, {boardId, stack}) {
		if (isEmpty(state.boards[boardId].stacks)) {
			Vue.set(state.boards[boardId], 'stacks', [stack])
		} else {
			const existingStack = find({id: stack.id}, state.boards[boardId].stacks)
			if (existingStack == null) {
				state.boards[boardId].stacks.push(stack)
			}
		}
		// add temp stack to state
		if (boardId === state.tempBoardId && stack.title === STACK_TODO_TITLE) {
			Vue.set(state, 'tempStackId', stack.id)
		}
	},
	addCard(state, {boardId, stackId, card}) {
		if (isEmpty(state.boards[boardId].stacks[stackId].cards)) {
			Vue.set(state.boards[boardId].stacks[stackId], 'cards', [card])
		} else {
			const existingStack = find({id: card.id}, state.boards[boardId].stacks[stackId].cards)
			if (existingStack == null) {
				state.boards[boardId].stacks[stackId].cards.push(card)
			}
		}
	},
}
