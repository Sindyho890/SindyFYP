document.addEventListener("DOMContentLoaded", () => {
	const categoryDropdown = document.getElementById("category-dropdown");
	const subcategoryDropdown = document.getElementById("subcategory-dropdown");
	const exampleSection = document.getElementById("example-section");
	const exampleText = document.getElementById("example-text");
	const exampleList = document.getElementById("example-list");
	const loadingSpinner = document.getElementById("loading-spinner");

	// Show loading spinner while fetching data
	loadingSpinner.classList.remove("hidden");

	// Function to show the copy notification
	function showCopyNotification() {
		const notification = document.getElementById("copy-notification");
		notification.classList.remove("hidden");
		setTimeout(() => {
			notification.classList.add("hidden");
		}, 2000); // Hide after 2 seconds
	}

	// Fetch data from Data3.json
	fetch("./Data4.json")
		.then((response) => response.json())
		.then((data) => {
			loadingSpinner.classList.add("hidden"); // Hide spinner after data is loaded

			// Extract unique categories
			const categories = [...new Set(data.map((item) => item.Category))];

			// Populate category dropdown
			categories.forEach((category) => {
				const option = document.createElement("option");
				option.value = category;
				option.textContent = category;
				categoryDropdown.appendChild(option);
			});

			// Enable subcategory dropdown when a category is selected
			categoryDropdown.addEventListener("change", () => {
				const selectedCategory = categoryDropdown.value;
				subcategoryDropdown.innerHTML = `<option value="" disabled selected>Select a Subcategory</option>`; // Reset subcategories
				subcategoryDropdown.disabled = false;

				// Filter subcategories based on selected category
				const subcategories = data
					.filter((item) => item.Category === selectedCategory)
					.map((item) => ({ subcategory: item.Subcategory, example: item.Example }));

				// Populate subcategory dropdown with unique subcategories
				const uniqueSubcategories = Array.from(
					new Map(subcategories.map((item) => [item.subcategory, item])).values()
				);

				uniqueSubcategories.forEach(({ subcategory }) => {
					const option = document.createElement("option");
					option.value = subcategory;
					option.textContent = subcategory;
					subcategoryDropdown.appendChild(option);
				});
			});

			// Show examples when a subcategory is selected
			subcategoryDropdown.addEventListener("change", () => {
				const selectedSubcategory = subcategoryDropdown.value;

				 // Show loading spinner while examples are being loaded
				exampleList.innerHTML = `<div class="loading-spinner"></div>`;

				// Find all examples for the selected subcategory
				const examples = data
					.filter((item) => item.Subcategory === selectedSubcategory)
					.map((item) => item.Example);

				// Format and display all examples as individual list items
				setTimeout(() => {
					exampleList.innerHTML = ""; // Clear existing examples

					if (examples.length > 0) {
						examples.forEach((example, index) => {
							const listItem = document.createElement("li");
							listItem.classList.add("example-item");

							const title = document.createElement("h4");
							title.textContent = `Example ${index + 1}:`;

							const content = document.createElement("p");
							content.innerHTML = example
								.replace(/\[Recipient\]/g, "<strong>[Recipient]</strong>")
								.replace(/\[Name\]/g, "<strong>[Name]</strong>")
								.replace(/Dear\s+[^,]+,/g, "Dear <strong>[Recipient]</strong>,")
								.replace(/Yours\s+[^,]+,/g, "Yours sincerely,")
								.replace(/_/g, "&#x5F;") // Replace underscores with visible underscores
								.replace(/\n/g, "<br>"); // Replace newlines with <br> tags

							// Add "Copy" button
							const copyButton = document.createElement("button");
							copyButton.classList.add("copy-button");
							copyButton.innerHTML = `<img src="./copy.png" alt="Copy" />`; // Use a copy icon
							copyButton.addEventListener("click", () => {
								navigator.clipboard.writeText(example).then(() => {
									showCopyNotification();
								}).catch((err) => {
									console.error("Failed to copy text: ", err);
								});
							});

							 // Add "Go" button
							const goButton = document.createElement("button");
							goButton.classList.add("go-button");
							goButton.innerHTML = `<img src="./go.png" alt="Go" />`; // Only show the "Go" icon
							goButton.addEventListener("click", () => {
								// Pass the selected example and subcategory to the Action page
								window.location.href = `./action.html?subcategory=${encodeURIComponent(selectedSubcategory)}&example=${encodeURIComponent(example)}`;
							});

							// Append elements to the list item
							listItem.appendChild(copyButton); // Add the copy button first
							listItem.appendChild(title);
							listItem.appendChild(content);
							listItem.appendChild(goButton);
							exampleList.appendChild(listItem);
						});
					} else {
						exampleList.innerHTML = "<li>No examples available.</li>";
					}

					exampleSection.style.display = "block";
				}, 500); // Simulate loading delay
			});
		})
		.catch((error) => {
			loadingSpinner.classList.add("hidden"); // Hide spinner on error
			console.error("Error fetching data:", error);
			alert("Failed to load data. Please try again later.");
		});
});
