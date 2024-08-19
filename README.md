# Send to Supernotes

This Raycast extension is simple. When activated, it takes either the contents of the currently selected text (if any) or the contents of the clipboard and creates a new card in Supernotes with those contents. 

You need to add your API key in the Raycast preferences for this extension before it will work.

The first line of the copied text is used as the title. If it is a Markdown heading, any leading `#` characters are stripped.

Any tags found in the last line of the text contents are added as tags in the created card and removed from the card's body.
