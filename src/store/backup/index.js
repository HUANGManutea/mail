import actions from './actions'
import mutations from './mutations'
import * as lodash from 'lodash'
import {filterToText} from '../../util/Filter'

export const backup = {
	namespaced: true,
	state: {
		clientCaseFilters: {},
		clientFilters: [],
	},
	getters: {
		getClientCaseFilters: state => accountId => {
			return state.clientCaseFilters[accountId]
		},
		getClientFilters: state => () => {
			return state.clientFilters
		},
		getFilterFromId: state => ({accountId, caseFilterId}) => {
			if (lodash.isEmpty(caseFilterId) || accountId == null) {
				return null
			}

			let [clientCaseId, filterId] = lodash.split(caseFilterId, '-')
			clientCaseId = parseInt(clientCaseId)
			filterId = parseInt(filterId)
			const clientCaseFilter = state.clientCaseFilters[accountId][clientCaseId]
			if (clientCaseFilter == null || lodash.isEmpty(clientCaseFilter.filters)) {
				return null
			}
			const filter = lodash.find(clientCaseFilter.filters, filter => filter.id === filterId)
			const result = filterToText(clientCaseFilter.clientCase.caseNumber, filter.step)
			console.log(result)
			return result
		},
	},
	mutations,
	actions,
}
