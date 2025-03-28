import {
	InstancedMesh,
	BufferGeometry,
	Material,
	Color,
	type InstancedMeshEventMap,
	type NormalBufferAttributes,
} from "three";

export function animateColor(
	plane: InstancedMesh<
		BufferGeometry<NormalBufferAttributes>,
		Material | Material[],
		InstancedMeshEventMap
	>,
	instanceId: number,
	from: Color,
	to: Color
) {
	return {
		update: (delta: number) => {
			if (delta > 1) delta = 1;
			from.lerp(to, delta);
			if (!from) return;
			plane.setColorAt(instanceId, from);

			if (!!plane.instanceColor)
				plane.instanceColor.needsUpdate = true;
		},
	};
}

export const getRNGColor = () =>
	new Color().setHSL(
		Math.random() * 0.3 + 0.5,
		0.95,
		Math.random() * 0.3 + 0.65
	);
