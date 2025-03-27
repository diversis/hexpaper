import {
	AmbientLight,
	DirectionalLight,
	Scene,
	Light,
	Clock,
} from "three";
import { UNIT } from "../lib/constants/utils";
import settings from "../settings";
import { requestRenderIfNotRequested } from "./requestRender";

let lights: Map<string, Light> = new Map();
let audioContainer: Element | null;

export function addLights({
	scene,
	centerX,
	centerY,
}: {
	scene?: Scene;
	centerX: number;
	centerY: number;
}) {
	if (!scene || !settings.tileOpacity) return;

	// Lights

	const ambiBeatImpact = // @ts-ignore
		settings.beatImpact > 0.5 // @ts-ignore
			? (settings.beatImpact as number) * 0.4
			: 0;
	const ambiLight = new AmbientLight(
		0xffffff, // @ts-ignore
		settings.tileOpacity > 0 // @ts-ignore
			? (0.9 - ambiBeatImpact) / settings.tileOpacity
			: 0
	);
	scene.add(ambiLight);
	lights.set("ambient", ambiLight);

	const directBeatImpact = // @ts-ignore
		(settings.beatImpact as number) * 0.4;
	const dirLight1 = new DirectionalLight(
		0x33ffff, // @ts-ignore
		settings.tileOpacity > 0
			? (0.4 - directBeatImpact) / // @ts-ignore
			  settings.tileOpacity
			: 0
	);
	dirLight1.position.set(-centerX * 0.5, centerY * 2, 0);
	dirLight1.lookAt(centerX, centerY, 0);
	scene.add(dirLight1);
	lights.set("left", dirLight1);

	const dirLight2 = new DirectionalLight(
		0xff33ff, // @ts-ignore
		settings.tileOpacity > 0 // @ts-ignore
			? (0.4 - directBeatImpact) / // @ts-ignore
			  settings.tileOpacity
			: 0
	);
	dirLight2.position.set(centerX * 1.5, -centerY * 2, 0);
	dirLight2.lookAt(centerX, centerY, 0);
	scene.add(dirLight2);
	lights.set("right", dirLight2);

	const dirLight3 = new DirectionalLight(
		0xeeeeee, // @ts-ignore
		settings.tileOpacity > 0
			? (0.33 - // @ts-ignore
					(settings.beatImpact as number) *
						0.33) / // @ts-ignore
			  settings.tileOpacity
			: 0
	);
	dirLight3.position.set(0, 0, 100 * UNIT);
	dirLight3.lookAt(centerX, centerY, 0);
	scene.add(dirLight3);
	lights.set("top", dirLight3);

	audioContainer = document.querySelector(
		"#audio-container"
	);
	if (audioContainer?.tagName === "DIV") {
		audioContainer.innerHTML = "listening...";
	}
}

export function removeLights() {
	lights.forEach((light) => light.removeFromParent());
}

export function disposeLights() {
	lights.forEach((light) => {
		light?.dispose();
	});
	lights = new Map();
}

export function animateLightsOnBeat(audioArray: number[]) {
	if (
		lights.size == 0 || // @ts-ignore
		settings.beatImpact == 0
	)
		return;

	// const maxImpact = { value: 0, time: performance.now() };
	let clock = new Clock();
	const leftBeat = Math.min(
		Math.max(...audioArray.slice(0, 4)),
		1.0
	);
	const rightBeat = Math.min(
		Math.max(...audioArray.slice(64, 68)),
		1.0
	);
	const maxBeat = Math.max(leftBeat, rightBeat);
	if (audioContainer?.tagName === "DIV") {
		audioContainer.innerHTML = "" + maxBeat;
	}

	const highFQ = Math.min(
		Math.max(
			...audioArray.slice(50, 64),
			...audioArray.slice(114, 128)
		),
		1.0
	);
	let i = 0;
	const tick = () => {
		let t = 10 * clock.getElapsedTime();
		if (
			lights.size == 0 || // @ts-ignore
			settings.beatImpact == 0
		)
			return;

		const left = lights.get("left");
		if (left) {
			left.intensity = Math.max(
				// @ts-ignore
				0.4 * leftBeat - i * settings.beatImpact
			);
			left.position.setZ(
				// @ts-ignore
				leftBeat * i * settings.beatImpact
			);
		}
		const right = lights.get("right");
		if (right) {
			right.intensity = Math.max(
				// @ts-ignore
				0.4 * rightBeat - i * settings.beatImpact
			);
			right.position.setZ(
				// @ts-ignore
				rightBeat * i * settings.beatImpact
			);
		}

		const ambi = lights.get("ambient");
		if (ambi) {
			ambi.intensity = Math.max(
				// @ts-ignore
				0.9 * maxBeat -
					i * // @ts-ignore
						(settings.beatImpact > 0.5 // @ts-ignore
							? (settings.beatImpact as number)
							: 0)
			);
		}

		const top = lights.get("top");
		if (top) {
			top.intensity = Math.max(
				0.0, // @ts-ignore
				0.33 * highFQ - i * settings.beatImpact
			);
		}

		if (i < 1) {
			i +=
				0.01 *
				t * // @ts-ignore
				(settings.animationSpeed === 0
					? 1
					: settings.animationSpeed);

			requestRenderIfNotRequested();
			requestAnimationFrame(tick);
		} else {
			requestRenderIfNotRequested();
		}
	};

	if (maxBeat > 0.5) {
		i = 0;
		requestAnimationFrame(tick);
	}
}

// const dummyArray = Array(128).fill(1);
// export function sendLoopBeat() {
// 	animateLightsOnBeat(dummyArray);
// 	setTimeout(() => sendLoopBeat(), 500);
// }
