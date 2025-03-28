import {
	BufferGeometry,
	Clock,
	Color,
	InstancedMesh,
	Material,
	PerspectiveCamera,
	type InstancedMeshEventMap,
	type NormalBufferAttributes,
	type Raycaster,
	type Vector2,
} from "three";
import { Tween, Easing, Group } from "@tweenjs/tween.js";

import { getIntersection } from "./getIntersection";

import { requestRenderIfNotRequested } from "./requestRender";
import settings from "../settings";
import { updateCellMatrix } from "./updateCell";
import { animateColor, getRNGColor } from "./animateColors";

interface Props {
	plane: InstancedMesh<
		BufferGeometry<NormalBufferAttributes>,
		Material | Material[],
		InstancedMeshEventMap
	>;
	repeat: boolean;
	lastIntersectionId?: number;
	camera: PerspectiveCamera;
	raycaster: Raycaster;
	mouse: Vector2;
}

export const animateMove = ({
	plane,
	repeat,
	lastIntersectionId,
	camera,
	raycaster,
	mouse,
}: Props) => {
	// directLight.position.set(mouse.x, mouse.y, 5);
	const { tempCell, instanceId } = getIntersection({
		repeat,
		lastIntersectionId,
		camera,
		plane,
		raycaster,
		mouse,
	});

	if (!tempCell || !instanceId) return;
	const prevID = plane.userData.timers[instanceId];
	if (prevID) cancelAnimationFrame(prevID);
	plane.userData.timers[instanceId] = null;
	if (plane.userData.tweens) {
		plane.userData.tweens[instanceId]?.stop();
		plane.userData.tweens[instanceId] = null;
	}

	let clock = new Clock();

	const { phaseDepth, phaseY, phaseZ } =
		plane.userData.phases[instanceId];

	const introTime =
		8 /
		(settings.animationSpeed == 0
			? 1
			: settings.animationSpeed);
	const outroTime =
		12 /
		(settings.animationSpeed == 0
			? 1
			: settings.animationSpeed);
	const totalTime = introTime + outroTime;

	// Animate with tweenjs

	const tweenMove = new Tween({
		positionZ: tempCell.position.z,
		scaleZ: tempCell.scale.z,
		rotationX: tempCell.rotation.x,
		rotationY: tempCell.rotation.y,
		rotationZ: tempCell.rotation.z,
	})
		.to(
			{
				positionZ: phaseDepth * 0.0625,
				scaleZ: 1 + phaseDepth * 0.0025,
				rotationX: 0,
				rotationY: phaseY * 0.03275,
				rotationZ: phaseZ * 0.0625,
			},
			(1000 * introTime) /
				(settings.animationSpeed == 0
					? 1
					: settings.animationSpeed)
		)
		.easing(Easing.Exponential.Out)
		.onUpdate(
			({
				positionZ,
				scaleZ,
				rotationX,
				rotationY,
				rotationZ,
			}) => {
				updateCellMatrix(
					tempCell,
					{ z: positionZ },
					{ z: scaleZ },
					{
						x: rotationX,
						y: rotationY,
						z: rotationZ,
					},
					plane,
					instanceId
				);
			}
		)
		.onComplete(() => {
			updateCellMatrix(
				tempCell,
				{ z: phaseDepth * 0.0625 },
				{ z: 1 + phaseDepth * 0.0025 },
				{
					x: 0,
					y: phaseY * 0.03275,
					z: phaseZ * 0.0625,
				},
				plane,
				instanceId
			);
		})
		.onStop(() => {
			if (settings.freezeHexOnActiveTouch) return;
			updateCellMatrix(
				tempCell,
				{ z: 0 },
				{ z: 1 },
				{
					x: 0,
					y: 0,
					z: 0,
				},
				plane,
				instanceId
			);
		});
	const tweenToInitial = new Tween({
		positionZ: tempCell.position.z,
		scaleZ: tempCell.scale.z,
		rotationX: tempCell.rotation.x,
		rotationY: tempCell.rotation.y,
		rotationZ: tempCell.rotation.z,
	})
		.to(
			{
				positionZ: 0,
				scaleZ: 1,
				rotationX: 0,
				rotationY: 0,
				rotationZ: 0,
			},
			(1000 * outroTime) /
				(settings.animationSpeed == 0
					? 1
					: settings.animationSpeed)
		)
		.easing(Easing.Sinusoidal.In)
		.onUpdate(
			({
				positionZ,
				scaleZ,
				rotationX,
				rotationY,
				rotationZ,
			}) => {
				updateCellMatrix(
					tempCell,
					{ z: positionZ },
					{ z: scaleZ },
					{
						x: rotationX,
						y: rotationY,
						z: rotationZ,
					},
					plane,
					instanceId
				);
				updateCellMatrix(
					tempCell,
					{ z: positionZ },
					{ z: scaleZ },
					{
						x: rotationX,
						y: rotationY,
						z: rotationZ,
					},
					plane,
					instanceId
				);
			}
		)
		.onComplete(() => {
			updateCellMatrix(
				tempCell,
				{ z: 0 },
				{ z: 1 },
				{
					x: 0,
					y: 0,
					z: 0,
				},
				plane,
				instanceId
			);
			plane.userData.tweens[instanceId] = null;
		})
		.onStop(() => {
			updateCellMatrix(
				tempCell,
				{ z: 0 },
				{ z: 1 },
				{
					x: 0,
					y: 0,
					z: 0,
				},
				plane,
				instanceId
			);
		});
	tweenMove.chain(tweenToInitial);
	plane.userData.tweens[instanceId] = tweenMove;
	tweenMove.start();
	const tweenGroup = new Group(tweenMove, tweenToInitial);
	let currentColor = new Color();
	plane.getColorAt(instanceId, currentColor);
	const colorRNG = getRNGColor();

	const lerpToRNGColor = animateColor(
		plane,
		instanceId,
		currentColor,
		colorRNG
	);

	const lerpToBaseColor = animateColor(
		plane,
		instanceId,
		colorRNG,
		settings.baseThreeColor
	);

	const tick = (timestamp: number) => {
		if (!plane) return;

		let t =
			settings.animationSpeed *
			clock.getElapsedTime();

		if (t <= introTime) {
			lerpToRNGColor.update(t / introTime);
		} else {
			lerpToBaseColor.update(
				(t - introTime) / outroTime
			);
		}

		if (t < totalTime) {
			requestRenderIfNotRequested();
			window.requestAnimationFrame(tick);
		} else {
			if (plane.userData.tweens) {
				plane.userData.tweens[instanceId]?.stop();
				plane.userData.tweens[instanceId] = null;
			}
			requestRenderIfNotRequested();
		}
		// tweenGroup.update(timestamp);
	};
	plane.userData.timers[instanceId] =
		window.requestAnimationFrame(tick);
};
