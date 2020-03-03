import {getClientCaseFiltersByAccount} from '../../service/BackupService'
import * as lodash from 'lodash'

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
				lodash(clientCaseFilters)
					.values()
					.forEach(clientCaseFilter => {
						commit('addClientFilters', clientCaseFilter)
					})
				return getters.getClientCaseFilters(accountId)
			})
	},
	transferMessage: ({commit, getters}, {envelope, comment}) => {
		
	},
}
