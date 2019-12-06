<template>
	<div id="backup-form" class="section">
		<h2>{{ t('mail', 'Backup') }}</h2>
		<div class="flex-row-center">
			<div class="flex-column">
				<label>{{ t('mail', 'Backup folder') }}</label>
				<input id="backup-form-location" v-model="backupLocation" type="text" disabled />
			</div>
			<button
				class="backup-save-to-cloud icon-folder"
				:title="t('mail', 'Backup location')"
				@click.stop="chooseBackupFolder"
			></button>
		</div>
	</div>
</template>

<script>
import {getFilePickerBuilder} from '@nextcloud/dialogs'
import logger from '../logger'

export default {
	name: 'BackupForm',
	props: {
		account: {
			type: Object,
			required: false,
			default: () => undefined,
		},
	},
	data() {
		return {
			loading: false,
		}
	},
	computed: {
		backupLocation() {
			return this.$store.getters.getPreference('backup-location', null)
		},
	},
	methods: {
		chooseBackupFolder() {
			const picker = getFilePickerBuilder(t('mail', 'Choose a folder to store the mails in'))
				.setMultiSelect(false)
				.addMimeTypeFilter('httpd/unix-directory')
				.setModal(true)
				.setType(1)
				.build()

			return picker.pick().then(dest => {
				return this.$store
					.dispatch('savePreference', {
						key: 'backup-location',
						value: dest,
					})
					.catch(error => logger.error('could not save preferences', {error}))
					.then(() => {
						this.loadingAvatarSettings = false
					})
			})
		},
	},
}
</script>

<style scoped>
h4 {
	text-align: left;
}

.flex-column {
	display: flex;
	flex-direction: column;
}
.flex-row-center {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.backup-save-to-cloud {
	height: 32px;
	width: 32px;
}
</style>
