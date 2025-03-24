let renderRequested = false;

export const setRenderRequested = (state: boolean) => {
	renderRequested = state;
};

export function requestRenderIfNotRequested(
	render: () => void
) {
	if (!renderRequested && !!render) {
		renderRequested = true;
		requestAnimationFrame(render);
	}
}
