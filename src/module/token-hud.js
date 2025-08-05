// Structure taken from https://github.com/dev7355608/vision-5e/blob/ff2a91531480ec31c5b9200a785125054b927039/scripts/token-hud.mjs

export default (TokenHUD) => class extends TokenHUD {
	/** @override */
	static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
		actions: {
			"conditional-visibility.all": this.#conditionalVisibilityAll,
			"conditional-visibility.token": this.#conditionalVisibilityTokens
		}
	}, { inplace: false });

	/** @override */
	async _renderHTML(context, options) {
		const result = await super._renderHTML(context, options);

		const buttons = this.#getSelectableTokens();

		if (buttons.length) {
			const div = document.createElement("div");

			div.classList.add("palette", "visibility");
			div.dataset.palette = "visibility";

			for (const mode of buttons) {
				div.append(mode);
			}

			const visibilityButton = result.hud.querySelector(".control-icon[data-action=\"visibility\"]");
			visibilityButton.dataset.action = "togglePalette";
			visibilityButton.dataset.palette = "visibility";
			visibilityButton.insertAdjacentElement("afterend", div);
		}

		return result;
	}

	/**
	 * @returns {foundry.canvas.perception.VisionMode[]}
	 */
	#getSelectableTokens() {
		const flag = this.document.getFlag("conditional-visibility", "tokens") ?? [];
		const tokens = canvas.tokens.placeables
			.filter((t) => t.document.id !== this.document.id && !t.combatant?.defeated)
			.sort((a, b) => {
				const aIsPlayer = a.document.hasPlayerOwner ? 0 : 1;
				const bIsPlayer = b.document.hasPlayerOwner ? 0 : 1;
				if (aIsPlayer !== bIsPlayer) return aIsPlayer - bIsPlayer;
				return a.document.id.localeCompare(b.document.id);
			})
			.map((t) => {
				const img = document.createElement("img");
				// img.classList.add("token-control");
				if (flag.includes(t.document.id)) img.classList.add("active");

				img.src = t.document.texture.src;
				img.dataset.tooltip = t.name;
				img.dataset.tokenId = t.id;
				img.dataset.action = "conditional-visibility.token";
				img.addEventListener("pointerover", (event) => {
					const tokenId = event.currentTarget.dataset.tokenId;
					const token = canvas.tokens.placeables.find((t) => t.id === tokenId);
					token.hover = true;
					token.renderFlags.set({ refreshState: true });
				});
				img.addEventListener("pointerout", (event) => {
					const tokenId = event.currentTarget.dataset.tokenId;
					const token = canvas.tokens.placeables.find((t) => t.id === tokenId);
					token.hover = false;
					token.renderFlags.set({ refreshState: true });
				});
				return img;
			});
		const anchor = document.createElement("a");
		if (this.document.hidden) anchor.classList.add("active");
		anchor.innerText = "All Tokens";
		anchor.dataset.action = "conditional-visibility.all";
		tokens.unshift(anchor);
		return tokens;
	}

	static async #conditionalVisibilityAll(event, target) {
		await this.document.unsetFlag("conditional-visibility", "tokens");
		foundry.applications.hud.BasePlaceableHUD.DEFAULT_OPTIONS.actions.visibility.call(this, event, target);
	}

	static async #conditionalVisibilityTokens(event, target) {
		const tokenId = target.dataset.tokenId;
		let flags = this.document.getFlag("conditional-visibility", "tokens") ?? [];
		// Toggle
		if (flags.includes(tokenId)) flags = flags.filter((id) => id !== tokenId);
		else flags.push(tokenId);
		await this.document.setFlag("conditional-visibility", "tokens", flags);
		if (this.document.hidden) {
			foundry.applications.hud.BasePlaceableHUD.DEFAULT_OPTIONS.actions.visibility.call(this, event, target);
		} else canvas.perception.update({ refreshVision: true });
	}
};
