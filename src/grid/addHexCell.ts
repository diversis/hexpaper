import {
	Color,
	Vector3,
	Object3D,
	type InstancedMesh,
	type BufferGeometry,
	type Material,
	type InstancedMeshEventMap,
	type NormalBufferAttributes,
} from "three";

export const addHexCell = (
	dummy: Object3D,
	centerVector: Vector3,
	// rVector: Vector3,
	iCount: number,
	plane: InstancedMesh<
		BufferGeometry<NormalBufferAttributes>,
		Material | Material[],
		InstancedMeshEventMap
	>,
	cellColor: Color
) => {
	if (!plane) return;
	dummy.position.copy(centerVector);
	dummy.updateMatrix();
	plane.setMatrixAt(iCount, dummy.matrix);
	plane.setColorAt(iCount, cellColor);

	plane.userData.phases.push({
		phaseX: (Math.random() - 0.5) * Math.PI * 2,
		phaseY: (Math.random() - 0.5) * Math.PI * 2,
		phaseZ: (Math.random() - 0.5) * Math.PI * 2,
		phaseDepth: Math.random() * Math.PI * 2,
	});
};
