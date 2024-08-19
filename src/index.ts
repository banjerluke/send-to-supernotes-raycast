import { getPreferenceValues, getSelectedText, Clipboard, showHUD, showToast, Toast } from "@raycast/api";
import fetch from "node-fetch";
import { ValidationError, WrappedCardResponses } from "./types";

interface Preferences {
  apiKey: string;
}

export default async function Command() {
  let text = "";

  try {
    text = await getSelectedText();
  } catch (error) {
    text = (await Clipboard.readText()) || "";
  }

  const { apiKey } = getPreferenceValues<Preferences>();

  if (!apiKey) {
    await showToast({
      style: Toast.Style.Failure,
      title: "API Key Missing",
      message: "Please set your Supernotes API key in the extension preferences",
    });
    return;
  }

  const lines = text.split("\n");
  const title = lines[0].replace(/^(#|>)+/, "").trim();
  const bodyLines = lines.slice(1);

  // remove blank lines at beginning and end, without removing blank lines in the middle
  while (/^\s*$/.test(bodyLines.at(0)!)) bodyLines.shift();
  while (/^\s*$/.test(bodyLines.at(-1)!)) bodyLines.pop();

  if (bodyLines.length === 0) {
    await showHUD("❌ Nothing to send");
    return;
  }

  const tags =
    bodyLines
      .at(-1)!
      .match(/#\w+/g)
      ?.map((tag) => tag.slice(1)) || [];

  if (tags.length > 0) {
    bodyLines.pop();
  }

  try {
    await showHUD(`⏳ Sending card to Supernotes...`);

    const response = await fetch("https://api.supernotes.app/v1/cards/simple", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": apiKey },
      body: JSON.stringify({
        name: title,
        markup: bodyLines.join("\n"),
        tags: tags,
      }),
    });

    const data = (await response.json()) as WrappedCardResponses | ValidationError;
    if ("errors" in data) throw new Error(data.errors.body);
    const wrapped_card = data[0];
    // error checking
    if (!wrapped_card.success) throw new Error(wrapped_card.payload);
    await showHUD(`✅ Created "${title}" in Supernotes`);
    // successCallback(wrapped_card.payload);
  } catch (error) {
    console.error("Error sending to Supernotes:", error);
    await showHUD(`❌ Error sending to Supernotes: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
  }
}
