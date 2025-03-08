import {
	InstancedMesh,
	BufferGeometry,
	Material,
	Color,
	type InstancedMeshEventMap,
	type NormalBufferAttributes,
} from "three";

export function setRNGColor(
	plane: InstancedMesh<
		BufferGeometry<NormalBufferAttributes>,
		Material | Material[],
		InstancedMeshEventMap
	>,
	instanceId: number
) {
	// plane.getColorAt(instanceId, curColor);
	// if (!baseColor.equals(curColor)) return;
	const color = new Color();

	const colored = color.setHSL(
		Math.random() * 0.3 + 0.5,
		0.95,
		Math.random() * 0.3 + 0.65
	);
	plane.setColorAt(instanceId, colored);
	if (!!plane.instanceColor)
		plane.instanceColor.needsUpdate = true;
}
