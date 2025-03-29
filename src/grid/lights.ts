import {
	AmbientLight,
	DirectionalLight,
	Scene,
	Light,
	Clock,
	MathUtils,
	Vector3,
} from "three";
import {
	AMBIENT_LIGHT_INTENSITY,
	DIRECT_LIGHT_INTENSITY,
	DIRECT_TOP_LIGHT_INTENSITY,
} from "../lib/constants/utils";
import settings from "../settings";
import { requestRenderIfNotRequested } from "./requestRender";

let lights: Map<
	string,
	{
		light: Light;
		initialIntensity: number;
		initialPosition?: Vector3;
	}
> = new Map();

let prevMaxBeat = 0;
let prevLeftMid = 0;
let prevRightMid = 0;

let zAmplitude = 0;
// let audioContainer: Element | null;
// let snareIndex = { b: 0, i: 0 };

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
	zAmplitude =
		(settings.tileSize / 4) * settings.beatImpact;
	const directBeatImpact = _getBeatImpact(
		DIRECT_LIGHT_INTENSITY,
		"direct"
	);

	const directTopBeatImpact = _getBeatImpact(
		DIRECT_TOP_LIGHT_INTENSITY,
		"direct"
	);

	const ambientBeatImpact = _getBeatImpact(
		AMBIENT_LIGHT_INTENSITY,
		"ambient"
	);

	// Lights
	const ambientInitialIntensity =
		_getInitialLightIntensity(
			AMBIENT_LIGHT_INTENSITY,
			ambientBeatImpact
		);
	const ambiLight = new AmbientLight(
		0xffffff,
		ambientInitialIntensity
	);
	scene.add(ambiLight);
	lights.set("ambient", {
		light: ambiLight,
		initialIntensity: ambientInitialIntensity,
	});

	const directInitialIntensity =
		_getInitialLightIntensity(
			DIRECT_LIGHT_INTENSITY,
			directBeatImpact
		);

	const dirLight1 = new DirectionalLight(
		0x33ffff,
		directInitialIntensity
	);
	const dirLight1Position = new Vector3(
		-centerX * 0.5,
		centerY * 1.15,
		-(settings.tileHeight + settings.tileSize) * 2
	);
	dirLight1.position.copy(dirLight1Position);
	dirLight1.lookAt(centerX, centerY, 0);
	scene.add(dirLight1);
	lights.set("left", {
		light: dirLight1,
		initialIntensity: directInitialIntensity,
		initialPosition: dirLight1Position,
	});

	const dirLight2 = new DirectionalLight(
		0xff33ff,
		_getInitialLightIntensity(
			DIRECT_LIGHT_INTENSITY,
			directBeatImpact
		)
	);
	const dirLight2Position = new Vector3(
		centerX * 0.5,
		-centerY * 1.15,
		-(settings.tileHeight + settings.tileSize) * 2
	);
	dirLight2.position.copy(dirLight2Position);
	dirLight2.lookAt(centerX, centerY, 0);
	scene.add(dirLight2);
	lights.set("right", {
		light: dirLight2,
		initialIntensity: directInitialIntensity,
		initialPosition: dirLight2Position,
	});

	const topInitialIntensity = _getInitialLightIntensity(
		DIRECT_TOP_LIGHT_INTENSITY,
		directTopBeatImpact
	);
	const dirLight3 = new DirectionalLight(
		0xeeeeee,
		_getInitialLightIntensity(
			DIRECT_TOP_LIGHT_INTENSITY,
			directBeatImpact
		)
	);
	const dirLight3Position = new Vector3(
		0,
		0,
		100 * settings.unit
	);
	dirLight3.position.copy(dirLight3Position);
	dirLight3.lookAt(centerX, centerY, 0);
	scene.add(dirLight3);
	lights.set("top", {
		light: dirLight3,
		initialIntensity: topInitialIntensity,
		initialPosition: dirLight3Position,
	});
	// audioContainer =
	// 	audioContainer ||
	// 	document.querySelector("#audio-container");
	// if (audioContainer?.tagName === "DIV") {
	// 	audioContainer.innerHTML = "listening...";
	// }
}

export function removeLights() {
	lights.forEach((item) =>
		item?.light.removeFromParent()
	);
}

export function disposeLights() {
	lights.forEach((item) => {
		item?.light?.dispose();
	});
	lights = new Map();
}

export function animateLightsOnBeat(audioArray: number[]) {
	if (!settings.beatEnabled || lights.size == 0) return;

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
		Math.max(...audioArray.slice(0, 3)),
		// audioArray[2],
		1.0
	);
	const rightBeat = Math.min(
		Math.max(...audioArray.slice(64, 67)),
		// audioArray[66],
		1.0
	);
	const snare = Math.min(
		Math.max(
			...audioArray.slice(5, 10),
			...audioArray.slice(69, 74)
		)
	);
	const maxBeat = Math.max(leftBeat, rightBeat);

	// snareIndex = [...audioArray.slice(3, 20)].reduce(
	// 	(acc, b, i) => {
	// 		if (b > acc.b) return { b, i };
	// 		return acc;
	// 	},
	// 	snareIndex
	// );
	// if (audioContainer?.tagName === "DIV") {
	// 	audioContainer.innerHTML = `index: ${snareIndex.i}`;
	// }

	// const highFQ = Math.min(
	// 	Math.max(
	// 		...audioArray.slice(50, 64),
	// 		...audioArray.slice(114, 128)
	// 	),
	// 	1.0
	// );
	const beatAnimationSpeed =
		settings.beatAnimationSpeed === 0
			? 1
			: settings.beatAnimationSpeed;
	const beatAnimationTime = 1000 / beatAnimationSpeed;

	// set transition lerps for ligts
	const ambientLight = lights.get("ambient");
	let ambientLightIntensityLerp:
		| { update: (delta: number) => void }
		| undefined;
	if (ambientLight) {
		ambientLightIntensityLerp = _intensityLerp(
			ambientLight.light,
			settings.beatImpact,
			maxBeat,
			ambientLight.initialIntensity,
			AMBIENT_LIGHT_INTENSITY
		);
	}

	const leftLight = lights.get("left");
	let leftLightIntensityLerp:
		| { update: (delta: number) => void }
		| undefined;
	let leftLightPositionLerp:
		| { update: (delta: number) => void }
		| undefined;
	if (leftLight) {
		leftLightIntensityLerp = _intensityLerp(
			leftLight.light,
			settings.beatImpact,
			leftMid,
			leftLight.initialIntensity,
			DIRECT_LIGHT_INTENSITY
		);
		leftLightPositionLerp = _positionLerp(
			leftLight.light,
			settings.beatImpact,
			snare,
			leftLight.initialPosition
		);
	}

	const rightLight = lights.get("right");
	let rightLightIntensityLerp:
		| { update: (delta: number) => void }
		| undefined;
	let rightLightPositionLerp:
		| { update: (delta: number) => void }
		| undefined;
	if (rightLight) {
		rightLightIntensityLerp = _intensityLerp(
			rightLight.light,
			settings.beatImpact,
			rightMid,
			rightLight.initialIntensity,
			DIRECT_LIGHT_INTENSITY
		);
		rightLightPositionLerp = _positionLerp(
			rightLight.light,
			settings.beatImpact,
			snare,
			rightLight.initialPosition
		);
	}

	const topLight = lights.get("top");
	let topLightLerp:
		| { update: (delta: number) => void }
		| undefined;

	if (topLight) {
		topLightLerp = _intensityLerp(
			topLight.light,
			settings.beatImpact,
			maxBeat,
			topLight.initialIntensity,
			DIRECT_TOP_LIGHT_INTENSITY
		);
	}
	const tick = () => {
		let t = beatAnimationSpeed * clock.getElapsedTime();
		if (lights.size == 0 || !settings.beatEnabled) {
			return;
		}
		const delta = t / beatAnimationTime;

		if (settings.beatImpact > 0.5) {
			ambientLightIntensityLerp?.update(delta);
		}

		topLightLerp?.update(delta);
		leftLightIntensityLerp?.update(delta);
		rightLightIntensityLerp?.update(delta);

		leftLightPositionLerp?.update(delta);

		rightLightPositionLerp?.update(delta);

		if (t < beatAnimationTime) {
			requestRenderIfNotRequested();
			requestAnimationFrame(tick);
		} else {
			requestRenderIfNotRequested();
		}
	};

	if (
		Math.max(
			Math.abs(maxBeat - prevMaxBeat),
			Math.abs(leftMid - prevLeftMid),
			Math.abs(rightMid - prevRightMid)
		) > 0.01
	) {
		prevMaxBeat = maxBeat;
		prevLeftMid = leftMid;
		prevRightMid = rightMid;
		requestAnimationFrame(tick);
	}
}

function _intensityLerp(
	light: Light,
	beatImpact: number,
	beat: number,
	initialIntensity?: number,
	maxIntesity?: number
) {
	const oldIntensity = light.intensity;
	const newIntensity = Math.max(
		initialIntensity || 0,
		Math.min(
			oldIntensity * (1 - beatImpact) +
				beatImpact * beat,
			maxIntesity || 1.0
		)
	);
	return {
		update: (delta: number) => {
			if (delta > 1) delta = 1;
			if (delta < 0.1) {
				light.intensity = MathUtils.lerp(
					oldIntensity,
					newIntensity,
					delta * 10
				);
			} else {
				light.intensity = MathUtils.lerp(
					newIntensity,
					initialIntensity || 0,
					(delta - 0.1) * 1.111111111111111
				);
			}
		},
	};
}

function _positionLerp(
	light: Light,
	beatImpact: number,
	beat: number,
	initialPosition?: Vector3
) {
	if (!initialPosition) return;
	const amplitude = Math.sin(beatImpact * beat * 0.5);
	const oldPosition = light.position;
	const zMax = initialPosition.z * zAmplitude;
	let zPos =
		oldPosition.z *
		(1 - amplitude) *
		(zAmplitude || 10);
	if (Math.abs(zPos) > Math.abs(zMax)) {
		zPos = zMax;
	}

	const newPosition = {
		x:
			oldPosition.x > 0
				? oldPosition.x * (1 - amplitude)
				: oldPosition.x * (1 + amplitude),
		y:
			oldPosition.y > 0
				? oldPosition.y * (1 - amplitude)
				: oldPosition.y * (1 + amplitude),
		z: zPos,
	};

	return {
		update: (delta: number) => {
			if (delta > 1) delta = 1;
			if (delta < 0.2) {
				light.position.lerp(newPosition, delta * 5);
			} else {
				light.position.lerp(
					initialPosition || new Vector3(0, 0, 0),
					(delta - 0.2) * 1.25
				);
			}
		},
	};
}

export function _getInitialLightIntensity(
	baseIntensity: number,
	beatImpact: number
) {
	return settings.tileOpacity > 0
		? (settings.beatEnabled
				? baseIntensity * (1 - beatImpact)
				: baseIntensity) / settings.tileOpacity
		: 1;
}
function _getBeatImpact(
	baseIntensity: number,
	lightType: string
) {
	const impacts = new Map([
		[
			"ambient",
			settings.beatImpact > 0.3
				? settings.beatImpact *
				  (baseIntensity - 0.3)
				: 0,
		],
		["direct", settings.beatImpact * baseIntensity],
	]);
	if (impacts.has(lightType))
		return impacts.get(lightType) || 0;
	return 0;
}

const dummyArray = Array(128).fill(0);
dummyArray[2] = 1;
export function sendLoopBeat() {
	// dummyArray[30] = 0.5 + Math.random() * 0.5;
	// dummyArray[6] = 0.5 + Math.random() * 0.5;
	// dummyArray[95] = 0.5 + Math.random() * 0.5;
	animateLightsOnBeat(dummyArray);
	// setTimeout(() => sendLoopBeat(), 200);
}
