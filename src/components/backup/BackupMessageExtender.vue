<template>
	<div class="backup-message-extender-container backupmail-flex-col">
		<label for="filter" class="filter-label">
			{{ t('backupmail', 'Filter') }}
		</label>
		<Multiselect
			id="filter"
			v-model="selectedFilter"
			:options="selectableFilters"
			track-by="id"
			label="text"
			:multiple="false"
			:placeholder="t('mail', 'Select Filter')"
			:show-no-options="true"
		>
			<span slot="noOptions">{{ t('mail', 'No filter available') }}</span>
		</Multiselect>
	</div>
</template>

<script>
import {getAllFilters} from '../../service/BackupService'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'

export default {
	name: 'BackupMessageExtender',
	components: {
		Multiselect,
	},
	props: {
		value: {
			type: Object,
			required: false,
			default: null,
		},
	},
	data() {
		return {
			selectableFilters: [],
		}
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
	created() {
		getAllFilters().then(filters => {
			this.selectableFilters = filters
		})
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
.backup-message-extender-container {
	border-right: 1px solid var(--color-border);
}
.multiselect {
	min-width: 90px;
}
</style>
