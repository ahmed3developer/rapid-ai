import {
	MarkdownView,
	Modal,
	moment,
	Notice,
	Plugin,
	requestUrl,
	setIcon,
} from "obsidian";

import { SelectionModal } from "src/components/SelectionModal";
import { NormalModal } from "src/components/NormalModal";
import { CustomResponse, Status } from "src/models/CustomResponse";
import { CustomSettingsTab } from "src/components/CustomSettingsTab";
import { SettingsDialog } from "src/components/dialogs/SettingsDialog";
import { BasicDialog } from "src/components/dialogs/BasicDialog";
import { MissingAPIKeyDialog } from "src/components/dialogs/MissingAPIKeyDialog";
import { API_PRICING_URL, API_URL } from "src/utils/constants";
import { QuotaExceededDialog } from "src/components/dialogs/QuotaExceededDialog";

interface PluginSettings {
	rapidAPIKey: string;
	translateTo: string;
}

const DEFAULT_SETTINGS: Partial<PluginSettings> = {
	rapidAPIKey: "",
	translateTo: "English",
};

async function makeAIRequest(
	apiKey: string,
	sentence: string,
	selectedText?: string,
	systemInstructions?: string
): Promise<CustomResponse> {
	if (apiKey.trim() == "") {
		return new CustomResponse(Status.EmptyAPIKey, "");
	}
	const url = "https://obsidian-ai.p.rapidapi.com/";
	const headers = {
		"Content-Type": "application/json",
		"X-RapidAPI-Key": apiKey,
	};
	const targetMessages = [];
	const straighforward =
		"Give direct answer. Do not include any explanation or any accompanying text";
	if (selectedText) {
		let instruction;
		if (systemInstructions) {
			instruction = `${systemInstructions}. Today is ${moment().format(
				"YYYY-MM-DD dddd"
			)}, local time is ${moment().format(
				"HH:mm:ss"
			)}. ${straighforward}`;
			targetMessages.push(
				{ role: "system", content: instruction },
				{ role: "user", content: `${selectedText}` }
			);
		} else {
			instruction = `The first message is the selected text by the user. You are a helpful AI assistant for markdown editor. Today is ${moment().format(
				"YYYY-MM-DD dddd"
			)}, local time is ${moment().format(
				"HH:mm:ss"
			)}. ${straighforward}`;
			targetMessages.push(
				{ role: "system", content: instruction },
				{ role: "user", content: `${selectedText}` },
				{ role: "user", content: sentence }
			);
		}
	} else {
		const instruction = `Today is ${moment().format(
			"YYYY-MM-DD"
		)}, local time is ${moment().format("HH:mm:ss")}. ${straighforward}`;
		targetMessages.push(
			{ role: "system", content: instruction },
			{ role: "user", content: sentence }
		);
	}

	const body = {
		model: "gpt-3.5-turbo",
		prompts: targetMessages,
	};

	try {
		const response = await requestUrl({
			url: url,
			method: "POST",
			body: JSON.stringify(body),
			headers: headers,
		});
		const responseBody = response.json;
		const content = responseBody.choices[0]?.message?.content;
		return new CustomResponse(Status.Success, content);
	} catch (e) {
		const errorMessage: string = e.toString().toLowerCase();
		console.log(errorMessage);
		switch (true) {
			case errorMessage.includes("disconnected"):
				return new CustomResponse(Status.InternetDisconnected, "");
			case errorMessage.includes("429"):
				return new CustomResponse(Status.ExceededQuota, "");
			case errorMessage.includes("403"):
				return new CustomResponse(Status.UserUnsubscribed, "");
			default:
				return new CustomResponse(Status.UnknownError, "");
		}
	}
}

async function invokeKey(apiKey: string): Promise<CustomResponse> {
	if (apiKey.trim() == "") {
		return new CustomResponse(Status.EmptyAPIKey, "");
	}
	const url = "https://obsidian-ai.p.rapidapi.com/";
	const headers = {
		"Content-Type": "application/json",
		"X-RapidAPI-Key": apiKey,
	};

	const body = {
		invokeKey: true,
	};

	try {
		const response = await requestUrl({
			url: url,
			method: "POST",
			body: JSON.stringify(body),
			headers: headers,
		});
		const responseBody = response.json;
		if (responseBody.valid && responseBody.valid == true) {
			return new CustomResponse(Status.Success, "");
		} else {
			return new CustomResponse(Status.InvalidAPIKey, "");
		}
	} catch (e) {
		const errorMessage: string = e.toString().toLowerCase();
		switch (true) {
			case errorMessage.includes("disconnected"):
				return new CustomResponse(Status.InternetDisconnected, "");
			case errorMessage.includes("429"):
				return new CustomResponse(Status.ExceededQuota, "");
			case errorMessage.includes("403"):
				return new CustomResponse(Status.UserUnsubscribed, "");
			default:
				return new CustomResponse(Status.InvalidAPIKey, "");
		}
	}
}

export default class RapidAIPlugin extends Plugin {
	settings: PluginSettings;
	settingsTab: CustomSettingsTab;
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async copyText(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch (error) {
			new Notice("An error occurred while copying");
		}
	}

	async insertText(text: string) {
		try {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				view.editor.replaceRange(text, view.editor.getCursor());
			}
		} catch (error) {
			new Notice("An error occurred while inserting text");
		}
	}

	getSelectedText() {
		try {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			const selection = view?.editor.getSelection();
			return selection;
		} catch (e) {
			return "";
		}
	}

	replaceSelectedText(text: string) {
		try {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				view.editor.replaceSelection(text);
			}
		} catch (error) {
			new Notice("An error occurred while replacing text");
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	showSettingsDialog() {
		const dialog: SettingsDialog = new SettingsDialog(this.app, {
			currentAPIKey: this.settings.rapidAPIKey,
			currentTranslateTo: this.settings.translateTo,
			onTestKeyClick: (key: string) => this.onTestKeyClick(dialog, key),
			onAPIKeyChange: (key: string) => this.onAPIKeyChange(key),
			onlanguageChange: (langauge: string) =>
				this.onlanguageChange(langauge),
		});
		dialog.open();
	}

	showMissingAPIKey() {
		const dialog = new MissingAPIKeyDialog(this.app, {
			apiLink: API_URL,
			onGoToSettingsClick: () => {
				this.showSettingsDialog();
				dialog.close();
			},
		});
		dialog.open();
	}

	showNoSubscriptionModal() {
		const dialog = new BasicDialog(this.app, {
			title: "No subscription found",
			subtitle:
				"You need to subscribe to the API first. You can subscribe from here.",
			action: "Subscribe",
			onActionButtonClick: () => {
				window.open(API_URL, "_blank");
				dialog.close();
			},
		});
		dialog.open();
	}

	showQuotaExceeded() {
		const dialog = new QuotaExceededDialog(this.app, {
			onUpgradeButtonClick: () => {
				window.open(API_PRICING_URL, "_blank");
				dialog.close();
			},
		});
		dialog.open();
	}

	showInvalidAPIKey() {
		const dialog = new BasicDialog(this.app, {
			title: "Invalid API key",
			subtitle:
				"Please use a valid API key. You can change it from the settings.",
			action: "Go to Settings",
			onActionButtonClick: () => {
				this.showSettingsDialog();
				dialog.close();
			},
		});
		dialog.open();
	}

	requestFailed(modal: Modal, result: CustomResponse) {
		if (modal instanceof NormalModal) {
			modal.setLoading(false);
		} else if (modal instanceof SelectionModal) {
			modal.setLoading(false);
		}
		switch (result.status) {
			case Status.InternetDisconnected:
				new Notice("Please connect to the internet.");
				break;
			case Status.ExceededQuota:
				this.showQuotaExceeded();
				break;
			case Status.UserUnsubscribed:
				this.showNoSubscriptionModal();
				break;
			case Status.EmptyAPIKey:
				this.showMissingAPIKey();
				break;
			case Status.InvalidAPIKey:
				this.showInvalidAPIKey();
				break;
			case Status.UnknownError:
				new Notice("An Error Occurred. Please try again later");
				break;
			case Status.EmptyPrompt:
				new Notice("Please enter the prompt");
				break;
		}
	}

	emptyPrompt() {
		new Notice("Please the prompt");
	}

	openNormalModal() {
		const modal = new NormalModal(this.app, {
			onSendButtonClick: async () => {
				const prompt = modal.getUserPrompt();
				if (prompt.trim() == "") {
					this.emptyPrompt();
					return;
				}
				modal.hideOutputPanel();
				modal.setLoading(true);

				const result = await makeAIRequest(
					this.settings.rapidAPIKey,
					prompt
				);
				if (result.status == Status.Success) {
					modal.setOutputText(result.body);
					modal.setLoading(false);
					modal.showOutputPanel();
				} else {
					this.requestFailed(modal, result);
				}
			},
			onCopyButtonClick: () => {
				this.copyText(modal.getOutputText());
				new Notice("Copied");
			},
			onInsertButtonClick: () => {
				this.insertText(modal.getOutputText());
				modal.close();
			},
		});
		modal.open();
		modal.hideOutputPanel();
	}

	openSelectionModal(selectedText: string, translationLanguage: string) {
		const modal = new SelectionModal(this.app, selectedText, {
			onSendButtonClick: async () => {
				const prompt = modal.getUserPrompt();
				if (prompt.trim() == "") {
					this.emptyPrompt();
					return;
				}
				modal.setOutputVisibility(false);
				modal.setLoading(true);

				const result = await makeAIRequest(
					this.settings.rapidAPIKey,
					prompt,
					this.getSelectedText()
				);
				if (result.status == Status.Success) {
					modal.setOutputText(result.body);
					modal.setLoading(false);
					modal.setOutputVisibility(true);
				} else {
					this.requestFailed(modal, result);
				}
			},
			onCopyButtonClick: () => {
				this.copyText(modal.getOutputText());
				new Notice("Copied");
			},
			onInsertButtonClick: () => {
				this.replaceSelectedText(modal.getOutputText());
				modal.close();
			},
			onCorrectGrammarClick: async () => {
				await quickAction(modal, "You are an a grammar corrector");
			},
			onFormatClick: async () => {
				await quickAction(modal, "You are an markdown formatter");
			},
			onTranslateClick: async () => {
				await quickAction(
					modal,
					`You are an ${translationLanguage} translator`
				);
			},
		});
		modal.open();
		modal.setOutputVisibility(false);

		const quickAction = async (modal: SelectionModal, action: string) => {
			modal.setOutputVisibility(false);
			modal.setInputTextVisiblity(false);
			modal.setLoading(true);

			const prompt = modal.getUserPrompt();

			const result = await makeAIRequest(
				this.settings.rapidAPIKey,
				prompt,
				this.getSelectedText(),
				action
			);
			if (result.status == Status.Success) {
				modal.setOutputText(result.body);
				modal.setOutputVisibility(true);
			} else {
				this.requestFailed(modal, result);
				modal.setOutputVisibility(false);
			}
			modal.setLoading(false);

			modal.setInputTextVisiblity(true);
		};
	}

	openModal() {
		const selectedText = this.getSelectedText();
		if (selectedText) {
			const language = this.settings.translateTo;
			this.openSelectionModal(selectedText, language);
		} else {
			this.openNormalModal();
		}
	}
	async onAPIKeyChange(key: string) {
		this.settings.rapidAPIKey = key;
		await this.saveSettings();
	}

	async onTestKeyClick(dialog: object, key: string) {
		if (dialog instanceof CustomSettingsTab) {
			dialog.setLoadingState(true);
			dialog.setStatusVisiblity(false);
		} else if (dialog instanceof SettingsDialog) {
			dialog.setLoadingState(true);
			dialog.setStatusVisiblity(false);
		}

		const result = await invokeKey(key);
		const setStatus = (dialog: unknown, status: string, icon: string) => {
			if (dialog instanceof CustomSettingsTab) {
				dialog.setTestStatus(status, icon);
			} else if (dialog instanceof SettingsDialog) {
				dialog.setTestStatus(status, icon);
			}
		};
		switch (result.status) {
			case Status.Success:
				setStatus(dialog, "It Works Perfctly", "badge-check");
				break;
			case Status.InternetDisconnected:
				setStatus(dialog, "Internet Disconnected", "unplug");
				break;
			case Status.ExceededQuota:
				setStatus(
					dialog,
					"Your quota has exceeded the current plan. Please upgrade your plan",
					"shield-alert"
				);
				break;
			case Status.InvalidAPIKey:
				setStatus(dialog, "Invalid API Key", "ban");
				break;
			case Status.UserUnsubscribed:
				setStatus(
					dialog,
					"You are not subscribed to the API",
					"shield-alert"
				);
				break;
			case Status.EmptyAPIKey:
				setStatus(dialog, "Missing API Key", "key-round");
				break;
			default:
				setStatus(dialog, "Invalid API Key", "ban");
				break;
		}

		if (dialog instanceof CustomSettingsTab) {
			dialog.setStatusVisiblity(true);
			dialog.setLoadingState(false);
		} else if (dialog instanceof SettingsDialog) {
			dialog.setStatusVisiblity(true);
			dialog.setLoadingState(false);
		}
	}

	async onlanguageChange(langauge: string) {
		this.settings.translateTo = langauge;
		await this.saveSettings();
	}
	async onload() {
		// Settings
		await this.loadSettings();
		this.settingsTab = new CustomSettingsTab(this.app, this, {
			onAPIKeyChange: async (key) => this.onAPIKeyChange(key),
			onTestKeyClick: async (key) =>
				this.onTestKeyClick(this.settingsTab, key),
			onlanguageChange: async (langauge) =>
				this.onlanguageChange(langauge),
		});
		this.addSettingTab(this.settingsTab);

		// Side Bar Button
		this.addRibbonIcon("cpu", "Rapid AI", () => {
			this.openModal();
		});

		// Status Bar Button
		const item = this.addStatusBarItem();
		item.createEl("button");
		setIcon(item, "cpu");
		// item.style.color = "#FFCA28";
		item.addEventListener("click", () => {
			this.openModal();
		});

		// Context Menu Item
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item.setTitle("Ask AI")
						.setIcon("cpu")
						.onClick(async () => {
							this.openModal();
						});
				});
			})
		);

		// Command Pallete
		this.addCommand({
			id: "ask-ai",
			name: "Ask AI",
			hotkeys: [],
			callback: () => {
				this.openModal();
			},
		});
	}
}
