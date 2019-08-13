export const BASE_URL = "https://api.migration.ichinesereader.com";

export function makeRequest(type, targetUrl, auth, postBody, returnFunc){
	alert("ablong");
	var asy = true;
	var request = new XMLHttpRequest();
	request.onload = returnFunc;
	request.open(type, targetUrl, asy);
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	request.setRequestHeader("AuthToken", auth);
	request.send(postBody);
};

export function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}