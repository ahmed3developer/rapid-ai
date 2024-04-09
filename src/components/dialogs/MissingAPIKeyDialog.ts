import { App, Modal } from "obsidian";
import { getBadge } from "src/utils/utils";

export class MissingAPIKeyDialog extends Modal {
	private actionButton: HTMLButtonElement;

	private apiLink: string;
	private onGoToSettingsClick: () => void;
	constructor(
		app: App,
		{
			apiLink,
			onGoToSettingsClick,
		}: {
			apiLink: string;
			onGoToSettingsClick: () => void;
		}
	) {
		super(app);
		this.apiLink = apiLink;
		this.onGoToSettingsClick = onGoToSettingsClick;
	}

	createInputPanel(): HTMLDivElement {
		const divMain = document.createElement("div");
		divMain.addClass("missing-key-dialog-main-div");

		const txtTitle = document.createElement("h3");
		txtTitle.innerText = "Missing API Key";
		txtTitle.addClass("missing-key-dialog-title");
		divMain.appendChild(txtTitle);

		const hrefSubtitle = document.createElement("a");
		hrefSubtitle.href = this.apiLink;
		hrefSubtitle.text = "You can obtain an API key from here";
		hrefSubtitle.target = "_blank";
		divMain.appendChild(hrefSubtitle);

		const badge = getBadge(120);
		badge.addClass("missing-key-dialog-badge");
		divMain.appendChild(badge);

		const txtSettingsTip = document.createElement("p");
		txtSettingsTip.addClass("missing-key-dialog-tip-text");
		txtSettingsTip.innerText =
			"After you get the API key, connect it from the settings plugin.";
		divMain.appendChild(txtSettingsTip);

		this.actionButton = document.createElement("button");
		this.actionButton.innerText = "Go to Settings";
		this.actionButton.addClass("missing-key-dialog-action-button");
		this.actionButton.addEventListener("click", this.onGoToSettingsClick);
		divMain.appendChild(this.actionButton);
		return divMain;
	}

	onOpen() {
		const { contentEl } = this;
		const divContainer = contentEl.createEl("div");
		divContainer.addClass("missing-key-dialog-main-container");
		const inputDiv = this.createInputPanel();
		divContainer.appendChild(inputDiv);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
