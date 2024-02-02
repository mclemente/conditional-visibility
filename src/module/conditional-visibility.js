import { ConditionalVisibilityHandler } from "./ConditionalVisibilityHandler.js";
import { registerSettings } from "./settings.js";

Hooks.once("init", async () => {
	game.conditionalVisibility = new ConditionalVisibilityHandler();
	Hooks.on("renderTokenHUD", (app, html, data) => game.conditionalVisibility._renderTokenHUD(app, html, data));
	libWrapper.register(
		"conditional-visibility",
		"DetectionMode.prototype._canDetect",
		(wrapped, visionSource, target) => {
			const src = visionSource.object.document;
			const tgt = target?.document;
			const flag = tgt.getFlag("conditional-visibility", "tokens");
			if (flag && flag.includes(src.id)) return false;
			return wrapped(visionSource, target);
		},
		"MIXED"
	);
});

Hooks.once("setup", async () => {});

Hooks.once("ready", async () => {});
