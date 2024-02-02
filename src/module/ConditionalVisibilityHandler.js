export class ConditionalVisibilityHandler {
	static tokenRefresh(tokenId) {
		canvas.scene?.tokens.get(tokenId)?.object.refresh();
	}

	/**
	 * @type {boolean}
	 * @private
	 */
	_buttonsActive = false;

	static settings() {}

	_renderTokenHUD(app, html, data) {
		const token = app?.object?.document;
		if (!token) return;

		ConditionalVisibilityHandler._addHudButton(html, token.object);
		html.find(".conditional-visibility")[0].classList.toggle("active", this._buttonsActive);
		html.find(".control-icon[data-action=\"visibility\"]").off("click"); // Remove default behavior

		// html.find(`.control-icon[data-action="visibility"]`).click(app._onClickControl.bind(app));
		html.find(".control-icon[data-action=\"visibility\"]")
			.on("click", (event) => {
				if (event.isDefaultPrevented()) return;
				if (!token.hidden && this._buttonsActive) this._buttonsActive = false;
				app._onClickControl(event);
				token.unsetFlag("conditional-visibility", "tokens");
			})
			// .on("click", ".conditional-visibility", (event) => {
			.on("click", ".token-control", (event) => {
				event.preventDefault();
				ConditionalVisibilityHandler._onToggleEffect(event, app);
				ConditionalVisibilityHandler._onEffectControl(event, app);
				if (token.hidden) app._onToggleVisibility(event);
				else canvas.perception.update({ refreshVision: true });
			})
			.on("contextmenu", (event) => {
				event.preventDefault();
				html.find(".conditional-visibility")[0].classList.toggle("active", !this._buttonsActive);
				this._buttonsActive = !this._buttonsActive;
			});
		// html.find(".token-control").click(UserInterface._onEffectControl.bind(app));
	}

	static _addHudButton(html, token) {
		const flag = token.document.getFlag("conditional-visibility", "tokens") ?? [];
		const playerCharacters = canvas.tokens.placeables
			.filter((t) => t.document.id !== token.id && t.document.hasPlayerOwner && !t.combatant?.defeated)
			.sort((a, b) => {
				let fa = a.document.id.toLowerCase();
				let fb = b.document.id.toLowerCase();
				if (fa < fb) return -1;
				if (fa > fb) return 1;
				return 0;
			})
			.map((t) => {
				return `<img class="token-control ${flag.includes(t.document.id) ? "active" : ""}" src="${
					t.document.texture.src
				}" title="${t.name}" data-token-id="${t.id}">`;
			})
			.join("");
		const NPCs = canvas.tokens.placeables
			.filter((t) => t.document.id !== token.id && !t.document.hasPlayerOwner && !t.combatant?.defeated)
			.sort((a, b) => {
				let fa = a.document.id.toLowerCase();
				let fb = b.document.id.toLowerCase();
				if (fa < fb) return -1;
				if (fa > fb) return 1;
				return 0;
			})
			.map((t) => {
				return `<img class="token-control ${flag.includes(t.document.id) ? "active" : ""}" src="${
					t.document.texture.src
				}" title="${t.name}" data-token-id="${t.id}">`;
			})
			.join("");
		const content = playerCharacters + NPCs;
		const button = $(`<div class="conditional-visibility">${content}</div>`);
		const visibilityButton = html.find(".control-icon[data-action=\"visibility\"]");
		visibilityButton.append(button);
	}

	static _onEffectControl(event, app) {
		event.preventDefault();
		// event.stopPropagation();
		if (app.object.hasActiveHUD) ConditionalVisibilityHandler.refreshVisibilityIcons(app);
	}

	static refreshVisibilityIcons(app) {
		const tokens = app.element.find(".conditional-visibility")[0];
		const statuses = ConditionalVisibilityHandler._getStatusEffectChoices(app);
		for (let token of tokens.children) {
			const status = statuses[token.getAttribute("src")] || {};
			token.classList.toggle("active", !!status.isActive);
		}
	}

	static _getStatusEffectChoices(app) {
		const token = app.object;
		const doc = token.document;

		// Get statuses which are active for the token actor
		const flag = doc.getFlag("conditional-visibility", "tokens");
		const statuses = flag
			? flag.reduce((obj, flag) => {
				for (const id of flag) {
					obj[id] = { id };
				}
				return obj;
			}, {})
			: {};

		// Prepare the list of effects from the configured defaults and any additional effects present on the Token
		const tokenEffects = foundry.utils.deepClone(doc.flags["conditional-visibility"]?.tokens) || [];
		return tokenEffects.reduce((obj, token) => {
			const src = token.icon ?? token;
			if (src in obj) return obj;
			const status = statuses[token.id] || {};
			const isActive = !!status.id || doc.effects.includes(src);
			/** @deprecated since v11 */
			const label = token.name ?? token.label;
			obj[src] = {
				id: token.id ?? "",
				title: label ? game.i18n.localize(label) : null,
				src,
				isActive,
				cssClass: isActive ? "active" : ""
			};
			return obj;
		}, {});
	}

	static _onToggleEffect(event, app) {
		event.preventDefault();
		event.stopPropagation();
		let token = event.currentTarget;
		const tokenId = token.dataset.tokenId;
		let flags = app.object.document.getFlag("conditional-visibility", "tokens") ?? [];
		// Toggle
		if (flags.includes(tokenId)) {
			flags = flags.filter((id) => id !== tokenId);
		} else {
			flags.push(tokenId);
		}
		return app.object.document.setFlag("conditional-visibility", "tokens", flags);
	}
}
