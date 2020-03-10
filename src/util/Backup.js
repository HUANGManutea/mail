import {linkTo, generateUrl} from '@nextcloud/router'
import moment from '@nextcloud/moment'
export default {
	Routing: {
		baseUrl: () =>
			window.location.protocol + '//' + window.location.host + generateUrl(linkTo('backupmail', '')) + '#',
		routes: {
			newCase: '/cases/newCase',
		},
	},
	Reply: {
		address: {
			email: 'selarl@kintzler-avocats.pro',
			label: 'selarl@kintzler-avocats.pro',
		},
		extendBuildReply: message => {
			return message
		},
		extendReplySubject: subject => {
			return `${moment().format('DDMMYYYY')} - ${subject}`
		},
	},
}
