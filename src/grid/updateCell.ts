import {
	BufferGeometry,
	InstancedMesh,
	InstancedMeshEventMap,
	Material,
	NormalBufferAttributes,
	Object3D,
} from "three";

export const updateCellMatrix = (
	tempCell: Object3D,
	position: { x?: number; y?: number; z?: number },
	scale: { x?: number; y?: number; z?: number },
	rotation: { x?: number; y?: number; z?: number },
	plane: InstancedMesh<
		BufferGeometry<NormalBufferAttributes>,
		Material | Material[],
		InstancedMeshEventMap
	>,
	instanceId: number
) => {
	if (position.z && position.z > 1) {
		console.log(
			`updateCellMatrix: ${instanceId} ${position.z} ${scale.z}`
		);
	}
	tempCell.position.set(
		position.x === 0
			? 0
			: position.x || tempCell.position.x,
		position.y === 0
			? 0
			: position.y || tempCell.position.y,
		position.z === 0
			? 0
			: position.z || tempCell.position.z
	);
	tempCell.scale.set(
		scale.x === 0 ? 0 : scale.x || tempCell.scale.x,
		scale.y === 0 ? 0 : scale.y || tempCell.scale.y,
		scale.z === 0 ? 0 : scale.z || tempCell.scale.z
	);
	tempCell.rotation.set(
		rotation.x === 0
			? 0
			: rotation.x || tempCell.rotation.x,
		rotation.y === 0
			? 0
			: rotation.y || tempCell.rotation.y,
		rotation.z === 0
			? 0
			: rotation.z || tempCell.rotation.z
	);
	tempCell.updateMatrix();
	plane.setMatrixAt(instanceId, tempCell.matrix);

	plane.instanceMatrix.needsUpdate = true;
};
