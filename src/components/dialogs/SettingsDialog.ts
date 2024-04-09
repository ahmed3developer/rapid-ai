import { App, DropdownComponent, Modal, setIcon } from "obsidian";
import { API_URL, API_MANAGEMENT_URL } from "src/utils/constants";
import { langauges } from "src/utils/languages";
import { getBadge } from "src/utils/utils";

export class SettingsDialog extends Modal {
	private testKeyButton: HTMLButtonElement;
	private APIKeyTextbox: HTMLInputElement;
	private currentAPIKey: string;
	private currentTranslateTo: string;

	private onTestKeyClick: (key: string) => void;
	private onAPIKeyChange: (key: string) => void;
	private onLanguageChange: (language: string) => void;
	private txtTestResult: HTMLSpanElement;
	private iconTestResult: HTMLSpanElement;
	private divTestResult: HTMLDivElement;
	private TestButtonContent = "Test API Key";
	constructor(
		app: App,
		{
			currentAPIKey,
			currentTranslateTo,
			onTestKeyClick,
			onAPIKeyChange,
			onlanguageChange,
		}: {
			currentAPIKey: string;
			currentTranslateTo: string;
			onTestKeyClick: (key: string) => void;
			onAPIKeyChange: (key: string) => void;
			onlanguageChange: (langauge: string) => void;
		}
	) {
		super(app);
		this.currentAPIKey = currentAPIKey;
		this.currentTranslateTo = currentTranslateTo;
		this.onTestKeyClick = onTestKeyClick;
		this.onAPIKeyChange = onAPIKeyChange;
		this.onLanguageChange = onlanguageChange;
	}

	setTestStatus(status: string, icon: string) {
		this.txtTestResult.innerText = status;
		setIcon(this.iconTestResult, icon);
	}

	setStatusVisiblity(isVisible: boolean) {
		if (isVisible) {
			this.divTestResult.style.display = "flex";
		} else {
			this.divTestResult.style.display = "none";
		}
	}

	setLoadingState(isLoading: boolean) {
		if (isLoading) {
			this.testKeyButton.setText("Sending ...");
		} else {
			this.testKeyButton.setText(this.TestButtonContent);
		}
	}

	private createSettingsDiv(): HTMLDivElement {
		const divMain = document.createElement("div");
		divMain.addClass("settings-dialog-main-div");

		const titleText = document.createElement("h4");
		titleText.innerText = "Rapid API Key";
		titleText.addClass("settings-dialog-title");
		divMain.appendChild(titleText);

		const divAPIKey = document.createElement("div");
		divAPIKey.addClass("settings-dialog-api-key-div");
		divMain.appendChild(divAPIKey);

		this.APIKeyTextbox = document.createElement("input");
		this.APIKeyTextbox.value = this.currentAPIKey;
		this.APIKeyTextbox.addClass("settings-dialog-api-textbox");
		divAPIKey.appendChild(this.APIKeyTextbox);
		this.APIKeyTextbox.addEventListener("input", (event) => {
			this.onAPIKeyChange(this.APIKeyTextbox.value);
		});

		const divTest = document.createElement("div");
		divTest.addClass("settings-dialog-test-div");
		divMain.appendChild(divTest);

		this.testKeyButton = document.createElement("button");
		this.testKeyButton.addClass("settings-dialog-test-key-button");
		this.testKeyButton.setText(this.TestButtonContent);
		this.testKeyButton.addEventListener("click", () => {
			this.onTestKeyClick(this.APIKeyTextbox.value);
		});
		divTest.appendChild(this.testKeyButton);
		this.divTestResult = document.createElement("div");
		this.divTestResult.addClass("settings-dialog-test-result-div");
		divTest.appendChild(this.divTestResult);

		this.iconTestResult = document.createElement("span");
		setIcon(this.iconTestResult, "badge-check");
		this.iconTestResult.addClass("settings-dialog-test-result-icon");
		this.divTestResult.appendChild(this.iconTestResult);

		this.txtTestResult = document.createElement("span");
		this.txtTestResult.addClass("settings-dialog-test-result-text");
		this.txtTestResult.innerText = "It Works Perfctly";
		this.divTestResult.appendChild(this.txtTestResult);

		const anchorElement = document.createElement("a");
		anchorElement.href = API_URL;
		anchorElement.text = "Get your API key from here";
		anchorElement.addClass("settings-dialog-anchor");
		anchorElement.target = "_blank";
		divMain.appendChild(anchorElement);

		const badge = getBadge(140);
		badge.addClass("settings-dialog-badge");
		divMain.appendChild(badge);

		const manageSubscription = document.createElement("a");
		manageSubscription.href = API_MANAGEMENT_URL;
		manageSubscription.text = "Check Usage & Manage Subscription";
		manageSubscription.addClass("settings-dialog-manage-subscription");
		manageSubscription.target = "_blank";
		divMain.appendChild(manageSubscription);

		const hr = document.createElement("hr");
		hr.addClass("settings-dialog-hr");
		divMain.appendChild(hr);

		const languageDiv = this.createLanguageDiv();
		divMain.appendChild(languageDiv);
		return divMain;
	}
	createLanguageDiv(): HTMLDivElement {
		const divMain = document.createElement("div");
		divMain.addClass("settings-dialog-language-div");

		const txtTitle = document.createElement("h4");
		txtTitle.innerText = "Translation";
		txtTitle.addClass("settings-dialog-language-title");
		divMain.appendChild(txtTitle);

		const divRow = document.createElement("div");
		divRow.addClass("settings-dialog-row-div");
		divMain.appendChild(divRow);

		const txtSubtitle = document.createElement("p");
		txtSubtitle.innerText = "Translate to";
		txtSubtitle.addClass("settings-dialog-language-subtitle");
		divRow.appendChild(txtSubtitle);

		const dropDown = new DropdownComponent(divRow);
		dropDown.selectEl.addClass("settings-dialog-language-dropdown");

		for (const [language] of langauges) {
			dropDown.addOption(language, language);
		}
		dropDown.onChange((value) => this.onLanguageChange(value));
		dropDown.setValue(this.currentTranslateTo);

		return divMain;
	}

	onOpen() {
		const { contentEl } = this;
		const divContainer = contentEl.createEl("div");
		divContainer.addClass("settings-dialog-container");

		divContainer.appendChild(this.createSettingsDiv());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
