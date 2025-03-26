import { Texture, TextureLoader, Scene } from "three";

export default function background({
	scene,
	path,
	canvas,
}: {
	scene: Scene;
	path?: string;
	canvas: HTMLElement;
}) {
	if (!scene || canvas.tagName !== "CANVAS") {
		return;
	}
	const texture = _getTexture({ path });

	const width =
		canvas.parentElement?.clientWidth ||
		canvas.clientWidth;
	const height =
		canvas.parentElement?.clientHeight ||
		canvas.clientHeight;

	const aspect = width / height;
	_cover({ texture, aspect });
	scene.background = texture;
}

const _getTexture = ({
	path = "/assets/textures/Image 1.jpg",
}: {
	path?: string;
}) => {
	const texture = new TextureLoader().load(
		path,
		(textureFromSrc) => {
			return textureFromSrc;
		},
		() => console.log("no texture file found")
	);

	return texture;
};

const _cover = ({
	texture,
	aspect,
}: {
	texture: Texture;
	aspect: number;
}) => {
	const imageAspect =
		texture.image.width / texture.image.height;

	if (aspect < imageAspect) {
		texture.matrix.setUvTransform(
			0,
			0,
			aspect / imageAspect,
			1,
			0,
			0.5,
			0.5
		);
	} else {
		texture.matrix.setUvTransform(
			0,
			0,
			1,
			imageAspect / aspect,
			0,
			0.5,
			0.5
		);
	}
};
