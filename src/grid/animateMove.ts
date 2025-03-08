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

interface Props {
  requestRenderIfNotRequested: () => void;
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
  requestRenderIfNotRequested,
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
    // let rngScale = Math.random() * 2 + 5;
    const tick = () => {
      if (!plane) return;
      // console.log(i);
      const { phaseDepth, phaseX, phaseY } = plane.userData.phases[instanceId];
      let t = 10 * clock.getElapsedTime();

      if (i < 4) {
        tempCell.position.z = Math.sin(phaseDepth + t) * 0.5;
        tempCell.rotation.set(
          Math.cos(phaseX + t * Math.sign(phaseX)) * Math.PI * 0.0625,

          Math.sin(phaseY + t * Math.sign(phaseY)) * Math.PI * 0.0625,
          0,
        );
      } else {
        tempCell.position.z = Math.sin(tempCell.position.z * (6 - i)) * 0.125;
        // console.log(Math.cos(Math.PI));
        tempCell.rotation.set(
          Math.cos(
            0.5 * Math.PI -
              0.1 *
                Math.abs(t * tempCell.rotation.x * (6 - i) * Math.sign(phaseX)),
          ) *
            Math.PI *
            0.0625,

          Math.sin(0.1 * t * tempCell.rotation.y * (6 - i)) * Math.PI * 0.0625,
          0,
        );
        if (i > 6) {
          i = 6;
        }
        if (i == 6 && !plane.userData.timers[instanceId]) {
          setBaseColor(plane, instanceId);
        }
      }
      // console.log(tempCell.rotation);
      tempCell.updateMatrix();
      // console.log(tempCell.scale.z);
      plane.setMatrixAt(instanceId, tempCell.matrix);
      plane.instanceMatrix.needsUpdate = true;
      if (i < 6) {
        // let t = Date.now() - clock;
        i += 0.1 * t;

        requestRenderIfNotRequested();
        window.requestAnimationFrame(tick);
      }
    };
    // requestRenderIfNotRequested();
    window.requestAnimationFrame(tick);
  }
};
