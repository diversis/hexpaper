let lastIntersectionId: number | undefined;
export const setLastIntersectionId = (id: number) =>
	(lastIntersectionId = id);
export const getLastIntersectionId = () =>
	lastIntersectionId;
