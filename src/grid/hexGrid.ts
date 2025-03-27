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
	MeshPhysicalMaterial,
} from "three";
import {
	EffectComposer,
	OutputPass,
	UnrealBloomPass,
	ShaderPass,
	RenderPass,
} from "three/addons";

import debounce from "../lib/utils/debounce";
import {
	BLOOM_PARAMS,
	BLOOM_SCENE,
	CAMERA_Z_DISTANCE,
	UNIT,
} from "../lib/constants/utils";
import { addHexCell } from "./addHexCell";
import { animateMove } from "./animateMove";
import { animateClick } from "./animateClick";
import {
	requestRenderIfNotRequested,
	setRenderRequested,
} from "./requestRender";
import settings from "../settings";
import {
	addLights,
	disposeLights,
	removeLights,
} from "./lights";

let canvas: HTMLCanvasElement | HTMLElement | null = null;
let camera: PerspectiveCamera | undefined;
let scene: Scene | undefined;
let renderer: WebGLRenderer | undefined;
let plane: InstancedMesh | undefined;
let hexGeometry: CylinderGeometry | null = null;
let hexMesh: MeshPhysicalMaterial | null = null;
let shaderMaterial: ShaderMaterial | null = null;

let cWidth = 0;
let cHeight = 0;

let bloomPass: UnrealBloomPass | null = null;
let mixPass: ShaderPass | null = null;
let bloomComposer: EffectComposer | null = null;
let finalComposer: EffectComposer | null = null;
let lastFrame = performance.now();

let centerX = 0;
let centerY = 0;

let dummy = new Object3D();

const bloomLayer = new Layers();
bloomLayer.set(BLOOM_SCENE);

const cellColor = new Color(settings.baseColor);

const raycaster = new Raycaster();
const mouse = new Vector2(1, 1);

const fov = 80;

let fpsMSLimit =
	settings.fps === 0 ? 0 : 1000 / settings.fps;

export function init() {
	_removeEventListeners();
	_clearScene();
	camera = new PerspectiveCamera(
		fov,
		window.innerWidth / window.innerHeight,
		0.1,
		30
	);

	camera.position.set(0, 0, CAMERA_Z_DISTANCE);

	canvas = document.querySelector("#webgl-canvas");

	if (!canvas || canvas.tagName !== "CANVAS") return;

	renderer = new WebGLRenderer({
		// antialias: false,
		canvas,
		alpha: true,
	});

	if (!scene) scene = new Scene();

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
	addLights({ scene, centerX, centerY });

	// POSTPROCESSING
	finalComposer = new EffectComposer(renderer);

	const renderScene = new RenderPass(scene, camera);

	bloomPass = new UnrealBloomPass(
		new Vector2(window.innerWidth, window.innerHeight),
		BLOOM_PARAMS.strength,
		BLOOM_PARAMS.radius,
		BLOOM_PARAMS.threshold
	);

	bloomComposer = new EffectComposer(renderer);
	bloomComposer.renderToScreen = false;
	bloomComposer.addPass(renderScene);
	bloomComposer.addPass(bloomPass);
	shaderMaterial = new ShaderMaterial({
		uniforms: {
			baseTexture: { value: null },
			bloomTexture: {
				value: bloomComposer.renderTarget2.texture,
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
	});
	mixPass = new ShaderPass(shaderMaterial, "baseTexture");
	mixPass.needsSwap = true;

	const outputPass = new OutputPass();
	finalComposer.addPass(renderScene);
	finalComposer.addPass(mixPass);
	finalComposer.addPass(outputPass);

	// Rendering On Demand

	lastFrame = performance.now();

	// initial render
	if (!camera || !scene) return;

	_renderWithEffects();

	requestRenderIfNotRequested();

	_addEventListeners();
	canvas.classList.replace("loading", "rendered");
}

// const _resetEventListeners = () => {
// 	_removeEventListeners();
// 	_addEventListeners();
// };

const _addEventListeners = () => {
	document.addEventListener(
		"pointermove",
		_onPointerMove
	);
	document.addEventListener("touchmove", _onTouchMove);
	document.addEventListener(
		"pointerdown",
		_onPointerDown
	);
	const appContainer = document.querySelector("#app");
	if (appContainer) resizeObserver.observe(appContainer);
};

//   Pointer Events
function _onPointerDown(event: PointerEvent) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	if (!plane || !camera || !scene) return;

	animateClick({
		plane,
		repeat: true,
		camera,
		raycaster,
		mouse,
	});
}
function _onPointerMove(event: PointerEvent) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	if (!plane || !camera) return;
	animateMove({
		plane,
		repeat: false,
		camera,
		raycaster,
		mouse,
	});
}

function _onTouchMove(event: TouchEvent) {
	// event.preventDefault();
	const touch =
		event.touches[0] || event.changedTouches[0];
	mouse.x = (touch.pageX / window.innerWidth) * 2 - 1;
	mouse.y = -(touch.pageY / window.innerHeight) * 2 + 1;
	if (!plane || !camera) return;
	animateMove({
		plane,
		repeat: false,
		camera,
		raycaster,
		mouse,
	});
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
	// init();
	renderer.setSize(cWidth, cHeight, false);

	camera.aspect = cWidth / cHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(cWidth, cHeight);
	bloomComposer.setSize(cWidth, cHeight);
	finalComposer.setSize(cWidth, cHeight);
	plane?.removeFromParent();
	removeLights();
	_disposeGrid();
	_addGrid();
	disposeLights();
	addLights({ scene, centerX, centerY });
	console.log("scene:", scene?.children);
	canvas.classList.replace("loading", "rendered");
	requestRenderIfNotRequested();
}, 200);

export function render() {
	setRenderRequested(false);
	if (!scene || !camera || !renderer) return;

	const now = performance.now();
	const deltaTime = now - lastFrame;
	const fpsLimit = settings.fps;

	if (!fpsLimit || fpsLimit === 0) {
		fpsMSLimit = 0;
	} else {
		fpsMSLimit = 1000 / fpsLimit;
	}
	if (deltaTime > fpsMSLimit) {
		_renderWithEffects();
		lastFrame = now;
	}
}

// Resize events

const resizeObserver = new ResizeObserver((entries) => {
	for (let entry of entries) {
		if (entry.target.tagName === "MAIN") {
			cHeight = entry.contentRect.height;
			cWidth = entry.contentRect.width;
			canvas?.classList.replace(
				"rendered",
				"loading"
			);
			_resizeRendererToDisplaySize();
		}
	}
});

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

	hexGeometry = new CylinderGeometry(
		settings.tileSize * 0.95,
		settings.tileSize * 0.95,
		settings.tileSize * settings.tileHeight,
		6
	);
	hexGeometry.rotateX(Math.PI * 0.5);

	hexMesh = new MeshPhysicalMaterial({
		color: settings.baseColor,
		transparent: true,
		opacity: settings.tileOpacity,
	});

	const totalCols = Math.floor(
		_visibleWidthAtZDepth(CAMERA_Z_DISTANCE, camera) /
			UNIT
	);
	const totalRows = Math.floor(
		_visibleHeightAtZDepth(CAMERA_Z_DISTANCE, camera) /
			(settings.tileSize * 2)
	);

	let cellCount = totalRows * totalCols;

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

	centerY = settings.tileSize * 0.5 * (totalRows + 1);
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

			let rVector = new Vector3(
				0,
				settings.tileSize * 1.5 * r,
				0
			);
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

// Disposal

const _clearScene = () => {
	if (scene) {
		scene.clear();
		_disposeGrid();
		disposeLights();
		_disposeRenderer();
		console.log("cleared scene: ", scene?.children);
	}
};

const _disposeRenderer = () => {
	mixPass?.dispose();
	mixPass = null;
	bloomPass?.dispose();
	bloomPass = null;
	shaderMaterial?.dispose();
	shaderMaterial = null;
	bloomComposer?.dispose();
	bloomComposer = null;
	finalComposer?.dispose();
	finalComposer = null;
	renderer?.dispose();
	renderer = undefined;
};

const _disposeGrid = () => {
	plane?.dispose();
	plane = undefined;
	hexGeometry?.dispose();
	hexGeometry = null;
	hexMesh?.map?.dispose();
	hexMesh?.dispose();
	hexMesh = null;
	console.log("disposed plane: ", plane);
};

const _removeEventListeners = () => {
	document.removeEventListener(
		"pointermove",
		_onPointerMove
	);
	document.removeEventListener("touchmove", _onTouchMove);
	document.removeEventListener(
		"pointerdown",
		_onPointerDown
	);
	resizeObserver.disconnect();
};

export function resetGrid() {
	plane?.removeFromParent();
	_disposeGrid();
	_addGrid();
}
