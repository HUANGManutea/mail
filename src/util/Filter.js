import * as lodash from 'lodash'

export const filterToText = (caseNumber, step) => {
	if (lodash.isEmpty(caseNumber) || lodash.isEmpty(step)) {
		return null
	}
	return `${caseNumber}.${step}`
}
