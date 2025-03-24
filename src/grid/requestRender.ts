import { render } from "./hexGrid";

let renderRequested = false;

export const setRenderRequested = (state: boolean) => {
	renderRequested = state;
};

export function requestRenderIfNotRequested() {
	if (!renderRequested && !!render) {
		renderRequested = true;
		requestAnimationFrame(render);
	}
}
