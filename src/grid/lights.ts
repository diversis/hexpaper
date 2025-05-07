import {
	AmbientLight,
	DirectionalLight,
	Scene,
	Light,
	Clock,
	MathUtils,
	Vector3,
	Color,
} from "three";
import {
	AMBIENT_LIGHT_INTENSITY,
	DIRECT_LIGHT_INTENSITY,
} from "../lib/constants/utils";
import settings from "../settings";
import { requestRenderIfNotRequested } from "./requestRender";
import { animateLightColor } from "./animateColors";

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
let prevSnare = 0;

let zAmplitude = 0;

let animationID: number | undefined = undefined;
// let audioContainer: Element | null;
// let snareIndex = { b: 0, i: 0 };
const impacts = new Map([
	[
		"ambient",
		() =>
			settings.beatImpact > 0.3
				? settings.beatImpact * 0.9
				: 0,
	],
	["direct", () => settings.beatImpact * 0.75],
]);

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
	const directBeatImpact = settings.beatEnabled
		? _getBeatImpact("direct")
		: 0;

	const directTopBeatImpact = settings.beatEnabled
		? _getBeatImpact("direct")
		: 0;

	const ambientBeatImpact = settings.beatEnabled
		? _getBeatImpact("ambient")
		: 0;

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
	if (settings.enableLeftSideLight) {
		const leftLightInitialIntensity =
			_getInitialLightIntensity(
				settings.leftSideLightIntensity,
				directBeatImpact
			);

		const dirLight1 = new DirectionalLight(
			settings.leftSideLightColor,
			leftLightInitialIntensity
		);
		const dirLight1Position = new Vector3(
			-centerX * 0.5 - settings.tileSize,
			centerY + settings.tileSize,
			-(
				settings.tileHeight +
				settings.tileSize *
					(settings.beatEnabled
						? settings.beatImpact
						: 1)
			) * 2
		);
		dirLight1.position.copy(dirLight1Position);
		dirLight1.lookAt(centerX, centerY, 0);
		scene.add(dirLight1);
		lights.set("left", {
			light: dirLight1,
			initialIntensity: leftLightInitialIntensity,
			initialPosition: dirLight1Position,
		});
	}
	if (settings.enableRightSideLight) {
		const rightLightInitialIntensity =
			_getInitialLightIntensity(
				settings.leftSideLightIntensity,
				directBeatImpact
			);

		const dirLight2 = new DirectionalLight(
			settings.rightSideLightColor,
			rightLightInitialIntensity
		);
		const dirLight2Position = new Vector3(
			centerX * 0.5 + settings.tileSize,
			-centerY + settings.tileSize,
			-(
				settings.tileHeight +
				settings.tileSize *
					(settings.beatEnabled
						? settings.beatImpact
						: 1)
			) * 2
		);
		dirLight2.position.copy(dirLight2Position);
		dirLight2.lookAt(centerX, centerY, 0);
		scene.add(dirLight2);
		lights.set("right", {
			light: dirLight2,
			initialIntensity: rightLightInitialIntensity,
			initialPosition: dirLight2Position,
		});
	}
	if (settings.enableTopLight) {
		const topInitialIntensity =
			_getInitialLightIntensity(
				settings.topLightIntensity,
				directTopBeatImpact
			);
		const dirLight3 = new DirectionalLight(
			0xeeeeee,
			topInitialIntensity
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
	}
	// audioContainer =
	// 	audioContainer ||
	// 	document.querySelector("#audio-container");
	// if (audioContainer?.tagName === "DIV") {
	// 	audioContainer.innerHTML = "listening...";
	// }
}

export function animateLightsOnBeat(audioArray: number[]) {
	if (
		!settings.beatEnabled ||
		lights.size == 0 ||
		settings.beatImpact == 0
	)
		return;
	if (animationID) cancelAnimationFrame(animationID);
	animationID = undefined;
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
		ambientLightIntensityLerp = _intensityLerpOnBeat(
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
		leftLightIntensityLerp = _intensityLerpOnBeat(
			leftLight.light,
			settings.beatImpact,
			snare,
			leftLight.initialIntensity,
			settings.leftSideLightIntensity
		);
		leftLightPositionLerp = _positionLerpOnBeat(
			leftLight.light,
			settings.beatImpact,
			leftMid,
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
		rightLightIntensityLerp = _intensityLerpOnBeat(
			rightLight.light,
			settings.beatImpact,
			snare,
			rightLight.initialIntensity,
			settings.rightSideLightIntensity
		);
		rightLightPositionLerp = _positionLerpOnBeat(
			rightLight.light,
			settings.beatImpact,
			rightMid,
			rightLight.initialPosition
		);
	}

	const topLight = lights.get("top");
	let topLightLerp:
		| { update: (delta: number) => void }
		| undefined;

	if (topLight) {
		topLightLerp = _intensityLerpOnBeat(
			topLight.light,
			settings.beatImpact,
			maxBeat,
			topLight.initialIntensity,
			settings.topLightIntensity
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
			Math.abs(rightMid - prevRightMid),
			Math.abs(snare - prevSnare)
		) > 0.01
	) {
		prevMaxBeat = maxBeat;
		prevLeftMid = leftMid;
		prevRightMid = rightMid;
		prevSnare = snare;
		animationID = requestAnimationFrame(tick);
	}
}

// function _intensityLerp(
// 	light: Light,
// 	from: number,
// 	to: number
// ) {
// 	return {
// 		update: (delta: number) => {
// 			light.intensity = MathUtils.lerp(
// 				from,
// 				to,
// 				delta
// 			);
// 		},
// 	};
// }

function _intensityLerpOnBeat(
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
			(initialIntensity || 0) * (1 - beatImpact) +
				(maxIntesity || DIRECT_LIGHT_INTENSITY) *
					beatImpact *
					beat,
			maxIntesity || DIRECT_LIGHT_INTENSITY
		)
	);
	return {
		update: (delta: number) => {
			if (delta > 1) delta = 1;
			if (delta < 0.5) {
				light.intensity = MathUtils.lerp(
					oldIntensity,
					newIntensity,
					delta * 2
				);
			} else {
				light.intensity = MathUtils.lerp(
					newIntensity,
					initialIntensity || 0,
					(delta - 0.5) * 2
				);
			}
		},
	};
}

function _positionLerpOnBeat(
	light: Light,
	beatImpact: number,
	beat: number,
	initialPosition?: Vector3
) {
	if (!initialPosition) return;
	const amplitude = Math.sin(beatImpact * beat * 0.5);

	const zMax = initialPosition.z * zAmplitude;
	let zPos = zMax * (1 - amplitude) * (zAmplitude || 1);
	if (Math.abs(zPos) > Math.abs(zMax)) {
		zPos = zMax;
	}
	const newPosition = {
		x:
			initialPosition.x > 0
				? initialPosition.x * (1 + amplitude)
				: initialPosition.x * (1 - amplitude),
		y:
			initialPosition.y > 0
				? initialPosition.y * (1 + amplitude)
				: initialPosition.y * (1 - amplitude),
		z: zPos,
	};

	return {
		update: (delta: number) => {
			if (delta > 1) delta = 1;
			if (delta < 0.4) {
				light.position.lerp(
					newPosition,
					delta * 2.5
				);
			} else {
				light.position.lerp(
					initialPosition || new Vector3(0, 0, 0),
					(delta - 0.4) / 0.6
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
function _getBeatImpact(lightType: string) {
	if (impacts.has(lightType)) {
		return impacts.get(lightType)?.() || 0;
	}
	return 0;
}

export function setSideLightsColor(
	color: Color,
	side: "left" | "right"
) {
	if (lights.size < 1) return;
	let clock = new Clock();
	const animationSpeed =
		settings.animationSpeed === 0
			? 1
			: settings.animationSpeed;
	const animationTime = 1000 / animationSpeed;
	let rightLight:
		| {
				light: Light;
				initialIntensity: number;
				initialPosition?: Vector3;
		  }
		| undefined;
	if (side == "right") {
		rightLight = lights.get("right");
	}
	let rightLightColorLerp: {
		update: (delta: number) => void;
	} | null;
	if (rightLight) {
		rightLightColorLerp = animateLightColor(
			rightLight.light,
			color
		);
	}

	let leftLight:
		| {
				light: Light;
				initialIntensity: number;
				initialPosition?: Vector3;
		  }
		| undefined;

	if (side == "left") {
		leftLight = lights.get("left");
	}
	let leftLightColorLerp: {
		update: (delta: number) => void;
	} | null;
	if (leftLight) {
		leftLightColorLerp = animateLightColor(
			leftLight.light,
			color
		);
	}

	const tick = () => {
		let t = animationSpeed * clock.getElapsedTime();
		if (lights.size == 0) {
			return;
		}
		const delta = t / animationTime;

		leftLightColorLerp?.update(delta);
		rightLightColorLerp?.update(delta);

		if (t < animationTime) {
			requestRenderIfNotRequested();
			requestAnimationFrame(tick);
		} else {
			requestRenderIfNotRequested();
		}
	};
	requestAnimationFrame(tick);
}

// Disposal
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

// const dummyArray = Array(128).fill(0);
// dummyArray[2] = 1;
// export function sendLoopBeat() {
// 	dummyArray[30] = 0.5 + Math.random() * 0.5;
// 	dummyArray[6] = 0.5 + Math.random() * 0.5;
// 	dummyArray[95] = 0.5 + Math.random() * 0.5;
// 	animateLightsOnBeat(dummyArray);
// 	setTimeout(() => sendLoopBeat(), 400);
// }
