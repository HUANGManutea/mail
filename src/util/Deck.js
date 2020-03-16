import * as commonmark from 'commonmark'

export default {
	Task: {
		parse: text => {
			if (text != null) {
				const userTasks = {
					user: null,
					tasks: [],
				}
				const reader = new commonmark.Parser()
				const parsed = reader.parse(text)
				const walker = parsed.walker()
				let event, node, insideNode

				while ((event = walker.next())) {
					node = event.node
					if (event.entering && node.type === 'heading' && node.firstChild != null) {
						// heading has child text, we want text
						insideNode = node.firstChild
						userTasks.user = insideNode.literal.replace(':', '')
					}
					if (
						event.entering &&
						node.type === 'item' &&
						node.firstChild != null &&
						node.firstChild.firstChild != null
					) {
						// item has child paragraph, paragraph has child text, we want text
						insideNode = node.firstChild.firstChild
						userTasks.tasks.push(insideNode.literal)
					}
				}
				return userTasks
			}
			return null
		},
	},
}
