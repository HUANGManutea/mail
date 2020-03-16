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
	computed: {
		selectedFilter: {
			get() {
				return this.value
			},
			set(selectedFilter) {
				this.$emit('input', selectedFilter)
			},
		},
		selectableFilters() {
			return this.$store.getters['backup/getClientFilters']()
		},
	},
}
</script>
<style lang="scss">
.vue-treeselect__input {
	border: none !important;
}
</style>
