import { App, Modal } from "obsidian";
import { getBadge } from "src/utils/utils";

export class BasicDialog extends Modal {
	private actionButton: HTMLButtonElement;

	private title: string;
	private subtitle: string;
	private action: string;
	private onActionButtonClick: () => void;
	constructor(
		app: App,
		{
			title,
			subtitle,
			action,
			onActionButtonClick,
		}: {
			title: string;
			subtitle: string;
			action: string;
			onActionButtonClick: () => void;
		}
	) {
		super(app);
		this.title = title;
		this.subtitle = subtitle;
		this.action = action;
		this.onActionButtonClick = onActionButtonClick;
	}

	createInputPanel(): HTMLDivElement {
		const divMain = document.createElement("div");
		divMain.addClass("basic-dialog-main-div");

		const txtTitle = document.createElement("h4");
		txtTitle.addClass("basic-dialog-main-title");
		txtTitle.innerText = this.title;
		divMain.appendChild(txtTitle);

		const txtSubtitle = document.createElement("p");
		txtSubtitle.innerText = this.subtitle;
		txtSubtitle.addClass("basic-dialog-main-subtitle");
		divMain.appendChild(txtSubtitle);

		this.actionButton = document.createElement("button");
		this.actionButton.innerText = this.action;
		this.actionButton.tabIndex = -1;
		this.actionButton.addClass("basic-dialog-action-button");
		this.actionButton.addEventListener("click", this.onActionButtonClick);
		divMain.appendChild(this.actionButton);

		const badge = getBadge(120);
		badge.addClass("basic-dialog-badge");
		divMain.appendChild(badge);
		return divMain;
	}

	onOpen() {
		const { contentEl } = this;
		const divContainer = contentEl.createEl("div");
		divContainer.style.display = "flex";
		divContainer.style.flexDirection = "column";
		divContainer.style.alignItems = "stretch";

		const inputDiv = this.createInputPanel();
		divContainer.appendChild(inputDiv);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
