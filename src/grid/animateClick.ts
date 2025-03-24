import {
	BufferGeometry,
	Clock,
	InstancedMesh,
	Material,
	PerspectiveCamera,
	type InstancedMeshEventMap,
	type NormalBufferAttributes,
	type Raycaster,
	type Vector2,
} from "three";
import { getIntersection } from "./getIntersection";
import { setRNGColor } from "./setRNGColor";
import { setBaseColor } from "./setBaseColor";
import { requestRenderIfNotRequested } from "./requestRender";

interface Props {
	render: () => void;
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
	render,
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
	setRNGColor(plane, instanceId);
	let i = 0;
	let clock = new Clock();

	const tick = () => {
		if (!plane) return;
		// console.log(i);
		const { phaseDepth, phaseX, phaseY } =
			plane.userData.phases[instanceId];

		clearTimeout(plane.userData.timers?.[instanceId]);
		const timer = setTimeout(() => {
			setBaseColor(plane, instanceId);
			plane.userData.timers[instanceId] = null;
			if (!!plane.instanceColor)
				plane.instanceColor.needsUpdate = true;
			tempCell.updateMatrix();
		}, 100);
		plane.userData.timers[instanceId] = timer;

		let t = 10 * clock.getElapsedTime();

		if (i < 4) {
			tempCell.position.z =
				Math.sin(phaseDepth + t) * 0.5;
			tempCell.rotation.set(
				Math.cos(phaseX + t * Math.sign(phaseX)) *
					Math.PI *
					0.0625,

				Math.sin(phaseY + t * Math.sign(phaseY)) *
					Math.PI *
					0.0625,
				0
			);
			tempCell.scale.x =
				1 +
				Math.cos(phaseX + t * Math.sign(phaseX)) *
					Math.PI *
					0.0625;
			tempCell.scale.y =
				1 +
				Math.sin(phaseY + t * Math.sign(phaseY)) *
					Math.PI *
					0.0625;
		} else {
			if (i > 6) {
				i = 6;
			}
			tempCell.position.z =
				Math.sin(tempCell.position.z * (6 - i)) *
				0.125;
			tempCell.rotation.set(
				Math.cos(
					0.5 * Math.PI -
						0.1 *
							Math.abs(
								t *
									tempCell.rotation.x *
									(6 - i) *
									Math.sign(phaseX)
							)
				) *
					Math.PI *
					0.0625,

				Math.sin(
					0.1 * t * tempCell.rotation.y * (6 - i)
				) *
					Math.PI *
					0.0625,
				0
			);
			tempCell.scale.x =
				1 +
				Math.cos(
					0.5 * Math.PI -
						0.1 *
							Math.abs(
								t *
									tempCell.rotation.x *
									(6 - i) *
									Math.sign(phaseX)
							)
				);
			tempCell.scale.y =
				1 +
				Math.cos(
					0.5 * Math.PI -
						0.1 *
							Math.abs(
								t *
									tempCell.rotation.x *
									(6 - i) *
									Math.sign(phaseX)
							)
				) *
					Math.PI *
					0.0625;
		}
		tempCell.updateMatrix();
		plane.setMatrixAt(instanceId, tempCell.matrix);
		plane.instanceMatrix.needsUpdate = true;
		if (i < 6) {
			i += 0.1 * t;

			requestRenderIfNotRequested(render);
			window.requestAnimationFrame(tick);
		}
	};
	window.requestAnimationFrame(tick);
};
