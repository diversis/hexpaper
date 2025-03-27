import { Color, Vector3 } from "three";

export const SIZE = 1,
	CAMERA_Z_DISTANCE = 10,
	UNIT = Math.sqrt(3) * SIZE,
	ANGLE = Math.PI / 3,
	RANGLE = Math.PI,
	AXIS = new Vector3(0, 0, 1),
	AXIS_VECTOR = new Vector3(0, -UNIT, 0),
	AXIS_VECTOR_2 = new Vector3(0, SIZE, 0),
	RIGHT_SIDE_VECTOR = new Vector3(
		0,
		SIZE,
		0
	).applyAxisAngle(AXIS, ANGLE),
	LEFT_SIDE_VECTOR = new Vector3(
		0,
		SIZE,
		0
	).applyAxisAngle(AXIS, -ANGLE),
	BLOOM_PARAMS = {
		threshold: 0,
		strength: 4,
		radius: 0.02,
		exposure: 1,
	},
	BLOOM_SCENE = 1,
	BASE_COLOR = 0x14242f,
	baseColor = new Color(BASE_COLOR),
	ANIMATION_SPEED = 2,
	TILE_OPACITY = 1,
	TILE_HEIGHT = 0.2,
	FPS_LIMIT = 24,
	BEAT_IMPACT = 0;
