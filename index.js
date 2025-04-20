document.addEventListener("DOMContentLoaded", () => {
	const examplesList = document.getElementById("Examples-list");
	const searchButton = document.getElementById("search-button");
	const searchInput = document.getElementById("search-input");

	// Fetch data from Data.json
	fetch("./Data4.json")
		.then((response) => response.json())
		.then((data) => {
			// Randomly select 10 examples
			const randomExamples = data.sort(() => 0.5 - Math.random()).slice(0, 10);

			// Display subcategories with click event to redirect to Situation Page
			randomExamples.forEach((example) => {
				if (example && example.Subcategory) {
					const listItem = document.createElement("li");
					listItem.textContent = example.Subcategory;
					listItem.addEventListener("click", () => {
						window.location.href = `./situation.html?subcategory=${encodeURIComponent(example.Subcategory)}`;
					});
					examplesList.appendChild(listItem);
				}
			});
		})
		.catch((error) => console.error("Error fetching data:", error));

	// Create a notification element for tips
	const notification = document.createElement("div");
	notification.id = "search-notification";
	notification.classList.add("hidden");
	notification.textContent = "No results found for your search.";
	document.body.appendChild(notification);

	// Handle search functionality
	function handleSearch() {
		const query = searchInput.value.trim().toLowerCase();
		if (query) {
				// Fetch data to validate the query
				fetch("./Data4.json")
					.then((response) => response.json())
					.then((data) => {
						// Check if the query matches any category or subcategory
						const isValid = data.some(
							(item) =>
								item.Category?.toLowerCase().includes(query) ||
								item.Subcategory?.toLowerCase().includes(query)
						);

						if (isValid) {
							// Redirect to the Situation page with the search query as a URL parameter
							window.location.href = `./situation.html?query=${encodeURIComponent(query)}`;
						} else {
							// Show notification for invalid search
							notification.textContent = "No results found for your search. Please check your input.";
							notification.classList.remove("hidden");
							setTimeout(() => {
								notification.classList.add("hidden");
							}, 3000); // Hide notification after 3 seconds
						}
					})
					.catch((error) => console.error("Error fetching data:", error));
		} else {
			alert("Please enter a search term.");
		}
	}

	searchButton.addEventListener("click", handleSearch);

	searchInput.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			handleSearch();
		}
	});
});
