document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const subcategory = urlParams.get("subcategory");
	const example = urlParams.get("example"); // Get the selected example from the URL

	// Ensure the elements exist before accessing them
	const subcategoryElement = document.getElementById("selected-subcategory");
	const exampleElement = document.getElementById("selected-example");

	if (subcategoryElement && exampleElement) {
		if (subcategory) {
			subcategoryElement.textContent = subcategory;

			 // Display the selected example directly if provided in the URL
			if (example) {
				exampleElement.innerHTML = example
					.replace(
						/Dear\s+[^,]+,/,
						`Dear <input type="text" id="typing-box-recipient-${Date.now()}" class="small-input" placeholder="Type recipient here..." />,`
					)
					.replace(
						/Yours\s+[^,]+,/,
						`<select id="select-box-closing-${Date.now()}">
							<option value="Yours sincerely">Yours sincerely</option>
							<option value="Yours faithfully">Yours faithfully</option>
							<option value="Best regards">Best regards</option>
						</select>,`
					)
					.replace(/\[Name\]/g, `<input type="text" id="typing-box-name-${Date.now()}" class="small-input" placeholder="Type your name here..." />`)
					.replace(/______/g, "") // Remove underscores
					.replace(/\n/g, "<br>");
			} else {
				exampleElement.textContent = "No example found for this subcategory.";
			}
		} else {
			subcategoryElement.textContent = "No subcategory selected.";
			exampleElement.textContent = "";
		}
	} else {
		console.error("Required elements not found in the DOM.");
	}

	// Load saved email content from local storage
	const savedContent = localStorage.getItem("savedEmailContent");
	if (savedContent) {
		const userInput = document.getElementById("user-input");
		if (userInput) {
			userInput.value = savedContent;
		}
	}

	// Add functionality to the "Save" button
	const saveEntryButton = document.getElementById("save-entry-button");
	saveEntryButton.addEventListener("click", () => {
		const exampleContent = document.getElementById("selected-example").innerHTML;
		const subcategoryContent = document.getElementById("selected-subcategory").textContent;

		// Retrieve values from input fields
		const recipientValue = document.getElementById("email-recipient")?.value || ""; // "To:" field
		const subjectValue = document.getElementById("email-subject")?.value || ""; // "Subject" field
		const nameValue = document.querySelector("[id^='typing-box-name']")?.value || ""; // For "[Name]"
		const recipientBoxValue = document.querySelector("[id^='typing-box-recipient']")?.value || ""; // For "Recipient"
		const closingValue = document.querySelector("[id^='select-box-closing']")?.value || ""; // For "Closing"

		if (exampleContent && subcategoryContent) {
			// Remove extra sentences, placeholder tips, and redundant words from the example content
			const cleanedExampleContent = exampleContent
				.replace(/Dear\s+Type\s+recipient\s+here\.\.\.,/g, "") // Remove "Dear Type recipient here...,"
				.replace(/,Type\s+your\s+name\s+here\.\.\._/g, "") // Remove ",Type your name here..._"
				.replace(/placeholder="Type recipient here\.\.\."/g, "") // Remove "Type recipient here..." placeholder
				.replace(/placeholder="Type your name here\.\.\."/g, "") // Remove "Type your name here..." placeholder
				.replace(/Dear\s*,/g, "") // Remove "Dear ,"
				.replace(/,_/g, ""); // Remove ",_"

			// Prompt the user for an email name
			const emailName = prompt("Enter a name for this email draft:", "Untitled");

			// Save the entry to local storage
			const savedEntries = JSON.parse(localStorage.getItem("savedEntries")) || [];
			savedEntries.push({
				subcategory: subcategoryContent,
				example: cleanedExampleContent,
				recipientValue,
				nameValue,
				recipientBoxValue,
				closingValue,
				subject: subjectValue,
				emailName,
				timestamp: Date.now(),
			});
			localStorage.setItem("savedEntries", JSON.stringify(savedEntries));

			// Redirect to the "Record" page
			window.location.href = "./record.html";
		} else {
			alert("No content to save.");
		}
	});

	// Save data to local storage and overwrite input fields
	function saveData() {
		const subject = document.getElementById("email-subject").value;
		const recipient = document.getElementById("email-recipient").value;
		const sender = document.getElementById("email-sender")?.value || "";
		const recipientBox = document.querySelector("[id^='typing-box-recipient']")?.value || ""; // "Dear" box
		const closingValue = document.querySelector("[id^='select-box-closing']")?.value || ""; // Closing dropdown
		const nameValue = document.querySelector("[id^='typing-box-name']")?.value || ""; // "[Name]" box
		const exampleText = document.getElementById("selected-example").innerHTML;

		// Save data as JSON object in local storage
		const emailData = {
			subject,
			recipient,
			sender,
			recipientBox,
			closingValue,
			nameValue,
			exampleText,
		};
		localStorage.setItem("emailData", JSON.stringify(emailData));

		// Overwrite input fields with saved data
		document.getElementById("email-subject").value = subject;
		document.getElementById("email-recipient").value = recipient;
		if (document.getElementById("email-sender")) {
			document.getElementById("email-sender").value = sender;
		}
		if (document.querySelector("[id^='typing-box-recipient']")) {
			document.querySelector("[id^='typing-box-recipient']").value = recipientBox;
		}
		if (document.querySelector("[id^='select-box-closing']")) {
			document.querySelector("[id^='select-box-closing']").value = closingValue;
		}
		if (document.querySelector("[id^='typing-box-name']")) {
			document.querySelector("[id^='typing-box-name']").value = nameValue;
		}
		document.getElementById("selected-example").innerHTML = exampleText;

		alert("Data saved successfully!");
	}

	function copyEmailInfo() {
		const subject = document.getElementById("email-subject").value || "No Subject";
		const recipient = document.getElementById("email-recipient").value || "No Recipient";
		const sender = document.getElementById("email-sender").value || "No Sender";

		// Replace typing boxes and selection boxes in the Selected Example with their values
		const exampleElement = document.getElementById("selected-example");
		let exampleContent = exampleElement.cloneNode(true); // Clone the element to avoid modifying the DOM

		// Replace input fields with their values
		exampleContent.querySelectorAll("input").forEach((input) => {
			input.replaceWith(input.value || "");
		});

		// Replace select fields with their selected values
		exampleContent.querySelectorAll("select").forEach((select) => {
			select.replaceWith(select.options[select.selectedIndex]?.text || "No Selection");
		});

		
    // Remove underscores and clean up the text
    const plainTextExample = exampleContent.innerHTML
        .replace(/_/g, "") // Remove underscores
        .replace(/<br\s*\/?>/g, "\n") // Replace <br> tags with newlines
        .replace(/<\/?[^>]+(>|$)/g, ""); // Remove remaining HTML tags

		// Combine all fields into a single string, including the dropdown selection
		const emailInfo = `Subject: ${subject}\nTo: ${recipient}\nFrom: ${sender}\n${plainTextExample.trim()}`;

		 // Copy to clipboard
		 navigator.clipboard.writeText(emailInfo).then(() => {
			console.log("Email information copied successfully!");
		}).catch((err) => {
			console.error("Failed to copy text: ", err);
		});
	}
});
