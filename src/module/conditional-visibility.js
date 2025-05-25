
import TokenHUDMixin from "./token-hud.js";

Hooks.once("init", async () => {
	CONFIG.Token.hudClass = TokenHUDMixin(CONFIG.Token.hudClass);
	libWrapper.register(
		"conditional-visibility",
		"DetectionMode.prototype._canDetect",
		(wrapped, visionSource, target) => {
			const src = visionSource.object.document;
			const tgt = target?.document;
			const flag = tgt.getFlag("conditional-visibility", "tokens") ?? [];
			if (flag.includes(src.id)) return false;
			return wrapped(visionSource, target);
		},
		"MIXED"
	);
});

Hooks.once("setup", async () => {});

Hooks.once("ready", async () => {});
