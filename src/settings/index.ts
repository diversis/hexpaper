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
		onChange: debounce(() => {
			_refreshGridVectors();
			resetGrid();
		}, 200),
	},
	tileWidth: {
		value: SIZE * 0.9,
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
		onChange: () => {},
	},
	// rightSideVector: {
	// 	value: RIGHT_SIDE_VECTOR,
	// 	onChange: () => {},
	// },
	// leftSideVector: {
	// 	value: LEFT_SIDE_VECTOR,
	// 	onChange: () => {},
	// },
	// axisVector: {
	// 	value: AXIS_VECTOR,
	// 	onChange: () => {},
	// },
	// axisVector2: {
	// 	value: AXIS_VECTOR_2,
	// 	onChange: () => {},
	// },
};

type Settings<T extends SettingsList> = {
	[K in keyof T]: T[K] extends { value: infer V }
		? V
		: never;
};

const _refreshGridVectors = () => {
	settings.unit = Math.sqrt(3) * settings.tileSize;
	// settings.axisVector = new Vector3(0, -settings.unit, 0);
	// settings.axisVector2 = new Vector3(
	// 	0,
	// 	settings.tileSize,
	// 	0
	// );
	// settings.rightSideVector = new Vector3(
	// 	0,
	// 	settings.tileSize,
	// 	0
	// ).applyAxisAngle(AXIS, ANGLE);
	// settings.leftSideVector = new Vector3(
	// 	0,
	// 	settings.tileSize,
	// 	0
	// ).applyAxisAngle(AXIS, -ANGLE);
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
