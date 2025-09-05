
import TokenHUDMixin from "./token-hud.js";

Hooks.once("init", async () => {
	CONFIG.Token.hudClass = TokenHUDMixin(CONFIG.Token.hudClass);
	libWrapper.register(
		"conditional-visibility",
		"DetectionMode.prototype.testVisibility",
		function (wrapped, visionSource, mode, { object, tests }) {
			const src = visionSource.object.document;
			const flag = object?.document?.getFlag("conditional-visibility", "tokens") ?? [];
			if (flag.includes(src.id)) return false;
			return wrapped(visionSource, mode, { object, tests });
		},
		"MIXED"
	);
});
