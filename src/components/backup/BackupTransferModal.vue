<template>
	<modal size="large" @close="closeTransferBackupModal">
		<div id="backup-modal-content" class="backupmail-flex-col">
			<h2>{{ t('backupmail', 'A traiter') }}</h2>
			<form class="backupmail-flex-col">
				<label for="backup-transfer-comment">{{ t('backupmail', 'Commentaire') }}</label>
				<textarea id="backup-transfer-comment" v-model="comment" />
			</form>
			<div class="backupmail-flex-row backupmail-flex-space-between">
				<button class="button" @click="closeTransferBackupModal">{{ t('backupmail', 'Retour') }}</button>
				<button class="button primary" @click="backupTransferModalSubmit">
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
			comment: null,
		}
	},
	computed: {
		backupAccount() {
			return this.$store.getters.getBackupAccount()
		},
	},
	methods: {
		backupTransferModalSubmit() {
			console.log(this.backupAccount)
			console.log(this.envelope)
			// return this.$store
			// 	.dispatch('backup/transferMessage', {
			// 		envelope: this.envelope,
			// 		comment: this.comment,
			// 	})
			// 	.then(() => {
			// 		this.$emit('close')
			// 	})
			// 	.catch(() => {
			// 		this.$emit('close')
			// 	})
		},
		closeTransferBackupModal(e) {
			this.$emit('close')
		},
	},
}
</script>
<style lang="scss" scoped>
#backup-modal-content {
	margin: 10px;
}
</style>
