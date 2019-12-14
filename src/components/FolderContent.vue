<template>
	<AppContent>
		<AppDetailsToggle v-if="showMessage" @close="hideMessage" />
		<div id="app-content-wrapper">
			<Loading v-if="loading" :hint="t('mail', 'Loading messages')" />
			<template v-else>
				<div>
					<div v-if="account.id != 0" class="folder-content-header">
						<Multiselect
							id="filter"
							v-model="selectedSaved"
							:options="selectableSaved"
							track-by="id"
							label="label"
							:multiple="false"
							:placeholder="t('mail', 'Select Saved')"
						/>
						<Multiselect
							id="filter"
							v-model="selectedFilters"
							:options="selectableFilters"
							track-by="id"
							label="text"
							:multiple="true"
							:placeholder="t('mail', 'Select Filter')"
							:show-no-options="true"
						>
							<span slot="noOptions">{{ t('mail', 'No filter available') }}</span>
						</Multiselect>
					</div>
					<EnvelopeList
						:account="account"
						:folder="folder"
						:envelopes="envelopes"
						:search-query="searchQuery"
						:show="!showMessage"
					/>
				</div>
				<NewMessageDetail v-if="newMessage" />
				<Message v-else-if="showMessage" />
				<NoMessageSelected v-else-if="hasMessages && !isMobile" />
			</template>
		</div>
	</AppContent>
</template>

<script>
import AppContent from '@nextcloud/vue/dist/Components/AppContent'
import isMobile from '@nextcloud/vue/dist/Mixins/isMobile'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'

import AppDetailsToggle from './AppDetailsToggle'
import EnvelopeList from './EnvelopeList'
import Loading from './Loading'
import Logger from '../logger'
import Message from './Message'
import NewMessageDetail from './NewMessageDetail'
import NoMessageSelected from './NoMessageSelected'

import * as lodash from 'lodash'

export default {
	name: 'FolderContent',
	components: {
		AppContent,
		AppDetailsToggle,
		EnvelopeList,
		Loading,
		Message,
		NewMessageDetail,
		NoMessageSelected,
		Multiselect,
	},
	mixins: [isMobile],
	props: {
		account: {
			type: Object,
			required: true,
		},
		folder: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			loading: true,
			searchQuery: undefined,
			alive: false,
			selectedFilters: null,
			selectedSaved: null,
			selectableSaved: [
				{id: 0, label: t('mail', 'Saved'), value: true},
				{id: 1, label: t('mail', 'Unsaved'), value: false},
			],
		}
	},
	computed: {
		hasMessages() {
			// it actually should be `return this.$store.getters.getEnvelopes(this.account.id, this.folder.id).length > 0`
			// but for some reason Vue doesn't track the dependencies on reactive data then and messages in subfolders can't
			// be opened then

			return this.folder.envelopes.map(msgId => this.$store.state.envelopes[msgId])
		},
		showMessage() {
			return this.hasMessages && this.$route.name === 'message'
		},
		newMessage() {
			return (
				this.$route.params.messageUid === 'new' ||
				this.$route.params.messageUid === 'reply' ||
				this.$route.params.messageUid === 'replyAll'
			)
		},
		envelopes() {
			let mails = []
			let allFilters = []
			// add filter on saved only if saved/unsaved filter is selected
			if (this.selectedSaved != null) {
				if (this.selectedSaved.value) {
					// add filter on unsavedMail
					allFilters.push(mail => mail.saved)
				} else {
					// add filter on savedMail
					allFilters.push(mail => !mail.saved)
				}
			}
			// add filter on subject
			if (!lodash.isEmpty(this.selectedFilters)) {
				allFilters.push(envelope => {
					let filtered = false
					this.selectedFilters.forEach(filter => {
						filtered = filtered || envelope.subject.includes(filter.text)
					})
					return filtered
				})
			}

			if (this.searchQuery === undefined) {
				mails = this.$store.getters.getEnvelopes(this.account.id, this.folder.id)
			} else {
				mails = this.$store.getters.getSearchEnvelopes(this.account.id, this.folder.id)
			}
			mails = mails.map(mail => {
				const existingBackupMail = this.$store.getters.getBackupMail(this.account.id, this.folder.id, mail.id)

				if (existingBackupMail != null) {
					return {
						...mail,
						saved: !!+existingBackupMail.saved,
					}
				} else {
					return mail
				}
			})

			// apply filters
			let filteredMails = mails
			allFilters.forEach(predicate => {
				filteredMails = filteredMails.filter(predicate)
			})
			console.log(filteredMails)
			return filteredMails
		},
		selectableFilters() {
			return this.$store.getters.getFilters(this.account.id)
		},
	},
	watch: {
		$route(to, from) {
			if (to.name === 'folder') {
				// Navigate (back) to the folder view -> (re)fetch data
				this.fetchData()
			}
		},
	},
	created() {
		this.alive = true

		new OCA.Search(this.searchProxy, this.clearSearchProxy)

		this.fetchData()
	},
	beforeDestroy() {
		this.alive = false
	},
	methods: {
		fetchData() {
			this.loading = true

			this.$store
				.dispatch('fetchEnvelopes', {
					accountId: this.account.id,
					folderId: this.folder.id,
					query: this.searchQuery,
				})
				.then(() => {
					return this.$store.dispatch('postBackupEnvelopes', {
						folderId: this.folder.id,
						envelopes: this.envelopes,
					})
				})
				.then(() => {
					return this.$store.dispatch('getBackupMails', {
						accountId: this.account.id,
						folderId: this.folder.id,
					})
				})
				.then(() => {
					const envelopes = this.envelopes
					Logger.debug('envelopes fetched', envelopes)

					this.loading = false

					if (!this.isMobile && this.$route.name !== 'message' && envelopes.length > 0) {
						// Show first message
						let first = envelopes[0]

						// Keep the selected account-folder combination, but navigate to the message
						// (it's not a bug that we don't use first.accountId and first.folderId here)
						this.$router.replace({
							name: 'message',
							params: {
								accountId: this.account.id,
								folderId: this.folder.id,
								messageUid: first.uid,
							},
						})
					}
				})
			this.$store.dispatch('getFilters', this.account.id)
		},
		hideMessage() {
			this.$router.replace({
				name: 'folder',
				params: {
					accountId: this.account.id,
					folderId: this.folder.id,
				},
			})
		},
		searchProxy(query) {
			if (this.alive) {
				this.search(query)
			}
		},
		clearSearchProxy() {
			if (this.alive) {
				this.clearSearch()
			}
		},
		search(query) {
			this.searchQuery = query

			this.fetchData()
		},
		clearSearch() {
			this.searchQuery = undefined
		},
	},
}
</script>
<style lang="scss">
.folder-content-header {
	display: flex;
	flex-direction: row;
}
</style>
