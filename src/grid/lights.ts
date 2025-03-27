import {
	AmbientLight,
	DirectionalLight,
	Scene,
	Light,
} from "three";
import { UNIT } from "../lib/constants/utils";

let lights: Light[] = [];

export const addLights = ({
	scene,
	centerX,
	centerY,
}: {
	scene?: Scene;
	centerX: number;
	centerY: number;
}) => {
	if (!scene) return;
	// Lights
	const ambiLight = new AmbientLight(
		0xffffff, // @ts-ignore
		settings.tileOpacity > 0 // @ts-ignore
			? 0.9 / settings.tileOpacity
			: 0
	);
	scene.add(ambiLight);
	lights.push(ambiLight);

	const dirLight1 = new DirectionalLight(
		0x33ffff, // @ts-ignore
		settings.tileOpacity > 0 // @ts-ignore
			? 0.4 / settings.tileOpacity
			: 0
	);
	dirLight1.position.set(0, centerY * 2 + 100 * UNIT, 0);
	dirLight1.lookAt(centerX, centerY, 0);
	scene.add(dirLight1);
	lights.push(dirLight1);

	const dirLight2 = new DirectionalLight(
		0xaa55ee, // @ts-ignore
		settings.tileOpacity > 0 // @ts-ignore
			? 0.4 / settings.tileOpacity
			: 0
	);
	dirLight2.position.set(-100 * UNIT, -100 * UNIT, 0);
	dirLight2.lookAt(centerX, centerY, 0);
	scene.add(dirLight2);
	lights.push(dirLight2);

	const dirLight3 = new DirectionalLight(
		0xeeeeee, // @ts-ignore
		settings.tileOpacity > 0 // @ts-ignore
			? 0.3 / settings.tileOpacity
			: 0
	);
	dirLight3.position.set(0, 0, 100 * UNIT);
	dirLight3.lookAt(centerX, centerY, 0);
	scene.add(dirLight3);
	lights.push(dirLight3);
};

export const removeLights = () => {
	lights.forEach((light) => light.removeFromParent());
};

export const disposeLights = () => {
	lights.forEach((light) => {
		light?.dispose();
	});
	lights = [];
};
