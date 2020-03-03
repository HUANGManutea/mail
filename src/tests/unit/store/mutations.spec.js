/*
 * @copyright 2020 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2020 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import mutations from '../../../store/mutations'
import {UNIFIED_ACCOUNT_ID} from '../../../store/constants'

describe('Vuex store mutations', () => {
	it('adds envelopes', () => {
		const state = {
			envelopes: {},
			folders: {
				'13-INBOX': {
					id: 'INBOX',
					envelopeLists: {},
				},
			},
		}

		mutations.addEnvelope(state, {
			accountId: 13,
			folderId: 'INBOX',
			query: undefined,
			envelope: {
				accountId: 13,
				folderId: 'INBOX',
				id: 123,
				subject: 'henlo',
				uid: '13-INBOX-123',
			},
		})

		expect(state).to.deep.equal({
			envelopes: {
				'13-INBOX-123': {
					accountId: 13,
					folderId: 'INBOX',
					uid: '13-INBOX-123',
					id: 123,
					subject: 'henlo',
				},
			},
			folders: {
				'13-INBOX': {
					id: 'INBOX',
					envelopeLists: {
						'': ['13-INBOX-123'],
					},
				},
			},
		})
	})

	it('removes an envelope', () => {
		const state = {
			accounts: {
				[UNIFIED_ACCOUNT_ID]: {
					accountId: UNIFIED_ACCOUNT_ID,
					id: UNIFIED_ACCOUNT_ID,
					folders: [],
				},
			},
			envelopes: {
				'13-INBOX-123': {
					accountId: 13,
					folderId: 'INBOX',
					id: 123,
					uid: '13-INBOX-123',
				},
			},
			folders: {
				'13-INBOX': {
					id: 'INBOX',
					envelopeLists: {
						'': ['13-INBOX-123'],
					},
				},
			},
		}

		mutations.removeEnvelope(state, {
			accountId: 13,
			folderId: 'INBOX',
			id: 123,
		})

		expect(state).to.deep.equal({
			accounts: {
				[UNIFIED_ACCOUNT_ID]: {
					accountId: UNIFIED_ACCOUNT_ID,
					id: UNIFIED_ACCOUNT_ID,
					folders: [],
				},
			},
			envelopes: {
				'13-INBOX-123': {
					accountId: 13,
					folderId: 'INBOX',
					id: 123,
					uid: '13-INBOX-123',
				},
			},
			folders: {
				'13-INBOX': {
					id: 'INBOX',
					envelopeLists: {
						'': [],
					},
				},
			},
		})
	})
})
