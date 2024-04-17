import { App, Modal, setIcon } from "obsidian";

export class SelectionModal extends Modal {
	private sendButton: HTMLButtonElement;
	private insertButton: HTMLButtonElement;
	private copyButton: HTMLElement;

	private inputDiv: HTMLDivElement;
	private outputDiv: HTMLDivElement;

	private inputTextBox: HTMLTextAreaElement;
	private outputTextBox: HTMLTextAreaElement;

	private correctGrammarButton: HTMLButtonElement;
	private translateButton: HTMLButtonElement;
	private formatButton: HTMLButtonElement;

	private selectedText: string;

	private onSendButtonClick: () => void;
	private onCopyButtonClick: () => void;
	private onInsertButtonClick: () => void;

	private onCorrectGrammarClick: () => void;
	private onTranslateClick: () => void;
	private onFormatClick: () => void;

	constructor(
		app: App,
		selectedText: string,
		{
			onSendButtonClick,
			onCopyButtonClick,
			onInsertButtonClick,
			onCorrectGrammarClick,
			onTranslateClick,
			onFormatClick,
		}: {
			onSendButtonClick: () => void;
			onCopyButtonClick: () => void;
			onInsertButtonClick: () => void;
			onCorrectGrammarClick: () => void;
			onTranslateClick: () => void;
			onFormatClick: () => void;
		}
	) {
		super(app);
		this.selectedText = selectedText;
		this.onSendButtonClick = onSendButtonClick;
		this.onCopyButtonClick = onCopyButtonClick;
		this.onInsertButtonClick = onInsertButtonClick;
		this.onCorrectGrammarClick = onCorrectGrammarClick;
		this.onTranslateClick = onTranslateClick;
		this.onFormatClick = onFormatClick;
	}

	setOutputText(text: string) {
		this.outputTextBox.setText(text);
	}

	setInputTextVisiblity(isVisible: boolean) {
		if (isVisible) {
			this.inputTextBox.removeClass("hidden");
		} else {
			this.inputTextBox.addClass("hidden");
		}
	}

	setLoading(isLoading: boolean) {
		if (isLoading) {
			this.sendButton.innerText = "Processing ...";
		} else {
			this.sendButton.innerText = "Send message";
		}
		this.inputTextBox.readOnly = isLoading;

		this.correctGrammarButton.disabled = isLoading;
		this.translateButton.disabled = isLoading;
		this.formatButton.disabled = isLoading;
	}

	setOutputVisibility(isVisible: boolean) {
		if (isVisible) {
			this.outputDiv.removeClass("hidden");
		} else {
			this.outputDiv.addClass("hidden");
		}
	}

	getUserPrompt(): string {
		return this.inputTextBox.value;
	}

	getOutputText(): string {
		return this.outputTextBox.value;
	}

	createInputPanel(): HTMLDivElement {
		this.inputDiv = document.createElement("div");
		this.inputDiv.addClass("selection-modal-input-main-div");

		const input_divTitle = document.createElement("div");
		input_divTitle.addClass("selection-modal-input-title-div");
		setIcon(input_divTitle, "text-select");
		this.inputDiv.appendChild(input_divTitle);

		const input_titleText = document.createElement("h4");
		input_titleText.addClass("selection-modal-input-title");
		input_titleText.innerText = "Selected text";
		input_divTitle.appendChild(input_titleText);

		const input_divSelectedText = document.createElement("div");
		input_divSelectedText.dir = "auto";
		input_divSelectedText.addClass(
			"selection-modal-input-selected-text-div"
		);
		input_divSelectedText.setText(this.selectedText);
		this.inputDiv.appendChild(input_divSelectedText);

		const input_divTextBox = document.createElement("div");
		input_divTextBox.addClass("selection-modal-input-textbox-div");
		this.inputDiv.appendChild(input_divTextBox);

		const divActions = document.createElement("div");
		divActions.addClass("selection-modal-input-actions-div");
		this.inputDiv.appendChild(divActions);

		this.correctGrammarButton = createIconButton(
			"Correct grammar",
			"spell-check",
			this.onCorrectGrammarClick
		);
		divActions.appendChild(this.correctGrammarButton);

		this.translateButton = createIconButton(
			"Translate",
			"languages",
			this.onTranslateClick
		);
		this.translateButton.addClass("selection-modal-input-translate-button");
		divActions.appendChild(this.translateButton);

		this.formatButton = createIconButton(
			"Format",
			"align-center",
			this.onFormatClick
		);
		this.formatButton.addClass("selection-modal-input-format-button");
		divActions.appendChild(this.formatButton);

		this.inputTextBox = document.createElement("textarea");
		this.inputTextBox.addClass("selection-modal-input-textbox");
		this.inputTextBox.dir = "auto";
		this.inputTextBox.placeholder = "Ask AI anything";
		this.inputTextBox.rows = 1;
		input_divTextBox.appendChild(this.inputTextBox);

		this.sendButton = document.createElement("button");
		this.sendButton.innerText = "Send message";
		this.sendButton.addClass("selection-modal-send-button");
		this.sendButton.addEventListener("click", this.onSendButtonClick);
		this.inputDiv.appendChild(this.sendButton);
		return this.inputDiv;
	}

	createOutputDiv(): HTMLDivElement {
		this.outputDiv = document.createElement("div");
		this.outputDiv.addClass("selection-modal-output-main-div");

		const titleText = document.createElement("h4");
		titleText.addClass("selection-modal-output-title");
		titleText.innerText = "Output";
		this.outputDiv.appendChild(titleText);

		const divTextBox = document.createElement("div");
		divTextBox.addClass("selection-modal-output-textbox-div");
		this.outputDiv.appendChild(divTextBox);

		this.outputTextBox = document.createElement("textarea");
		this.outputTextBox.addClass("selection-modal-output-textbox");
		this.outputTextBox.dir = "auto";

		this.outputTextBox.readOnly = true;
		divTextBox.appendChild(this.outputTextBox);

		this.copyButton = document.createElement("span");
		this.copyButton.addClass("copy-icon-button");
		this.copyButton.addClass("selection-modal-output-copy-button");
		setIcon(this.copyButton, "copy");
		this.copyButton.addEventListener("click", this.onCopyButtonClick);
		divTextBox.appendChild(this.copyButton);

		this.insertButton = document.createElement("button");
		this.insertButton.addClass("selection-modal-output-insert-button");
		this.insertButton.addEventListener("click", this.onInsertButtonClick);
		this.outputDiv.appendChild(this.insertButton);

		const submitIcon = document.createElement("span");
		submitIcon.addClass("selection-modal-output-insert-icon");
		setIcon(submitIcon, "check-circle-2");
		this.insertButton.appendChild(submitIcon);

		const submitText = document.createElement("span");
		submitText.addClass("selection-modal-output-insert-text");
		submitText.setText("Replace selection");
		this.insertButton.appendChild(submitText);

		return this.outputDiv;
	}

	createTipDiv(): HTMLElement {
		const input_divTip = document.createElement("div");
		input_divTip.addClass("selection-modal-input-tip-div");

		const input_tipIcon = document.createElement("span");
		input_tipIcon.addClass("selection-modal-output-tip-icon");
		input_tipIcon.setText("↩");
		input_divTip.appendChild(input_tipIcon);

		const input_tipEnding = document.createElement("span");
		input_tipEnding.innerText = "to send";
		input_divTip.appendChild(input_tipEnding);
		return input_divTip;
	}

	onOpen() {
		const { contentEl } = this;
		const divContainer = contentEl.createEl("div");
		divContainer.addClass("selection-modal-container");

		const inputDiv = this.createInputPanel();
		divContainer.appendChild(inputDiv);

		const outputDiv = this.createOutputDiv();
		divContainer.appendChild(outputDiv);

		this.inputTextBox.addEventListener("keydown", async (event) => {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				this.onSendButtonClick();
			}
			this.inputTextBox.rows =
				this.inputTextBox.value.split("\n").length || 1;
		});

		this.inputTextBox.addEventListener("keyup", async (event) => {
			this.inputTextBox.rows =
				this.inputTextBox.value.split("\n").length || 1;
		});

		this.inputTextBox.addEventListener("keypress", async (event) => {
			this.inputTextBox.rows =
				this.inputTextBox.value.split("\n").length || 1;
		});

		this.setOutputVisibility(false);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

function createIconButton(
	title: string,
	icon: string,
	onPress: () => void
): HTMLButtonElement {
	const insertButton = document.createElement("button");
	insertButton.addClass("selection-modal-icon-button");
	insertButton.addEventListener("click", onPress);

	const submitIcon = document.createElement("span");
	submitIcon.addClass("selection-modal-icon-button-icon");
	setIcon(submitIcon, icon);
	insertButton.appendChild(submitIcon);

	const submitText = document.createElement("span");
	submitText.addClass("selection-modal-icon-button-text");
	submitText.setText(title);
	insertButton.appendChild(submitText);

	return insertButton;
}
