export const filterToText = filter => {
	return {
		id: filter.id,
		text: `${filter.caseNumber}.${filter.step}`,
	}
}
