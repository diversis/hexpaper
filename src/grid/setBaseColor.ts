import { baseColor } from "../lib/constants/utils";
import {
	InstancedMesh,
	BufferGeometry,
	type NormalBufferAttributes,
	Material,
	type InstancedMeshEventMap,
} from "three";

export function setBaseColor(
	plane: InstancedMesh<
		BufferGeometry<NormalBufferAttributes>,
		Material | Material[],
		InstancedMeshEventMap
	>,
	instanceId: number
) {
	plane.setColorAt(instanceId, baseColor);
	if (!!plane.instanceColor)
		plane.instanceColor.needsUpdate = true;
}
