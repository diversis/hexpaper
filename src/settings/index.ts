import {
	ANIMATION_SPEED,
	BASE_COLOR,
	BEAT_ANIMATION_SPEED,
	BEAT_ENABLED,
	BEAT_IMPACT,
	FPS_LIMIT,
	SIZE,
	TILE_HEIGHT,
	TILE_OPACITY,
	UNIT,
} from "../lib/constants/utils";
import debounce from "../lib/utils/debounce";
import { init, resetGrid } from "../grid/hexGrid";
import { Color } from "three";

// let settingsContainer: HTMLDivElement | null = null;

type SettingsList = {
	[key: string]: {
		value: any;
		onChange: (value?: any) => void;
	};
};

const list = {
	fps: { value: FPS_LIMIT, onChange: () => {} },
	tileHeight: {
		value: TILE_HEIGHT,
		onChange: debounce(resetGrid, 200),
	},
	tileOpacity: {
		value: TILE_OPACITY,
		onChange: debounce(resetGrid, 200),
	},
	animationSpeed: {
		value: ANIMATION_SPEED,
		onChange: () => {},
	},
	baseColor: {
		value: BASE_COLOR,
		onChange: debounce((value: number) => {
			resetGrid(),
				(settings.baseThreeColor = new Color(
					value
				));
		}, 200),
	},
	tileSize: {
		value: SIZE,
		onChange: debounce(resetGrid, 200),
	},
	beatEnabled: {
		value: BEAT_ENABLED,
		onChange: debounce(init, 200),
	},
	beatImpact: {
		value: BEAT_IMPACT,
		onChange: debounce(init, 200),
	},
	beatAnimationSpeed: {
		value: BEAT_ANIMATION_SPEED,
		onChange: () => {},
	},
	baseThreeColor: {
		value: new Color(BASE_COLOR),
		onChange: () => {},
	},
	unit: {
		value: UNIT,
		onChange: debounce(init, 200),
	},
};

type Settings<T extends SettingsList> = {
	[K in keyof T]: T[K] extends { value: infer V }
		? V
		: never;
};

function createProxy<T extends SettingsList>(
	list: T
): Settings<T> {
	return new Proxy(list as any, {
		get(target, prop: string) {
			if (prop in target) {
				return target[prop].value;
			}
			return undefined;
		},
		set(target, prop: string, value) {
			target[prop].value = value;
			target[prop].onChange();
			// refreshSettings();
			return true;
		},
	});
}

const settings = createProxy(list);

export default settings;
// export const setupSettings = () => {
// 	refreshSettings();
// };

// export const refreshSettings = () => {
// 	settingsContainer =
// 		document.querySelector("div#settings");
// 	if (!settingsContainer) return;
// 	settingsContainer.innerHTML = "";
// 	Object.entries(settings).forEach(([key, value]) => {
// 		const propName = document.createElement("div");
// 		propName.innerText = key;
// 		const propValue = document.createElement("div");
// 		propValue.innerText = "" + value;
// 		const tab = document.createElement("div");
// 		tab.appendChild(propName);
// 		tab.appendChild(propValue);
// 		settingsContainer?.appendChild(tab);
// 	});

// 	const audioContainer = document.createElement("div");
// 	audioContainer.id = "audio-container";

// 	const audioName = document.createElement("div");
// 	audioName.innerText = "BEAT";

// 	const audioTab = document.createElement("div");
// 	audioTab.appendChild(audioName);
// 	audioTab.appendChild(audioContainer);
// 	settingsContainer.appendChild(audioTab);
// 	// _setupFpsInput();
// };

// const _setupFpsInput = () => {
// 	const inputFps = document.createElement("input");
// 	inputFps.id = "fpslimit";
// 	inputFps.value = settings.fps;
// 	const inputRow = document.createElement("div");
// 	const changeFpsButton =
// 		document.createElement("button");
// 	changeFpsButton.onclick = _changeFPS;
// 	changeFpsButton.innerText = "Apply";
// 	inputRow.appendChild(inputFps);
// 	inputRow.appendChild(changeFpsButton);
// 	settingsContainer?.appendChild(inputRow);
// };

// const _changeFPS = () => {
// 	const inputEl = document.querySelector(
// 		"input#fpslimit"
// 	) as HTMLInputElement | null;
// 	console.log(inputEl && inputEl.tagName == "INPUT");
// 	if (inputEl && inputEl.tagName == "INPUT") {
// 		settings.fps = +inputEl.value;
// 	}
// };
