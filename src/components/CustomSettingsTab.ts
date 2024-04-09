import RapidAIPlugin from "main";
import {
	PluginSettingTab,
	App,
	setIcon,
	Setting,
	DropdownComponent,
} from "obsidian";
import { API_MANAGEMENT_URL, API_URL } from "src/utils/constants";
import { langauges } from "src/utils/languages";
import { getBadge } from "src/utils/utils";

export class CustomSettingsTab extends PluginSettingTab {
	private plugin: RapidAIPlugin;

	private testKeyButton: HTMLButtonElement;
	private APIKeyTextbox: HTMLInputElement;

	private onTestKeyClick: (key: string) => void;
	private onAPIKeyChange: (key: string) => void;
	private onLanguageChange: (language: string) => void;
	private txtTestStatus: HTMLSpanElement;
	private iconTestStatus: HTMLSpanElement;
	private divTestState: HTMLDivElement;
	private TestButtonContent = "Test API Key";

	constructor(
		app: App,
		plugin: RapidAIPlugin,
		{
			onTestKeyClick,
			onAPIKeyChange,
			onlanguageChange,
		}: {
			onTestKeyClick: (key: string) => void;
			onAPIKeyChange: (key: string) => void;
			onlanguageChange: (langauge: string) => void;
		}
	) {
		super(app, plugin);
		this.plugin = plugin;
		this.onTestKeyClick = onTestKeyClick;
		this.onAPIKeyChange = onAPIKeyChange;
		this.onLanguageChange = onlanguageChange;
	}

	setTestStatus(status: string, icon: string) {
		this.txtTestStatus.innerText = status;
		setIcon(this.iconTestStatus, icon);
	}

	setStatusVisiblity(isVisible: boolean) {
		if (isVisible) {
			this.divTestState.style.display = "flex";
		} else {
			this.divTestState.style.display = "none";
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
		divMain.addClass("settings-tab-main-div");

		const titleText = document.createElement("h4");
		titleText.addClass("settings-tab-title");
		titleText.innerText = "Rapid API Key";
		divMain.appendChild(titleText);

		const input_divTextBox = document.createElement("div");
		input_divTextBox.addClass("settings-tab-key-div");
		divMain.appendChild(input_divTextBox);

		this.APIKeyTextbox = document.createElement("input");
		this.APIKeyTextbox.addClass("settings-tab-key-textbox");
		this.APIKeyTextbox.value = this.plugin.settings.rapidAPIKey;
		input_divTextBox.appendChild(this.APIKeyTextbox);
		this.APIKeyTextbox.addEventListener("input", (event) => {
			this.onAPIKeyChange(this.APIKeyTextbox.value);
		});

		const divTestKey = document.createElement("div");
		divTestKey.addClass("settings-tab-test-key-div");
		divMain.appendChild(divTestKey);

		this.testKeyButton = document.createElement("button");
		this.testKeyButton.addClass("settings-tab-test-key-button");
		this.testKeyButton.setText(this.TestButtonContent);
		this.testKeyButton.addEventListener("click", () => {
			this.onTestKeyClick(this.APIKeyTextbox.value);
		});
		divTestKey.appendChild(this.testKeyButton);

		this.divTestState = document.createElement("div");
		this.divTestState.addClass("settings-tab-key-state-div");
		divTestKey.appendChild(this.divTestState);

		this.iconTestStatus = document.createElement("span");
		this.iconTestStatus.addClass("settings-tab-key-state-icon");
		setIcon(this.iconTestStatus, "badge-check");
		this.divTestState.appendChild(this.iconTestStatus);

		this.txtTestStatus = document.createElement("span");
		this.txtTestStatus.addClass("settings-tab-state-text");
		this.txtTestStatus.innerText = "It Works Perfctly";
		this.divTestState.appendChild(this.txtTestStatus);

		const anchorElement = document.createElement("a");
		anchorElement.addClass("settings-tab-api-link");
		anchorElement.href = API_URL;
		anchorElement.text = "Get your API key from here";
		anchorElement.target = "_blank";
		divMain.appendChild(anchorElement);

		const badge = getBadge(140);
		badge.addClass("settings-tab-badge");
		divMain.appendChild(badge);

		const manageSubscription = this.createManageSubscription();
		divMain.appendChild(manageSubscription);

		const hr = document.createElement("hr");
		hr.addClass("settings-tab-hr");
		divMain.appendChild(hr);

		const languageDiv = this.createLanguageDiv();
		divMain.appendChild(languageDiv);

		return divMain;
	}

	private createManageSubscription() {
		const manageSubscription = document.createElement("a");
		manageSubscription.addClass("settings-tab-manage-subscription");
		manageSubscription.href = API_MANAGEMENT_URL;
		manageSubscription.text = "Check Usage & Manage Subscription";
		manageSubscription.target = "_blank";
		return manageSubscription;
	}

	private createLanguageDiv(): HTMLDivElement {
		const divMain = document.createElement("div");
		divMain.addClass("settings-tab-language-div");

		const txtTitle = document.createElement("h4");
		txtTitle.addClass("settings-tab-langauge-title");
		txtTitle.innerText = "Translation";
		divMain.appendChild(txtTitle);

		const divSubtitle = document.createElement("div");
		divSubtitle.addClass("settings-tab-language-subtiitle-div");
		divMain.appendChild(divSubtitle);

		const txtSubtitle = document.createElement("p");
		txtSubtitle.addClass("settings-tab-language-subtitle");
		txtSubtitle.innerText = "Translate to";
		divSubtitle.appendChild(txtSubtitle);

		const dropDown = new DropdownComponent(divSubtitle);
		dropDown.selectEl.addClass("settings-tab-language-dropdown");

		for (const [language] of langauges) {
			dropDown.addOption(language, language);
		}
		dropDown.onChange((value) => this.onLanguageChange(value));
		dropDown.setValue(this.plugin.settings.translateTo);

		return divMain;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.appendChild(this.createSettingsDiv());
		new Setting(containerEl);
	}
}
