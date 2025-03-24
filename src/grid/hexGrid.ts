import {
	PerspectiveCamera,
	Scene,
	InstancedMesh,
	WebGLRenderer,
	Raycaster,
	Vector2,
	Vector3,
	Matrix4,
	Color,
	Object3D,
	CylinderGeometry,
	ShaderMaterial,
	Layers,
	AmbientLight,
	DirectionalLight,
	MeshPhysicalMaterial,
} from "three";
import "three";
import {
	EffectComposer,
	OutputPass,
	UnrealBloomPass,
	ShaderPass,
	RenderPass,
} from "three/addons";

import debounce from "../lib/utils/debounce";
import {
	BASE_COLOR,
	BLOOM_PARAMS,
	BLOOM_SCENE,
	CAMERA_Z_DISTANCE,
	FPS_LIMIT,
	SIZE,
	TILE_HEIGHT,
	TILE_OPACITY,
	UNIT,
} from "../lib/constants/utils";
import { addHexCell } from "./addHexCell";
import { animateMove } from "./animateMove";
import { animateClick } from "./animateClick";
import {
	requestRenderIfNotRequested,
	setRenderRequested,
} from "./requestRender";

let canvas: HTMLCanvasElement | HTMLElement | null = null;
let camera: PerspectiveCamera | undefined;
let scene: Scene | undefined;
let renderer: WebGLRenderer | undefined;
let plane: InstancedMesh | undefined;

let cWidth = 0;
let cHeight = 0;

let bloomComposer: EffectComposer | null = null;
let finalComposer: EffectComposer | null = null;
let lastFrame = performance.now();

let centerX = 0;
let centerY = 0;

let dummy = new Object3D();

const bloomLayer = new Layers();
bloomLayer.set(BLOOM_SCENE);

const cellColor = new Color(BASE_COLOR);

const raycaster = new Raycaster();
const mouse = new Vector2(1, 1);

const fov = 80;

let lastIntersectionId: number | undefined;
export const setLastIntersectionId = (id: number) =>
	(lastIntersectionId = id);
export const getLastIntersectionId = () =>
	lastIntersectionId;

export function init() {
	camera = new PerspectiveCamera(
		fov,
		window.innerWidth / window.innerHeight,
		0.1,
		30
	);

	camera.position.set(0, 0, CAMERA_Z_DISTANCE);

	canvas = document.getElementById("webgl-canvas");

	if (!canvas || canvas.tagName !== "CANVAS") return;

	renderer = new WebGLRenderer({
		// antialias: false,
		canvas,
		alpha: true,
	});

	scene = new Scene();

	cWidth =
		canvas.parentElement?.clientWidth ||
		canvas.clientWidth;
	cHeight =
		canvas.parentElement?.clientHeight ||
		canvas.clientHeight;

	renderer.setSize(cWidth, cHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	// Objects

	_addGrid();
	_addLights();

	// POSTPROCESSING
	finalComposer = new EffectComposer(renderer);

	const renderScene = new RenderPass(scene, camera);

	const bloomPass = new UnrealBloomPass(
		new Vector2(window.innerWidth, window.innerHeight),
		BLOOM_PARAMS.strength,
		BLOOM_PARAMS.radius,
		BLOOM_PARAMS.threshold
	);

	bloomComposer = new EffectComposer(renderer);
	bloomComposer.renderToScreen = false;
	bloomComposer.addPass(renderScene);
	bloomComposer.addPass(bloomPass);

	const mixPass = new ShaderPass(
		new ShaderMaterial({
			uniforms: {
				baseTexture: { value: null },
				bloomTexture: {
					value: bloomComposer.renderTarget2
						.texture,
				},
			},
			vertexShader: `
      varying vec2 vUv;
  		void main() {
  			vUv = uv;
  			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  		}`,
			fragmentShader: `
      uniform sampler2D baseTexture;
  		uniform sampler2D bloomTexture;
  		varying vec2 vUv;
  		void main() {
  			gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
  		}`,
			defines: {},
		}),
		"baseTexture"
	);
	mixPass.needsSwap = true;

	const outputPass = new OutputPass();
	finalComposer.addPass(renderScene);
	finalComposer.addPass(mixPass);
	finalComposer.addPass(outputPass);

	// Rendering On Demand

	lastFrame = performance.now();

	// initial render
	if (!camera || !scene) return;

	_addGrid();
	_renderWithEffects();

	requestRenderIfNotRequested();

	//   Pointer Events
	function onPointerDown(event: PointerEvent) {
		mouse.x =
			(event.clientX / window.innerWidth) * 2 - 1;
		mouse.y =
			-(event.clientY / window.innerHeight) * 2 + 1;
		if (!plane || !camera || !scene) return;
		animateClick({
			plane,
			repeat: true,
			camera,
			raycaster,
			mouse,
		});
	}
	function onPointerMove(event: PointerEvent) {
		mouse.x =
			(event.clientX / window.innerWidth) * 2 - 1;
		mouse.y =
			-(event.clientY / window.innerHeight) * 2 + 1;
		if (!plane || !camera) return;
		animateMove({
			plane,
			repeat: false,
			camera,
			raycaster,
			mouse,
		});
	}

	function onTouchMove(event: TouchEvent) {
		// event.preventDefault();
		const touch =
			event.touches[0] || event.changedTouches[0];
		mouse.x = (touch.pageX / window.innerWidth) * 2 - 1;
		mouse.y =
			-(touch.pageY / window.innerHeight) * 2 + 1;
		if (!plane || !camera) return;
		animateMove({
			plane,
			repeat: false,
			camera,
			raycaster,
			mouse,
		});
	}

	document.addEventListener("pointermove", onPointerMove);
	document.addEventListener("touchmove", onTouchMove);
	document.addEventListener("pointerdown", onPointerDown);

	window.addEventListener("resize", () =>
		_resizeRendererToDisplaySize()
	);
}

const _resizeRendererToDisplaySize = debounce(() => {
	if (
		!renderer ||
		!canvas ||
		canvas.tagName !== "CANVAS" ||
		!camera ||
		!bloomComposer ||
		!finalComposer
	)
		return;

	console.log("needs resize");
	renderer.setSize(cWidth, cHeight, false);

	camera.aspect = cWidth / cHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(cWidth, cHeight);
	bloomComposer.setSize(cWidth, cHeight);
	finalComposer.setSize(cWidth, cHeight);

	_addGrid();
	requestRenderIfNotRequested();
}, 200);

export function render() {
	setRenderRequested(false);
	if (!scene || !camera || !renderer) return;

	if (needsResize()) _resizeRendererToDisplaySize();
	const now = performance.now();
	const deltaTime = now - lastFrame;
	const fpsMSLimit = 1000 / FPS_LIMIT;
	if (deltaTime > fpsMSLimit) {
		_renderWithEffects();
		lastFrame = now;
	}
}

// Resize events
const needsResize = () => {
	if (
		!renderer ||
		!canvas ||
		canvas.tagName !== "CANVAS" ||
		!camera
	)
		return;
	const width =
		canvas.parentElement?.clientWidth ||
		canvas.clientWidth;
	const height =
		canvas.parentElement?.clientHeight ||
		canvas.clientHeight;
	const dimensionsChanged =
		width !== cWidth || height !== cHeight;
	if (dimensionsChanged) {
		cWidth = width;
		cHeight = height;
		canvas.classList.replace(
			"opacity-100",
			"opacity-0"
		);
	}
	return dimensionsChanged;
};

function _renderWithEffects() {
	if (!renderer || !bloomComposer || !finalComposer)
		return;

	renderer.setClearColor(0x000000, 1.0);
	renderer.setClearAlpha(0.0);
	bloomComposer.render();

	renderer.setClearColor(0xffffff, 1.0);
	renderer.setClearAlpha(0.0);

	finalComposer.render();
}

// HEX GRID
const _addGrid = () => {
	if (!scene || !camera) return;

	const hexGeometry = new CylinderGeometry(
		SIZE * 0.95,
		SIZE * 0.95,
		SIZE * TILE_HEIGHT,
		6
	);
	hexGeometry.rotateX(Math.PI * 0.5);

	const hexMesh = new MeshPhysicalMaterial({
		color: BASE_COLOR,
		transparent: true,
		opacity: TILE_OPACITY,
	});

	const totalCols = Math.floor(
		_visibleWidthAtZDepth(CAMERA_Z_DISTANCE, camera) /
			UNIT
	);
	const totalRows = Math.floor(
		_visibleHeightAtZDepth(CAMERA_Z_DISTANCE, camera) /
			(SIZE * 2)
	);

	let cellCount = totalRows * totalCols;
	plane?.removeFromParent();
	plane = new InstancedMesh(
		hexGeometry,
		hexMesh,
		cellCount
	);
	plane.userData.phases = [];
	plane.userData.timers = [];
	plane.castShadow = true;
	plane.receiveShadow = true;
	plane.position.set(0, 0, 0);

	scene.add(plane);
	centerX = UNIT * 0.5 * totalCols;
	centerY = SIZE * 0.5 * (totalRows + 1);
	camera.position.set(
		centerX,
		centerY,
		CAMERA_Z_DISTANCE
	);

	camera.lookAt(centerX, centerY, 0);
	let iCount = 0;

	for (let r = 0; r < totalRows; r++)
		for (let c = 0; c < totalCols; c++) {
			if (!plane) return;
			let cVector;
			let rVector = new Vector3(0, SIZE * 1.5 * r, 0);
			if (r % 2 === 0) {
				cVector = new Vector3(UNIT * c, 0, 0);
			} else {
				cVector = new Vector3(
					UNIT * (c - 0.5),
					0,
					0
				);
			}

			addHexCell(
				dummy,
				cVector,
				rVector,
				iCount,
				plane,
				cellColor
			);
			iCount++;
		}
	plane.applyMatrix4(
		new Matrix4().makeTranslation(0, 0, 0.5)
	);
};

const _visibleWidthAtZDepth = (
	depth: number,
	camera: PerspectiveCamera
) => {
	const height = _visibleHeightAtZDepth(depth, camera);
	return height * camera.aspect;
};

const _visibleHeightAtZDepth = (
	depth: number,
	camera: PerspectiveCamera
) => {
	// compensate for cameras not positioned at z=0
	const cameraOffset = camera.position.z;
	if (depth < cameraOffset) depth -= cameraOffset;
	else depth += cameraOffset;

	// vertical fov in radians
	const vFOV = (camera.fov * Math.PI) / 180;

	// Math.abs to ensure the result is always positive
	return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
};

const _addLights = () => {
	if (!scene) return;
	// Lights
	const ambiLight = new AmbientLight(
		0xffffff,
		TILE_OPACITY > 0 ? 0.9 / TILE_OPACITY : 0
	);
	scene.add(ambiLight);

	const dirLight1 = new DirectionalLight(
		0x33ffff,
		TILE_OPACITY > 0 ? 0.4 / TILE_OPACITY : 0
	);
	dirLight1.position.set(0, centerY * 2 + 100 * UNIT, 0);
	dirLight1.lookAt(centerX, centerY, 0);
	scene.add(dirLight1);

	const dirLight2 = new DirectionalLight(
		0xaa55ee,
		TILE_OPACITY > 0 ? 0.4 / TILE_OPACITY : 0
	);
	dirLight2.position.set(-100 * UNIT, -100 * UNIT, 0);
	dirLight2.lookAt(centerX, centerY, 0);
	scene.add(dirLight2);

	const dirLight4 = new DirectionalLight(
		0xeeeeee,
		TILE_OPACITY > 0 ? 0.3 / TILE_OPACITY : 0
	);
	dirLight4.position.set(0, 0, 100 * UNIT);
	dirLight4.lookAt(centerX, centerY, 0);
	scene.add(dirLight4);
};

onload = () => init();
