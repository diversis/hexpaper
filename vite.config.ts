import { defineConfig } from "vite";

export default defineConfig({
	base: "",
	build: {
		// dont minify JS and CSS
		// minify: false,
		target: ["chrome124"],
		rollupOptions: {
			output: {
				// remove hashes from output paths
				// https://github.com/vitejs/vite/issues/378
				entryFileNames: `assets/[name].js`,
				chunkFileNames: `assets/[name].js`,
				assetFileNames: `assets/[name].[ext]`,
			},
		},
	},
});
