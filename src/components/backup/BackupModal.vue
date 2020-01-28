<template>
	<modal size="large" @close="closeBackupModal">
		<div id="backup-modal-content" class="backupmail-flex-col">
			<h2>{{ t('backupmail', 'Select case number and step') }}</h2>
			<template v-if="!filterTested">
				<form class="backupmail-flex-col">
					<label for="backup-case-number">{{ t('backupmail', 'Case number') }}</label>
					<input id="backup-case-number" v-model="caseNumber" type="text" />
					<label for="backup-step">{{ t('backupmail', 'Step') }}</label>
					<input id="backup-step" v-model="step" type="text" />
				</form>
				<div class="backupmail-flex-row backupmail-flex-space-between">
					<button class="button" @click="closeBackupModal">{{ t('mail', 'Go back') }}</button>
					<button class="button primary" @click="backupModalSubmit">{{ t('mail', 'Backup') }}</button>
				</div>
			</template>
			<template v-else>
				<template v-if="waiting">
					<p>Requesting filters, please wait</p>
				</template>
				<template v-else>
					<!-- end waiting -->
					<template v-if="canCreate">
						<!-- creating backup files -->
						<p>Backup in progress</p>
					</template>
					<template v-else>
						<!-- ask for filter creation -->
						<p>The case number and step does not exist, please create a new case or step</p>
						<div class="backupmail-flex-row backupmail-flex-space-between">
							<button class="button" @click="reset">{{ t('mail', 'Go back') }}</button>
							<button class="button primary" @click="navigateCreateCase">
								{{ t('mail', 'Create case') }}
							</button>
						</div>
					</template>
				</template>
			</template>
		</div>
	</modal>
</template>

<script>
import * as lodash from 'lodash'
import Modal from '@nextcloud/vue/dist/Components/Modal'
import backup from '../../util/Backup'

export default {
	name: 'BackupModal',
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
			filterTested: false,
			canCreate: false,
			waiting: true,
			caseNumber: '',
			step: '',
			accountId: null,
		}
	},
	mounted() {
		this.init()
	},
	methods: {
		init() {
			this.filterTested = false
			this.canCreate = false
			this.waiting = true
			if (this.envelope != null) {
				//find case number and step
				const pattern = /\[(\d+)\.(\d+)\]/
				const matchValues = this.envelope.subject.match(pattern)
				this.caseNumber = matchValues[1]
				this.step = matchValues[2]
				this.accountId = this.envelope.accountId
			}
		},
		reset() {
			this.init()
		},
		backupModalSubmit() {
			this.checkCaseAndStep().then(canCreate => {
				if (canCreate) {
					return this.$store
						.dispatch('backupMessage', {
							envelope: this.envelope,
							caseNumber: this.caseNumber,
							step: this.step,
						})
						.then(() => {
							this.$emit('closeBackupModal')
						})
						.catch(() => {
							this.$emit('closeBackupModal')
						})
				}
			})
		},
		closeBackupModal(e) {
			this.$emit('closeBackupModal')
		},
		checkCaseAndStep() {
			const fullFilter = `${this.caseNumber}.${this.step}`
			return this.$store.dispatch('getFilters', this.envelope.accountId).then(filters => {
				const filterExists = lodash(filters)
					.map(f => f.text)
					.includes(fullFilter)
				this.filterTested = true
				this.waiting = false
				this.canCreate = filterExists
				return this.canCreate
			})
		},
		navigateCreateCase() {
			const route =
				backup.Routing.baseUrl() +
				backup.Routing.routes.newCase +
				`/${this.accountId}/${this.caseNumber}/${this.step}`
			window.open(route, '_blank')
			this.filterTested = false
			this.waiting = true
		},
	},
}
</script>
<style lang="scss" scoped>
#backup-modal-content {
	margin: 10px;
}
</style>
