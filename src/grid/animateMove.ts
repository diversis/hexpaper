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
import {
	ANIMATION_SPEED,
	TILE_HEIGHT,
} from "../lib/constants/utils";
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

export const animateMove = ({
	render,
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

	if (tempCell.scale.z < 1.5) {
		setRNGColor(plane, instanceId);

		let i = 0;
		let clock = new Clock();
		let bloom = true;
		const tick = () => {
			if (!plane) return;
			const { phaseDepth, phaseX, phaseY } =
				plane.userData.phases[instanceId];
			let t =
				ANIMATION_SPEED * clock.getElapsedTime();

			if (i < 4) {
				tempCell.position.z =
					Math.sin(phaseDepth + t) * 0.25;
				tempCell.scale.z =
					TILE_HEIGHT +
					Math.sin(phaseDepth + t) * 0.5;
				tempCell.rotation.set(
					0,
					Math.cos(
						phaseX + t * Math.sign(phaseX)
					) *
						Math.PI *
						0.00625,

					Math.sin(
						phaseY + t * Math.sign(phaseY)
					) *
						Math.PI *
						0.05
				);
			} else {
				tempCell.position.z = Math.sin(
					tempCell.position.z * (6 - i) * 0.025
				);
				tempCell.scale.z =
					TILE_HEIGHT -
					Math.abs(
						Math.sin(tempCell.scale.z * (6 - i))
					);
				tempCell.rotation.set(
					0,
					Math.cos(
						0.5 * Math.PI -
							0.1 *
								t *
								tempCell.rotation.x *
								(6 - i) *
								Math.sign(phaseX)
					) *
						Math.PI *
						0.00625,

					Math.sin(
						0.1 *
							t *
							tempCell.rotation.y *
							(6 - i)
					) *
						Math.PI *
						0.05
				);
				if (i > 6) {
					i = 6;
				}
				if (
					bloom &&
					i > 4 &&
					!plane.userData.timers[instanceId]
				) {
					setBaseColor(plane, instanceId);
					bloom = false;
				}
			}
			if (i == 6) {
				tempCell.position.z = 0;
				tempCell.rotation.set(0, 0, 0);
				tempCell.scale.set(1, 1, 1);
				requestRenderIfNotRequested(render);
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
	}
};
