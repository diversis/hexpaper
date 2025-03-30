import { Color } from "three";
import settings from ".";
import { animateLightsOnBeat } from "../grid/lights";
import { BASE_COLOR } from "../lib/constants/utils";

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
		//
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
					settings.fps = Math.floor(inputFps);
			}
			// Base Color
			if (properties.basecolor) {
				if (
					typeof properties.basecolor.value !==
					"string"
				)
					return;

				settings.baseColor = _getDarkBaseColor(
					properties.basecolor.value
				);
			}
			// Tile Size
			if (properties.tilesize) {
				const inputSize =
					+properties.tilesize.value;
				if (inputSize)
					settings.tileSize = Math.max(
						Math.min(inputSize, 2.0),
						0.33
					);
			}

			// Tile Width
			if (properties.tilewidth) {
				const inputWidth =
					+properties.tilewidth.value;
				if (inputWidth)
					settings.tileWidth = Math.max(
						Math.min(
							Math.abs(inputWidth * 0.95),
							1.0
						),
						0.5
					);
			}

			// Tile Height
			if (properties.tileheight) {
				const inputHeight =
					+properties.tileheight.value / 10;
				if (inputHeight)
					settings.tileHeight = Math.min(
						Math.max(
							Math.abs(inputHeight),
							0.01
						),
						2
					);
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
					settings.tileOpacity =
						Math.floor(inputOpacity) / 100;
			}

			// Animation Speed
			if (properties.animationspeed) {
				const inputSpeed =
					+properties.animationspeed.value;
				if (inputSpeed && inputSpeed >= 0)
					settings.animationSpeed = Math.min(
						inputSpeed / 10,
						250.0
					);
			}

			// Beat enabled
			if (properties.beatenabled) {
				settings.beatEnabled =
					!!properties.beatenabled.value;
			}

			// Beat impact
			if (properties.beatimpact) {
				const inputBeatImpact =
					+properties.beatimpact.value;
				if (inputBeatImpact && inputBeatImpact >= 0)
					settings.beatImpact = Math.min(
						inputBeatImpact / 100,
						1.0
					);
			}

			// Beat animaiton speed
			if (properties.beatanimationspeed) {
				const inputBeatSpeed =
					+properties.beatanimationspeed.value;
				if (inputBeatSpeed && inputBeatSpeed >= 0)
					settings.beatAnimationSpeed = Math.min(
						inputBeatSpeed,
						150.0
					);
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
	if (inputColor.length !== 3) return BASE_COLOR;
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
