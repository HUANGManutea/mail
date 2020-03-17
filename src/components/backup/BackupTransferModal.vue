<template>
	<modal size="large" @close="closeTransferBackupModal">
		<div id="backup-transfer-modal-content" class="backupmail-flex-col">
			<h2>{{ t('backupmail', 'A traiter') }}</h2>
			<form id="backup-transfer-form" class="backupmail-flex-col">
				<label for="backup-transfer-comment">{{ t('backupmail', 'Commentaire') }}</label>
				<textarea id="backup-transfer-comment" v-model="comment" v-shortkey.avoid @input="setModified" />
			</form>
			<div class="backupmail-flex-row backupmail-flex-space-between">
				<button class="button" @click="closeTransferBackupModal">{{ t('backupmail', 'Retour') }}</button>
				<button class="button primary" :disabled="!modified" @click="backupTransferModalSubmit">
					{{ t('backupmail', 'Envoyer') }}
				</button>
			</div>
		</div>
	</modal>
</template>

<script>
import * as lodash from 'lodash'
import Modal from '@nextcloud/vue/dist/Components/Modal'
import {sendMessage} from '../../service/MessageService'
import backup from '../../util/Backup'
import deck from '../../util/Deck'
import {TEMP_BOARD_TITLE, SECRETARIAT_LABEL_TITLE, ACCOUNTING_LABEL_TITLE} from '../../store/deck/constants'

const defaultComment = `# ${SECRETARIAT_LABEL_TITLE}
- tâche 1
- tâche 2

# ${ACCOUNTING_LABEL_TITLE}
- tâche 3
- tâche 4
`

export default {
	name: 'BackupTransferModal',
	components: {
		Modal,
	},
	props: {
		envelope: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			comment: '' + defaultComment,
			modified: false,
		}
	},
	computed: {
		backupAccount() {
			return this.$store.getters.getBackupAccount()
		},
		getClientCaseFilterByCaseNumber() {
			return this.$store.getters['backup/getClientCaseFilterByCaseNumber']
		},
		getBoardByTitle() {
			return this.$store.getters['deck/getBoardByTitle']
		},
	},
	methods: {
		setModified() {
			if (this.modified == false) {
				this.modified = true
			}
		},
		backupTransferModalSubmit() {
			let postDetails = {
				title: null,
				userTasksList: null,
			}
			// pre fill postDetails title
			postDetails.title = TEMP_BOARD_TITLE
			// parse user tasks
			const userTasksList = this.comment.split('\n\n')
			postDetails.userTasksList = userTasksList.map(rawUserTask => deck.Task.parse(rawUserTask))

			// parse subject for case number
			const groups = this.envelope.subject.match(backup.TagPattern)
			if (!lodash.isEmpty(groups) && groups.length > 1) {
				const caseNumber = groups[1]

				const existingCcf = this.getClientCaseFilterByCaseNumber({
					accountId: this.backupAccount.id,
					caseNumber: caseNumber,
				})

				if (existingCcf != null) {
					// get corresponding board
					const fullname = backup.Client.getFullName(existingCcf.client)
					const title = `${existingCcf.clientCase.caseNumber} - ${fullname} vs ${existingCcf.clientCase.opponentName}`
					postDetails.title = title
				}
			}
			// put in board
			return this.$store.dispatch('deck/createCards', postDetails).then(() => {
				this.$emit('close')
			})
		},
		closeTransferBackupModal(e) {
			this.$emit('close')
		},
	},
}
</script>
<style lang="scss" scoped>
#backup-transfer-modal-content {
	width: 30vw;
	height: 30vw;
	margin: 10px;
}
#backup-transfer-comment {
	width: 100%;
	height: 100%;
}
#backup-transfer-form {
	width: 100%;
	height: 100%;
}
</style>
