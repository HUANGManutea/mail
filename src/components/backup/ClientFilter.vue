<template>
	<treeselect
		v-model="selectedFilter"
		:multiple="multiple"
		:disable-branch-nodes="true"
		:options="selectableFilters"
		placeholder="Sélectionner un tag"
		:max-height="200"
	/>
</template>

<script>
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'
// treeselect
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import * as lodash from 'lodash'

export default {
	name: 'ClientFilter',
	components: {
		Treeselect,
	},
	props: {
		value: {
			type: [String, Array],
			required: false,
			default: null,
		},
		multiple: {
			type: Boolean,
			required: false,
			default: true,
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
		clientFilters() {
			return this.$store.getters['backup/getClientFilters']()
		},
	},
	created() {
		const backupAccount = this.$store.getters.getBackupAccount()
		return this.$store.dispatch('backup/getClientCaseFilters', backupAccount.id).then(() => {
			this.selectableFilters = this.clientFilters
		})
	},
}
</script>
