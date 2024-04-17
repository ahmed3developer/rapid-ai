import { App, Modal, setIcon } from "obsidian";

export class NormalModal extends Modal {
	private sendButton: HTMLButtonElement;
	private insertButton: HTMLButtonElement;
	private copyButton: HTMLElement;

	private inputTextBox: HTMLTextAreaElement;
	private outputTextBox: HTMLTextAreaElement;
	private outputDiv: HTMLDivElement;

	private onSendButtonClick: () => void;
	private onCopyButtonClick: () => void;
	private onInsertButtonClick: () => void;

	constructor(
		app: App,
		{
			onSendButtonClick,
			onCopyButtonClick,
			onInsertButtonClick,
		}: {
			onSendButtonClick: () => void;
			onCopyButtonClick: () => void;
			onInsertButtonClick: () => void;
		}
	) {
		super(app);
		this.onSendButtonClick = onSendButtonClick;
		this.onCopyButtonClick = onCopyButtonClick;
		this.onInsertButtonClick = onInsertButtonClick;
	}

	setOutputText(text: string) {
		this.outputTextBox.setText(text);
	}

	setLoading(isLoading: boolean) {
		if (isLoading) {
			this.sendButton.innerText = "Processing ...";
		} else {
			this.sendButton.innerText = "Send message";
		}
		this.inputTextBox.readOnly = isLoading;
	}

	getUserPrompt(): string {
		return this.inputTextBox.value;
	}

	getOutputText(): string {
		return this.outputTextBox.value;
	}

	setOutputVisibility(isVisible: boolean) {
		if (isVisible) {
			this.outputDiv.removeClass("hidden");
		} else {
			this.outputDiv.addClass("hidden");
		}
	}

	createInputPanel(): HTMLDivElement {
		const divInput = document.createElement("div");
		divInput.addClass("normal-modal-main-div");

		const input_divTitle = document.createElement("div");
		input_divTitle.addClass("normal-modal-input-title-div");
		setIcon(input_divTitle, "cpu");

		const input_titleText = document.createElement("h4");
		input_titleText.addClass("normal-modal-input-title-text");
		input_titleText.innerText = "Ask Al";
		input_divTitle.appendChild(input_titleText);
		divInput.appendChild(input_divTitle);

		const input_divTextBox = document.createElement("div");
		input_divTextBox.addClass("normal-modal-input-textbox-div");
		divInput.appendChild(input_divTextBox);

		this.inputTextBox = document.createElement("textarea");
		this.inputTextBox.addClass("normal-modal-input-textbox");
		this.inputTextBox.placeholder = "Ask AI anything";
		this.inputTextBox.addEventListener("keydown", async (event) => {
			if (event.ctrlKey && event.key === "Enter") {
				event.preventDefault();
				this.onSendButtonClick();
			}
		});
		input_divTextBox.appendChild(this.inputTextBox);

		const input_divTip = document.createElement("div");
		input_divTip.addClass("normal-modal-input-tip-div");
		input_divTextBox.appendChild(input_divTip);

		const input_tipStarter = document.createElement("span");
		input_tipStarter.innerText = "Ctrl +";
		input_divTip.appendChild(input_tipStarter);

		const input_tipIcon = document.createElement("span");
		input_tipIcon.addClass("normal-modal-input-tip-icon");
		setIcon(input_tipIcon, "wrap-text");
		input_divTip.appendChild(input_tipIcon);

		const input_tipEnding = document.createElement("span");
		input_tipEnding.innerText = "to send";
		input_divTip.appendChild(input_tipEnding);

		this.sendButton = document.createElement("button");
		this.sendButton.addClass("normal-modal-input-send-button");
		this.sendButton.innerText = "Send message";
		this.sendButton.addEventListener("click", this.onSendButtonClick);
		divInput.appendChild(this.sendButton);

		return divInput;
	}

	createOutputDiv(): HTMLDivElement {
		this.outputDiv = document.createElement("div");
		this.outputDiv.addClass("normal-modal-output-main-div");

		const titleText = document.createElement("h4");
		titleText.addClass("normal-modal-output-title");
		titleText.innerText = "Output";
		this.outputDiv.appendChild(titleText);

		const divTextBox = document.createElement("div");
		divTextBox.addClass("normal-modal-output-textbox-div");
		this.outputDiv.appendChild(divTextBox);

		this.outputTextBox = document.createElement("textarea");
		this.outputTextBox.addClass("normal-modal-output-textbox");
		this.outputTextBox.readOnly = true;
		divTextBox.appendChild(this.outputTextBox);

		this.copyButton = document.createElement("span");
		this.copyButton.addClass("copy-icon-button");
		this.copyButton.addClass("normal-modal-copy-button");
		setIcon(this.copyButton, "copy");
		this.copyButton.addEventListener("click", this.onCopyButtonClick);
		divTextBox.appendChild(this.copyButton);

		this.insertButton = document.createElement("button");
		this.insertButton.addClass("normal-modal-output-insert-button");
		this.insertButton.addEventListener("click", this.onInsertButtonClick);
		this.outputDiv.appendChild(this.insertButton);

		const divButtonContent = document.createElement("div");
		divButtonContent.addClass("normal-modal-output-insert-button-div");
		this.insertButton.appendChild(divButtonContent);

		const submitIcon = document.createElement("span");
		submitIcon.addClass("normal-modal-ouput-submit-icon");
		setIcon(submitIcon, "check-circle-2");
		divButtonContent.appendChild(submitIcon);

		const submitText = document.createElement("span");
		submitText.addClass("normal-modal-ouput-submit-text");
		submitText.setText("Submit on editor");
		divButtonContent.appendChild(submitText);

		return this.outputDiv;
	}

	onOpen() {
		const { contentEl } = this;
		const divContainer = contentEl.createEl("div");
		divContainer.addClass("normal-modal-container");

		const inputDiv = this.createInputPanel();
		divContainer.appendChild(inputDiv);

		const outputDiv = this.createOutputDiv();
		divContainer.appendChild(outputDiv);

		this.setOutputVisibility(false);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
