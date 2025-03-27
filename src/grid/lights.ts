import {
	AmbientLight,
	DirectionalLight,
	Scene,
	Light,
} from "three";
import { UNIT } from "../lib/constants/utils";
import settings from "../settings";

let lights: Map<string, Light> = new Map();

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
	dirLight1.position.set(
		-10 * UNIT,
		centerY - 10 * UNIT,
		0
	);
	dirLight1.lookAt(centerX, centerY, 0);
	scene.add(dirLight1);
	lights.set("left", dirLight1);

	const dirLight2 = new DirectionalLight(
		0xaa22ee, // @ts-ignore
		settings.tileOpacity > 0 // @ts-ignore
			? (0.4 - directBeatImpact) / // @ts-ignore
			  settings.tileOpacity
			: 0
	);
	dirLight2.position.set(
		centerX * 2 + 10 * UNIT,
		centerY + 10 * UNIT,
		0
	);
	dirLight2.lookAt(centerX, centerY, 0);
	scene.add(dirLight2);
	lights.set("right", dirLight2);

	const dirLight3 = new DirectionalLight(
		0xeeeeee, // @ts-ignore
		settings.tileOpacity > 0
			? (0.4 - directBeatImpact) / // @ts-ignore
			  settings.tileOpacity
			: 0
	);
	dirLight3.position.set(0, 0, 100 * UNIT);
	dirLight3.lookAt(centerX, centerY, 0);
	scene.add(dirLight3);
	lights.set("top", dirLight3);
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
		lights.keys.length == 0 || // @ts-ignore
		settings.beatImpact == 0
	)
		return;
	// const maxImpact = { value: 0, time: performance.now() };
	const tick = () => {
		if (
			lights.keys.length == 0 || // @ts-ignore
			settings.beatImpact == 0
		)
			return;
		const leftBeat = Math.max(
			...audioArray.slice(0, 4)
		);
		const rightBeat = Math.max(
			...audioArray.slice(64, 68)
		);
		const maxBeat = Math.max(leftBeat, rightBeat);

		const left = lights.get("left");
		if (left) {
			left.intensity = leftBeat;
		}
		const right = lights.get("right");
		if (right) {
			right.intensity = rightBeat;
		}

		const ambi = lights.get("ambient");
		if (ambi) {
			ambi.intensity = maxBeat;
		}

		const top = lights.get("top");
		if (top) {
			top.intensity = maxBeat;
		}

		window.requestAnimationFrame(tick);
	};
	window.requestAnimationFrame(tick);
}
