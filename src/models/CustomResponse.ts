export enum Status {
	Success = "success",
	InternetDisconnected = "internetDisconnected",
	ExceededQuota = "exceededQuota",
	InvalidAPIKey = "invalidAPIKey ",
	EmptyAPIKey = "emptyAPIKey ",
	EmptyPrompt = "imptyPrompt",
	UnknownError = "unknownError",
	UserUnsubscribed = "userUnsubscribed",
}
export class CustomResponse {
	status: Status;
	body: string;

	constructor(status: Status, body: string) {
		this.status = status;
		this.body = body;
	}
}
