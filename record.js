document.addEventListener("DOMContentLoaded", () => {
	const savedEntriesContainer = document.getElementById("saved-entries-container");
	const dateFilter = document.getElementById("date-filter"); // Filter dropdown
	const actionNotification = document.getElementById("action-notification"); // Notification element

	// Retrieve saved entries from local storage
	let savedEntries = JSON.parse(localStorage.getItem("savedEntries")) || [];

	// Function to render entries
	function renderEntries() {
		savedEntriesContainer.innerHTML = ""; // Clear existing entries

		if (savedEntries.length > 0) {
			savedEntries.forEach((entry, index) => {
				// Create a "paper" container for each entry
				const paper = document.createElement("div");
				paper.classList.add("saved-entry-paper");

				// Create a container for aligned metadata and content
				const alignedContainer = document.createElement("div");
				alignedContainer.style.display = "grid";
				alignedContainer.style.gridTemplateColumns = "150px auto"; // Adjust column width for label alignment
				alignedContainer.style.gap = "5px";

				// Add the subject field
				const subjectLabel = document.createElement("p");
				subjectLabel.style.textAlign = "left"; // Align label to the right
				subjectLabel.innerHTML = `<strong>Subject:</strong>`;
				const subjectValue = document.createElement("p");
				subjectValue.textContent = entry.subject || "No Subject";
				alignedContainer.appendChild(subjectLabel);
				alignedContainer.appendChild(subjectValue);

				// Add the recipient field
				const recipientLabel = document.createElement("p");
				recipientLabel.style.textAlign = "left"; // Align label to the right
				recipientLabel.innerHTML = `<strong>To:</strong>`;
				const recipientValue = document.createElement("p");
				recipientValue.textContent = entry.recipientValue || "N/A";
				alignedContainer.appendChild(recipientLabel);
				alignedContainer.appendChild(recipientValue);

				// Add the sender (From) field
				const senderLabel = document.createElement("p");
				senderLabel.style.textAlign = "left"; // Align label to the right
				senderLabel.innerHTML = `<strong>From:</strong>`;
				const senderValue = document.createElement("p");
				senderValue.textContent = entry.nameValue || "N/A";
				alignedContainer.appendChild(senderLabel);
				alignedContainer.appendChild(senderValue);

				// Add the email content directly to the left side
				const contentValue = document.createElement("p");
				contentValue.style.gridColumn = "1 / span 2"; // Span across both columns
				contentValue.innerHTML = `
					Dear ${entry.recipientBoxValue || "Recipient"},<br><br>
					${entry.example
						.replace(/Dear\s*,/g, "") // Remove "Dear,"
						.replace(/,_/g, "") // Remove ",_"
						.replace(/<br\s*\/?>/g, "") // Remove "<br>"
						.replace(/<input[^>]*value="([^"]*)"[^>]*>/g, "$1") // Replace input fields with their values
						.replace(/<input[^>]*placeholder="([^"]*)"[^>]*>/g, "$1") // Replace placeholders
						.replace(/<select[^>]*>(.*?)<\/select>/g, (match, options) => {
							const selectedOption = options.match(/<option[^>]*selected[^>]*>(.*?)<\/option>/);
							return selectedOption ? selectedOption[1] : "";
						}) // Replace select fields with selected values
						.replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
						 .trim()
						.replace(/^Dear\s*,|,_$/g, "") // Remove "Dear ," and ",_" from the start and end
					}
					<br><br>
					${entry.closingValue || ""},<br>
					${entry.nameValue || ""}
				`;
				alignedContainer.appendChild(contentValue);

				// Append the aligned container to the paper
				paper.appendChild(alignedContainer);

				// Add metadata (draft time and email name)
				const metadata = document.createElement("div");
				metadata.classList.add("email-metadata");
				metadata.style.marginTop = "20px"; // Add spacing above metadata
				const draftTime = new Date(entry.timestamp).toLocaleString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				});
				metadata.innerHTML = `
					<p><strong>Email Name:</strong> ${entry.emailName || "Untitled"}</p>
					<p><strong>Draft Time:</strong> ${draftTime}</p>
				`;
				paper.appendChild(metadata);

				// Add copy button (upper right)
				const copyButton = document.createElement("button");
				copyButton.classList.add("copy-button");
				copyButton.innerHTML = `<img src="./copy.png" alt="Copy" />`; // Use "copy.png" icon
				copyButton.title = "Copy Record";
				copyButton.addEventListener("click", () => {
					// Combine all fields into a formatted string
					const recordInfo = `
Subject: ${entry.subject || "No Subject"}
To: ${entry.recipientValue || "No Recipient"}
From: ${entry.nameValue || "No Sender"}

Dear ${entry.recipientBoxValue || "Recipient"},

${entry.example
	.replace(/Dear\s*,/g, "") // Remove "Dear,"
	.replace(/,_/g, "") // Remove ",_"
	.replace(/<br\s*\/?>/g, "") // Remove "<br>"
	.replace(/<input[^>]*value="([^"]*)"[^>]*>/g, "$1") // Replace input fields with their values
	.replace(/<input[^>]*placeholder="([^"]*)"[^>]*>/g, "$1") // Replace placeholders
	.replace(/<select[^>]*>(.*?)<\/select>/g, (match, options) => {
		const selectedOption = options.match(/<option[^>]*selected[^>]*>(.*?)<\/option>/);
		return selectedOption ? selectedOption[1] : "";
	}) // Replace select fields with selected values
	.replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
	.trim()
	.replace(/^Dear\s*,|,_$/g, "") // Remove "Dear ," and ",_" from the start and end
	.replace(/<br\s*\/?>$/g, "") // Remove trailing <br> tags
}

${entry.closingValue || ""},<br>
${entry.nameValue || ""}
					`;

					// Copy to clipboard
					navigator.clipboard.writeText(recordInfo.trim()).then(() => {
						showActionNotification("Successfully Copied", "green");
					}).catch((err) => {
						console.error("Failed to copy text: ", err);
					});
				});
				paper.appendChild(copyButton);

				// Add delete button (bottom right)
				const deleteButton = document.createElement("button");
				deleteButton.classList.add("delete-button");
				deleteButton.style.position = "absolute"; // Ensure the button is positioned
				deleteButton.style.bottom = "10px"; // Position at the bottom
				deleteButton.style.right = "10px"; // Position at the right
				deleteButton.innerHTML = `<img src="./Rubbish bin.png" alt="Delete" />`; // Use a rubbish bin icon
				deleteButton.addEventListener("click", () => {
					savedEntries.splice(index, 1); // Remove the entry from the array
					localStorage.setItem("savedEntries", JSON.stringify(savedEntries)); // Update local storage
					renderEntries(); // Re-render the entries
					showActionNotification("Successfully Deleted", "red");
				});
				paper.appendChild(deleteButton);

				// Append the paper to the container
				savedEntriesContainer.appendChild(paper);
			});
		} else {
			savedEntriesContainer.textContent = "No saved entries found.";
		}
	}

	// Function to show action notifications
	function showActionNotification(message, color) {
		actionNotification.textContent = message;
		actionNotification.classList.remove("hidden", "red", "green");
		if (color === "red") {
			actionNotification.classList.add("red");
		} else if (color === "green") {
			actionNotification.classList.add("green");
		}
		setTimeout(() => {
			actionNotification.classList.add("hidden");
		}, 3000); // Extend visibility to 3 seconds
	}

	// Function to sort entries based on the selected filter
	function sortEntries() {
		const filterValue = dateFilter.value;
		if (filterValue === "new-to-old") {
			savedEntries.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
		} else if (filterValue === "old-to-new") {
			savedEntries.sort((a, b) => a.timestamp - b.timestamp); // Sort by oldest first
		}
		renderEntries(); // Re-render entries after sorting
	}

	// Event listener for the filter dropdown
	dateFilter.addEventListener("change", sortEntries);

	// Initial render
	sortEntries(); // Apply default sorting (new to old)
});
