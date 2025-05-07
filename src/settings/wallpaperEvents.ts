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
			// Antialias
			if (properties.antialias) {
				settings.antialias =
					!!properties.antialias.value;
			}
			// Camera FOV
			if (properties.fov) {
				const inputFov = +properties.fov.value;
				if (inputFov)
					settings.cameraFov = Math.max(
						Math.min(Math.floor(inputFov), 110),
						50
					);
			}
			// FPS limit
			if (properties.fps) {
				const inputFps = +properties.fps.value;
				if (inputFps)
					settings.fps = Math.max(
						Math.min(Math.floor(inputFps), 240),
						0
					);
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
					+properties.tilesize.value / 100;
				if (inputSize)
					settings.tileSize = Math.max(
						Math.min(inputSize, 2.0),
						0.33
					);
			}

			// Tile Width
			if (properties.tilewidth) {
				const inputWidth =
					+properties.tilewidth.value / 100;
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
				if (inputOpacity)
					settings.tileOpacity = Math.max(
						Math.min(
							Math.floor(inputOpacity) / 100,
							1.0
						),
						0.0
					);
			}
			// Tile Material Iridescence
			if (properties.materialiridescence) {
				const inputIridescence =
					+properties.materialiridescence.value;
				if (inputIridescence)
					settings.hexMaterialIridescence =
						Math.max(
							Math.min(
								Math.floor(
									inputIridescence
								) / 100,
								1.0
							),
							0.0
						);
			}
			// Tile Material Reflectivity
			if (properties.materialreflectivity) {
				const inputReflectivity =
					+properties.materialreflectivity.value;
				if (inputReflectivity)
					settings.hexMaterialReflectivity =
						Math.max(
							Math.min(
								Math.floor(
									inputReflectivity
								) / 100,
								1.0
							),
							0.0
						);
			}
			// Camera Y Position
			// if (properties.camerayposition) {
			// 	const inputCameraYPosition =
			// 		+properties.camerayposition.value;
			// 	if (inputCameraYPosition)
			// 		settings.cameraYPosition = Math.max(
			// 			Math.min(
			// 				Math.floor(
			// 					inputCameraYPosition
			// 				),
			// 				100.0
			// 			),
			// 			0.0
			// 		);
			// }

			// Left Side Light enabled
			if (properties.enableleftsidelight) {
				settings.enableLeftSideLight =
					!!properties.enableleftsidelight.value;
			}
			// Right Side Light enabled
			if (properties.enablerightsidelight) {
				settings.enableRightSideLight =
					!!properties.enablerightsidelight.value;
			}
			// Left Side Light intensity
			if (properties.sidelightintensity) {
				const inputIntensity =
					+properties.sidelightintensity.value /
					10;
				if (inputIntensity)
					settings.leftSideLightIntensity =
						Math.max(
							Math.min(inputIntensity, 3),
							0
						);
			}
			// Right Side Light intensity
			if (properties.sidelightintensity) {
				const inputIntensity =
					+properties.sidelightintensity.value /
					10;
				if (inputIntensity)
					settings.rightSideLightIntensity =
						Math.max(
							Math.min(inputIntensity, 3),
							0
						);
			}

			// Left Side Light color
			if (properties.leftsidelightcolor) {
				if (
					typeof properties.leftsidelightcolor
						.value !== "string"
				)
					return;

				settings.leftSideLightColor = _convertColor(
					properties.leftsidelightcolor.value
				);
			}
			// Right Side Light color
			if (properties.rightsidelightcolor) {
				if (
					typeof properties.rightsidelightcolor
						.value !== "string"
				)
					return;

				settings.rightSideLightColor =
					_convertColor(
						properties.rightsidelightcolor.value
					);
			}
			// Top Light intensity
			if (properties.toplightintensity) {
				const inputIntensity =
					+properties.toplightintensity.value /
					100;
				if (inputIntensity)
					settings.topLightIntensity = Math.max(
						Math.min(inputIntensity, 3),
						0
					);
			}

			// Animation Speed
			if (properties.animationspeed) {
				const inputSpeed =
					+properties.animationspeed.value;
				if (inputSpeed)
					settings.animationSpeed = Math.max(
						Math.min(inputSpeed / 10, 250.0),
						0.0
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
				if (inputBeatImpact)
					settings.beatImpact = Math.max(
						Math.min(
							inputBeatImpact / 100,
							1.0
						),
						0.0
					);
			}

			// Beat animaiton speed
			if (properties.beatanimationspeed) {
				const inputBeatSpeed =
					+properties.beatanimationspeed.value;
				if (inputBeatSpeed)
					settings.beatAnimationSpeed = Math.max(
						Math.min(inputBeatSpeed, 150.0),
						0.0
					);
			}
		},
	};
}

const _convertColor = (wallpaperEngineColor: string) => {
	const inputColor = wallpaperEngineColor.split(" ");
	if (inputColor.length !== 3) return new Color(0x000000);
	const inputRGB = new Color().setRGB(
		+inputColor[0],
		+inputColor[1],
		+inputColor[2]
	);
	return inputRGB;
};

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
