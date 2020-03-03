<template>
	<div class="backup-new-message-client-filter backupmail-flex-col">
		<label for="filter" class="filter-label">
			{{ t('backupmail', 'Filter') }}
		</label>
		<ClientFilter v-model="selectedFilter" :multiple="false" />
	</div>
</template>

<script>
import ClientFilter from './ClientFilter'

export default {
	name: 'BackupNewMessageClientFilter',
	components: {
		ClientFilter,
	},
	props: {
		value: {
			type: String,
			required: false,
			default: null,
		},
	},
	computed: {
		selectedFilter: {
			get() {
				return this.value
			},
			set(selectedFilter) {
				this.$emit('input', selectedFilter)
			},
		},
	},
}
</script>
<style lang="scss" scoped>
.filter-label {
	cursor: text;
	padding: 7px 6px 0;
	color: var(--color-text-maxcontrast);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.backup-new-message-client-filter {
	border-right: 1px solid var(--color-border);
	max-width: 30%;
}
</style>
