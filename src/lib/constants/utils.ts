import { Color, Vector3 } from "three";

export const SIZE = 1,
	CAMERA_Z_DISTANCE = 12,
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
		strength: 0.5,
		radius: 0.2,
		exposure: 1,
	},
	BLOOM_SCENE = 1,
	BASE_COLOR = 0x14242f,
	baseColor = new Color(BASE_COLOR),
	EMAIL_REGEX =
		/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
	API_REQ_LIMIT = 10;
