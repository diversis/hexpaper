import { init } from "./grid/hexGrid";
// import { sendLoopBeat } from "./grid/lights";
import { setupSettings } from "./settings";
import setupWallpaperEngineListener from "./settings/wallpaperEvents";

onload = () => {
	init();
	setupSettings();
	setupWallpaperEngineListener();
	// sendLoopBeat();
};
