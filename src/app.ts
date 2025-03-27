import { init } from "./grid/hexGrid";
import { setupSettings } from "./settings";
import setupWallpaperEngineListener from "./settings/wallpaperEvents";

onload = () => {
	init();
	setupSettings();
	setupWallpaperEngineListener();
};
