import {getClientCaseFiltersByAccount} from '../../service/BackupService'
import values from 'lodash/fp/values'

export default {
	getClientCaseFilters: ({commit, getters}, accountId) => {
		return getClientCaseFiltersByAccount(accountId)
			.then(clientCaseFilters => {
				clientCaseFilters.forEach(clientCaseFilter =>
					commit('addClientCaseFilter', {accountId: accountId, clientCaseFilter: clientCaseFilter})
				)
				return clientCaseFilters
			})
			.then(clientCaseFilters => {
				// clientCaseFilters are stored by id, put inside list
				values(clientCaseFilters).forEach(clientCaseFilter => {
					commit('addClientFilters', clientCaseFilter)
				})
				return getters.getClientCaseFilters(accountId)
			})
	},
	transferMessage: ({commit, getters}, {envelope, comment}) => {},
}
