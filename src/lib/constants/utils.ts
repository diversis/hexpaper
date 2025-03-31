import { Color } from "three";

export const SIZE = 1,
	CAMERA_Z_DISTANCE = 10,
	UNIT = Math.sqrt(3) * SIZE,
	// ANGLE = Math.PI / 3,
	// RANGLE = Math.PI,
	// AXIS = new Vector3(0, 0, 1),
	// AXIS_VECTOR = new Vector3(0, -UNIT, 0),
	// AXIS_VECTOR_2 = new Vector3(0, SIZE, 0),
	// RIGHT_SIDE_VECTOR = new Vector3(
	// 	0,
	// 	SIZE,
	// 	0
	// ).applyAxisAngle(AXIS, ANGLE),
	// LEFT_SIDE_VECTOR = new Vector3(
	// 	0,
	// 	SIZE,
	// 	0
	// ).applyAxisAngle(AXIS, -ANGLE),
	BLOOM_PARAMS = {
		threshold: 0,
		strength: 4,
		radius: 0.02,
		exposure: 1,
	},
	BLOOM_SCENE = 1,
	BASE_COLOR = 0x14242f,
	baseColor = new Color(BASE_COLOR),
	LEFT_SIDE_LIGHT_COLOR = new Color(0x33ffff),
	RIGHT_SIDE_LIGHT_COLOR = new Color(0xff33ff),
	ANIMATION_SPEED = 4,
	TILE_OPACITY = 1,
	TILE_HEIGHT = 0.2,
	FPS_LIMIT = 60,
	BEAT_ENABLED = false,
	BEAT_IMPACT = 1,
	DIRECT_LIGHT_INTENSITY = 0.5,
	AMBIENT_LIGHT_INTENSITY = 0.9,
	DIRECT_TOP_LIGHT_INTENSITY = 0.4,
	BEAT_ANIMATION_SPEED = 60;
