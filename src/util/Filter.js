export const filterToText = filter => {
	let text = ''
	if (filter.clientTag != null) {
		text += filter.clientTag
	}
	if (filter.step != null && filter.step !== '') {
		text += '.'
		let formatStep = filter.step
		if (formatStep.length < 2) {
			formatStep = `0${formatStep}`
		}
		text += formatStep
	}
	return {
		id: filter.id,
		text: text,
	}
}
