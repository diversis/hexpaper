import { Color } from "three";
import settings from ".";
import { animateLightsOnBeat } from "../grid/lights";

function wallpaperAudioListener(audioArray: number[]) {
	// Handle audio input here
	animateLightsOnBeat(audioArray);
}
window.wallpaperRegisterAudioListener?.(
	wallpaperAudioListener
);

export default function setupWallpaperEngineListener() {
	window.wallpaperPropertyListener = {
		// applyGeneralProperties: function (properties) {
		// 	if (properties.fps) {
		// 		//@ts-ignore
		// 		settings.fps = properties.fps;
		// 	}
		// },
		applyUserProperties: function (properties) {
			// FPS limit
			if (properties.fps) {
				const inputFps = +properties.fps.value;
				if (
					inputFps &&
					inputFps >= 0 &&
					inputFps <= 240
				)
					//@ts-ignore
					settings.fps = Math.floor(inputFps);
			}
			// Base Color
			if (properties.basecolor) {
				if (
					typeof properties.basecolor.value !==
					"string"
				)
					return;
				//@ts-ignore
				settings.baseColor = _getDarkBaseColor(
					properties.basecolor.value
				);
			}
			// Tile Size
			if (properties.tilesize) {
				const inputSize =
					+properties.tilesize.value;
				if (inputSize)
					//@ts-ignore
					settings.tileSize = Math.abs(inputSize);
			}

			// Tile Opacity
			if (properties.tileopacity) {
				const inputOpacity =
					+properties.tileopacity.value;
				if (
					inputOpacity &&
					inputOpacity >= 0 &&
					inputOpacity <= 100
				)
					//@ts-ignore
					settings.tileOpacity =
						Math.floor(inputOpacity) / 100;
			}

			// Animation Speed
			if (properties.animationspeed) {
				const inputSpeed =
					+properties.animationspeed.value;
				if (inputSpeed && inputSpeed >= 0)
					//@ts-ignore
					settings.animationSpeed =
						inputSpeed / 10;
			}

			// Beat impact
			if (properties.beatimpact) {
				const inputBeatImpact =
					+properties.beatimpact.value;
				if (inputBeatImpact && inputBeatImpact >= 0)
					//@ts-ignore
					settings.beatImpact =
						inputBeatImpact / 10;
			}
		},
	};
}

// const _convertColor = (wallpaperEngineColor: string) => {
// 	const inputColor = wallpaperEngineColor.split(" ");
// 	if (inputColor.length !== 3) return;
// 	const inputRGB = new Color().setRGB(
// 		+inputColor[0],
// 		+inputColor[1],
// 		+inputColor[2]
// 	);
// 	return inputRGB.getHex();
// };

const _getDarkBaseColor = (
	wallpaperEngineColor: string
) => {
	const inputColor = wallpaperEngineColor.split(" ");
	if (inputColor.length !== 3) return;
	const inputRGB = new Color().setRGB(
		+inputColor[0],
		+inputColor[1],
		+inputColor[2]
	);
	let inputHSL = { h: 0, s: 0, l: 0 };
	inputRGB.getHSL(inputHSL);
	inputHSL.l *= 0.1;
	return new Color()
		.setHSL(inputHSL.h, inputHSL.s, inputHSL.l)
		.getHex();
};
