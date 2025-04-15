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
import { Tween, Easing } from "@tweenjs/tween.js";

import { getIntersection } from "./getIntersection";

import { requestRenderIfNotRequested } from "./requestRender";
import settings from "../settings";
import { updateCellMatrix } from "./updateCell";
import {
	animateCellColor,
	getRNGColor,
} from "./animateColors";
import { setBaseColor } from "./setBaseColor";

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

export const animateClick = ({
	plane,
	repeat,
	lastIntersectionId,
	camera,
	raycaster,
	mouse,
}: Props) => {
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
	plane.userData.freeze[instanceId] =
		!plane.userData.freeze[instanceId];

	let clock = new Clock();

	const { phaseDepth, phaseZ } =
		plane.userData.phases[instanceId];

	const animationSpeed =
		settings.animationSpeed == 0
			? 1
			: settings.animationSpeed;
	const introTime = 4 / animationSpeed;
	const outroTime = 2 / animationSpeed;
	const totalTime = introTime + outroTime;

	// Animate with tweenjs
	const finalPosition = {
		z: phaseZ * phaseDepth * 0.00625,
	};
	const finalScale = { z: 1 };
	const randomSign = Math.sign(0.5 - Math.random());
	const finalRotation = {
		x: randomSign > 0 ? Math.PI : 0,
		y: randomSign < 0 ? Math.PI : 0,
		z: 0,
	};
	const tweenMove = new Tween({
		positionZ: tempCell.position.z,
		scaleZ: tempCell.scale.z,
		rotationX: tempCell.rotation.x,
		rotationY: tempCell.rotation.y,
		rotationZ: tempCell.rotation.z,
	})
		.to(
			{
				positionZ: finalPosition.z,
				scaleZ: finalScale.z,
				rotationX: finalRotation.x,
				rotationY: finalRotation.y,
				rotationZ: finalRotation.z,
			},
			1000 * introTime
		)
		.easing(Easing.Bounce.Out)
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
	// const tweenToInitial = new Tween({
	// 	positionZ: finalPosition.z,
	// 	scaleZ: finalScale.z,
	// 	rotationX: finalRotation.x,
	// 	rotationY: finalRotation.y,
	// 	rotationZ: finalRotation.z,
	// })
	// 	.to(
	// 		{
	// 			positionZ: 0.0,
	// 			scaleZ: 1,
	// 			rotationX: 0.0,
	// 			rotationY: 0.0,
	// 			rotationZ: 0.0,
	// 		},
	// 		1000 * outroTime
	// 	)
	// 	.easing(Easing.Linear.Out)
	// 	.onUpdate(
	// 		({
	// 			positionZ,
	// 			scaleZ,
	// 			rotationX,
	// 			rotationY,
	// 			rotationZ,
	// 		}) => {
	// 			updateCellMatrix(
	// 				tempCell,
	// 				{ z: positionZ },
	// 				{ z: scaleZ },
	// 				{
	// 					x: rotationX,
	// 					y: rotationY,
	// 					z: rotationZ,
	// 				},
	// 				plane,
	// 				instanceId
	// 			);
	// 		}
	// 	)
	// 	.onComplete(() => {
	// 		updateCellMatrix(
	// 			tempCell,
	// 			{ z: 0 },
	// 			{ z: 1 },
	// 			{
	// 				x: 0,
	// 				y: 0,
	// 				z: 0,
	// 			},
	// 			plane,
	// 			instanceId
	// 		);
	// 		plane.userData.tweens[instanceId] = null;
	// 	})
	// 	.onStop(() => {
	// 		updateCellMatrix(
	// 			tempCell,
	// 			{ z: 0 },
	// 			{ z: 1 },
	// 			{
	// 				x: 0,
	// 				y: 0,
	// 				z: 0,
	// 			},
	// 			plane,
	// 			instanceId
	// 		);
	// 	});
	// tweenMove.chain(tweenToInitial);
	plane.userData.tweens[instanceId] = tweenMove;
	tweenMove.start();
	// const tweenGroup = new Group(tweenMove, tweenToInitial);
	let currentColor = new Color();
	plane.getColorAt(instanceId, currentColor);
	const colorRNG = getRNGColor();

	const lerpToRNGColor = animateCellColor(
		plane,
		instanceId,
		currentColor,
		colorRNG
	);

	const lerpToBaseColor = animateCellColor(
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
		} else if (
			!plane.userData.freeze[instanceId] &&
			t <= totalTime
		) {
			lerpToBaseColor.update(
				(t - introTime) / outroTime
			);
		}
		tweenMove.update(timestamp);
		if (t <= totalTime || tweenMove.isPlaying()) {
			requestRenderIfNotRequested();
			window.requestAnimationFrame(tick);
		} else {
			if (plane.userData.tweens) {
				plane.userData.tweens[instanceId]?.stop();
				plane.userData.tweens[instanceId] = null;
			}
			if (!plane.userData.freeze[instanceId]) {
				setBaseColor(plane, instanceId);
			}
			requestRenderIfNotRequested();
		}
	};
	plane.userData.timers[instanceId] =
		window.requestAnimationFrame(tick);
};
