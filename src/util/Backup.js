import {linkTo, generateUrl} from '@nextcloud/router'

export default {
	Routing: {
		baseUrl: function() {
			return window.location.protocol + '//' + window.location.host + generateUrl(linkTo('backupmail', '')) + '#'
		},
		routes: {
			newCase: '/cases/newCase',
		},
	},
}
