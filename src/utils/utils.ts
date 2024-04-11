import { API_URL } from "./constants";

export function getBadge(width: number, link: string = API_URL) {
	const anchorElement = document.createElement("a");
	anchorElement.href = link;
	anchorElement.target = "_blank";
	anchorElement.addClass(".badge");
	const imageElement = document.createElement("img");
	imageElement.src =
		"https://storage.googleapis.com/rapidapi-documentation/connect-on-rapidapi-light.png";
	imageElement.width = width;
	imageElement.alt = "Connect on RapidAPI";

	anchorElement.appendChild(imageElement);
	return anchorElement;
}
