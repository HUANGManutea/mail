<template>
	<div>
		<Multiselect
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
	data() {
		return {
			selectedFilter: null,
			selectableFilters: [],
		}
	},
	created() {
		getAllFilters().then(filters => {
			this.selectableFilters = filters
		})
	},
}
</script>
