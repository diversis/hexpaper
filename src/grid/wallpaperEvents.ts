import settings from "./settings";

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
				settings.baseColor =
					"0x" +
					_convertColor(
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
		},
	};
}

const _convertColor = (wallpaperEngineColor: string) => {
	const decColor = wallpaperEngineColor.split(" ");
	const hexColor = (+decColor
		.map((clr: unknown) => {
			if (typeof clr === "string") {
				const color = +clr;
				if (color) return Math.ceil(color * 255);
			}
			return 0;
		})
		.join("")).toString(16);
	return "0x" + hexColor;
};
