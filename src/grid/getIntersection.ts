import {
  BufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  Object3D,
  PerspectiveCamera,
  type InstancedMeshEventMap,
  type NormalBufferAttributes,
  type Raycaster,
  type Vector2,
} from "three";
import { getLastIntersectionId, setLastIntersectionId } from "./lastIntersection";

interface Props {
  repeat?: boolean;
  lastIntersectionId?: number;
  camera: PerspectiveCamera | null;
  plane: InstancedMesh<
    BufferGeometry<NormalBufferAttributes>,
    Material | Material[],
    InstancedMeshEventMap
  > | null;
  raycaster: Raycaster;
  mouse: Vector2;
}

export const getIntersection = ({
  repeat = false,
  camera,
  plane,
  raycaster,
  mouse,
}: Props) => {
  if (!camera || !plane) return {};

  raycaster.setFromCamera(mouse, camera);

  const intersection = raycaster.intersectObject(plane);

  if (intersection.length < 1) return {};

  const instanceId = intersection[0].instanceId;
  const lastIntersectionId = getLastIntersectionId();
  if (!instanceId || (!repeat && lastIntersectionId === instanceId)) return {};

  setLastIntersectionId(instanceId);
  if (!instanceId || !plane) return {};
  let mat4 = new Matrix4();
  plane.getMatrixAt(instanceId, mat4);
  const tempCell = new Object3D();
  mat4.decompose(tempCell.position, tempCell.quaternion, tempCell.scale);

  return { tempCell, instanceId };
};
