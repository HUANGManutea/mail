export const filterToText = filter => {
	// let text = ''
	// if (filter.caseNumber != null) {
	// 	text += filter.caseNumber
	// }
	// if (filter.step != null && filter.step !== '') {
	// 	text += '.'
	// 	let formatStep = filter.step
	// 	if (formatStep.length < 2) {
	// 		formatStep = `0${formatStep}`
	// 	}
	// 	text += formatStep
	// }
	return {
		id: filter.id,
		text: filter.destination,
	}
}
