import { App, Modal } from "obsidian";
import { API_MANAGEMENT_URL, API_PRICING_URL } from "src/utils/constants";
import { getBadge } from "src/utils/utils";

export class QuotaExceededDialog extends Modal {
	private upgradeButton: HTMLButtonElement;

	private onUpgradeButtonClick: () => void;
	constructor(
		app: App,
		{
			onUpgradeButtonClick: onUpgradeButtonClick,
		}: {
			onUpgradeButtonClick: () => void;
		}
	) {
		super(app);
		this.onUpgradeButtonClick = onUpgradeButtonClick;
	}

	createInputPanel(): HTMLDivElement {
		const divMain = document.createElement("div");
		divMain.addClass("quota-exceeded-dialog-main-div");

		const txtTitle = document.createElement("h4");
		txtTitle.addClass("quota-exceeded-dialog-title");
		txtTitle.innerText = "Plan quota limit reached";
		divMain.appendChild(txtTitle);

		const divRow = document.createElement("div");
		divMain.appendChild(divRow);

		const txtSubtitle = document.createElement("span");
		txtSubtitle.addClass("quota-exceeded-dialog-subtitle");
		txtSubtitle.setText(
			"It seems your plan has reached its quota limit. Consider upgrading to a higher plan."
		);

		divRow.appendChild(txtSubtitle);

		const manageSubscription = document.createElement("a");
		manageSubscription.href = API_MANAGEMENT_URL;
		manageSubscription.text = "Check usage & manage subscription";
		manageSubscription.target = "_blank";
		manageSubscription.addClass(
			"quota-exceeded-dialog-manage-subscription-link"
		);
		divRow.appendChild(manageSubscription);

		this.upgradeButton = document.createElement("button");
		this.upgradeButton.innerText = "Upgrade plan";
		this.upgradeButton.addClass("quota-exceeded-dialog-upgrade-button");
		this.upgradeButton.addEventListener("click", this.onUpgradeButtonClick);
		divMain.appendChild(this.upgradeButton);

		const badge = getBadge(120, API_PRICING_URL);
		badge.addClass("quota-exceeded-dialog-badge");
		divMain.appendChild(badge);
		return divMain;
	}

	onOpen() {
		const { contentEl } = this;
		const divContainer = contentEl.createEl("div");
		divContainer.addClass("quota-exceeded-dialog-container");
		const inputDiv = this.createInputPanel();
		divContainer.appendChild(inputDiv);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
