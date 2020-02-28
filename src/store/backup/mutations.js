import Vue from 'vue'
import * as lodash from 'lodash'

export default {
	addClientCaseFilter(state, {accountId, clientCaseFilter}) {
		if (state.clientCaseFilters[accountId] == null) {
			Vue.set(state.clientCaseFilters, accountId, {
				[clientCaseFilter.clientCase.id]: clientCaseFilter,
			})
		} else {
			Vue.set(state.clientCaseFilters[accountId], clientCaseFilter.clientCase.id, clientCaseFilter)
		}
	},
	addClientFilters(state, clientCaseFilter) {
		const transformedClientCaseFilter = {
			id: `${clientCaseFilter.clientCase.id}`,
			label: `${clientCaseFilter.clientCase.caseNumber} - ${clientCaseFilter.clientCase.title}`,
			children: clientCaseFilter.filters.map(filter => {
				return {
					id: `${clientCaseFilter.clientCase.id}-${filter.id}`,
					label: `${clientCaseFilter.clientCase.caseNumber}.${filter.step} - ${filter.jurisdiction}`,
				}
			}),
		}
		if (lodash.isEmpty(state.clientFilters)) {
			Vue.set(state, 'clientFilters', [transformedClientCaseFilter])
		} else {
			const existingClientCaseFilter = lodash.find(
				state.clientFilters,
				cf => parseInt(cf.id) === clientCaseFilter.clientCase.id
			)
			if (existingClientCaseFilter == null) {
				state.clientFilters.push(transformedClientCaseFilter)
			}
		}
	},
}
