import {
	AmbientLight,
	DirectionalLight,
	Scene,
	Light,
	Clock,
} from "three";
import {
	AMBIENT_LIGHT_INTENSITY,
	DIRECT_LIGHT_INTENSITY,
	DIRECT_TOP_LIGHT_INTENSITY,
	UNIT,
} from "../lib/constants/utils";
import settings from "../settings";
import { requestRenderIfNotRequested } from "./requestRender";

let lights: Map<string, Light> = new Map();
// let audioContainer: Element | null;

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

	const ambiBeatImpact =
		settings.beatImpact > 0.5
			? (settings.beatImpact as number) *
			  (AMBIENT_LIGHT_INTENSITY - 0.5)
			: 0;
	const ambiLight = new AmbientLight(
		0xffffff,
		settings.tileOpacity > 0
			? (AMBIENT_LIGHT_INTENSITY - ambiBeatImpact) /
			  settings.tileOpacity
			: 0
	);
	scene.add(ambiLight);
	lights.set("ambient", ambiLight);

	const directBeatImpact =
		(settings.beatImpact as number) *
		DIRECT_LIGHT_INTENSITY;
	const dirLight1 = new DirectionalLight(
		0x33ffff,
		settings.tileOpacity > 0
			? (DIRECT_LIGHT_INTENSITY - directBeatImpact) /
			  settings.tileOpacity
			: 0
	);
	dirLight1.position.set(-centerX * 0.5, centerY * 2, 0);
	dirLight1.lookAt(centerX, centerY, 0);
	scene.add(dirLight1);
	lights.set("left", dirLight1);

	const dirLight2 = new DirectionalLight(
		0xff33ff,
		settings.tileOpacity > 0
			? (DIRECT_LIGHT_INTENSITY - directBeatImpact) /
			  settings.tileOpacity
			: 0
	);
	dirLight2.position.set(centerX * 1.5, -centerY * 2, 0);
	dirLight2.lookAt(centerX, centerY, 0);
	scene.add(dirLight2);
	lights.set("right", dirLight2);

	const dirLight3 = new DirectionalLight(
		0xeeeeee,
		settings.tileOpacity > 0
			? (DIRECT_TOP_LIGHT_INTENSITY -
					settings.beatImpact *
						DIRECT_TOP_LIGHT_INTENSITY) /
			  settings.tileOpacity
			: 0
	);
	dirLight3.position.set(0, 0, 100 * UNIT);
	dirLight3.lookAt(centerX, centerY, 0);
	scene.add(dirLight3);
	lights.set("top", dirLight3);

	// audioContainer = document.querySelector(
	// 	"#audio-container"
	// );
	// if (audioContainer?.tagName === "DIV") {
	// 	audioContainer.innerHTML = "listening...";
	// }
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
	if (lights.size == 0 || settings.beatImpact <= 0.05)
		return;

	// const maxImpact = { value: 0, time: performance.now() };
	let clock = new Clock();
	const leftMid = Math.min(
		Math.max(...audioArray.slice(10, 40)),
		1.0
	);
	const rightMid = Math.min(
		Math.max(...audioArray.slice(74, 104)),
		1.0
	);
	const leftBeat = Math.min(
		Math.max(...audioArray.slice(0, 1)),
		1.0
	);
	const rightBeat = Math.min(
		Math.max(...audioArray.slice(64, 65)),
		1.0
	);
	const snare = Math.min(
		Math.max(
			...audioArray.slice(9, 12),
			...audioArray.slice(73, 76)
		)
	);
	const maxBeat = Math.max(leftBeat, rightBeat);
	// if (audioContainer?.tagName === "DIV") {
	// 	audioContainer.innerHTML =
	// 		"" +
	// 		audioArray
	// 			.slice(0, 2)
	// 			.map((a) => a.toFixed(1))
	// 			.join(";");
	// }

	// const highFQ = Math.min(
	// 	Math.max(
	// 		...audioArray.slice(50, 64),
	// 		...audioArray.slice(114, 128)
	// 	),
	// 	1.0
	// );
	let i = 0;
	const tick = () => {
		let t = 10 * clock.getElapsedTime();
		if (lights.size == 0 || settings.beatImpact <= 0.05)
			return;

		const left = lights.get("left");
		if (left) {
			left.intensity = _intensityOnTick(
				DIRECT_LIGHT_INTENSITY,
				i,
				settings.beatImpact,
				leftMid
			);

			left.position.setZ(
				leftMid * i * settings.beatImpact
			);
		}
		const right = lights.get("right");
		if (right) {
			right.intensity = _intensityOnTick(
				DIRECT_LIGHT_INTENSITY,
				i,
				settings.beatImpact,
				rightMid
			);

			right.position.setZ(
				rightBeat * i * settings.beatImpact
			);
		}

		if (settings.beatImpact > 0.5) {
			const ambi = lights.get("ambient");
			if (ambi) {
				ambi.intensity = _intensityOnTick(
					AMBIENT_LIGHT_INTENSITY,
					i,
					settings.beatImpact,
					snare
				);
			}
		}
		const top = lights.get("top");
		if (top) {
			top.intensity = _intensityOnTick(
				DIRECT_TOP_LIGHT_INTENSITY,
				i,
				settings.beatImpact,
				maxBeat
			);
		}

		if (i < 1) {
			i +=
				0.01 *
				t *
				(settings.beatAnimationSpeed === 0
					? 1
					: settings.beatAnimationSpeed);

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

const _intensityOnTick = (
	base: number,
	i: number,
	beatImpact: number,
	beat: number
) => {
	return Math.min(
		base,
		base * (1 - beatImpact) +
			beatImpact * (1 - i) * beat
	);
};

// const dummyArray = Array(128).fill(1);
// export function sendLoopBeat() {
// 	animateLightsOnBeat(dummyArray);
// 	setTimeout(() => sendLoopBeat(), 500);
// }
