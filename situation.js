import Data from "./Data4.json" with { type: "json" };

const Dataset = Data.filter(item => item);
// State variables
let currentPage = 1;
let entriesPerPage = 50;
let currentSort = 'ID';
let searchTerm = '';
let selectedCategory = 'all';
let selectedSubcategory = 'all';
let selectedTags = new Set();

// DOM elements
const entriesList = document.getElementById('entries-list');
const searchInput = document.getElementById('search-input');
const CategorySelect = document.getElementById('Category-select'); // Fix casing
const SubcategorySelect = document.getElementById('Subcategory-select'); // Fix casing
const tagList = document.getElementById('tag-list');
const sortSelect = document.getElementById('sort-select');
const entriesSelect = document.getElementById('entries-select');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

/**
 * Initialize the application
 */
function init() {
    // Handle query parameter for search
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");
    if (query) {
        searchTerm = query.toLowerCase();
    }

    setupFilters();
    setupEventListeners();
    renderEntries();
}

/**
 * Extract unique Categories and tags from Data and set up filters
 */
function setupFilters() {
    const Categories = new Map(); // Map to store categories and their subcategories
    const tags = new Set();

    Dataset.forEach(item => {
        if (item.Category) {
            if (!Categories.has(item.Category)) {
                Categories.set(item.Category, new Set());
            }
            if (item.Subcategory) {
                Categories.get(item.Category).add(item.Subcategory);
            }
        }
        if (Array.isArray(item.pos)) {
            item.pos.forEach(pos => tags.add(pos));
        } else if (item.pos) {
            tags.add(item.pos);
        }
    });

    // Create Category and Subcategory filters
    renderCategoryFilters(Categories);
    renderSubcategoryFilters([]); // Initially empty

    // Create tag filter checkboxes
    renderTagFilters(Array.from(tags));
}

/**
 * Create Category filter dropdown
 */
function renderCategoryFilters(Categories) {
    CategorySelect.innerHTML = '<option value="all">All</option>';
    for (const Category of Categories.keys()) {
        const option = document.createElement('option');
        option.value = Category;
        option.textContent = Category;
        CategorySelect.appendChild(option);
    }

    CategorySelect.addEventListener('change', () => {
        selectedCategory = CategorySelect.value;
        currentPage = 1;

        // Update Subcategory options
        const Subcategories = selectedCategory === 'all' ? [] : Array.from(Categories.get(selectedCategory) || []);
        renderSubcategoryFilters(Subcategories); // Pass the correct subcategories

        renderEntries();
    });
}

/**
 * Create Subcategory filter dropdown
 */
function renderSubcategoryFilters(Subcategories) {
    SubcategorySelect.innerHTML = '<option value="all">All</option>';
    Subcategories.forEach(Subcategory => {
        const option = document.createElement('option');
        option.value = Subcategory;
        option.textContent = Subcategory;
        SubcategorySelect.appendChild(option);
    });

    // Update the event listener to ensure it reflects the selected subcategory
    SubcategorySelect.addEventListener('change', () => {
        selectedSubcategory = SubcategorySelect.value;
        currentPage = 1;
        renderEntries();
    });
}

/**
 * Create tag filter checkboxes
 */
function renderTagFilters(tags) {
    tags.forEach(tag => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = tag;
        
        const span = document.createElement('span');
        span.textContent = tag;
        
        label.appendChild(input);
        label.appendChild(span);
        li.appendChild(label);
        tagList.appendChild(li);
    });
}

/**
 * Set up event listeners for all interactive elements
 */
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.toLowerCase();
        currentPage = 1;
        renderEntries();
    });
    
    // Tag filters
    document.querySelectorAll('#tag-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedTags.add(e.target.value);
            } else {
                selectedTags.delete(e.target.value);
            }
            currentPage = 1;
            renderEntries();
        });
    });
    
    // Sort selector
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        renderEntries();
    });
    
    // Entries per page selector
    entriesSelect.addEventListener('change', () => {
        entriesPerPage = parseInt(entriesSelect.value);
        currentPage = 1;
        renderEntries();
    });
    
    // Pagination buttons
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderEntries();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const filteredEntries = getFilteredEntries();
        const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            renderEntries();
        }
    });
}

/**
 * Filter entries based on current filters
 */
function getFilteredEntries() {
    return Dataset.filter(entry => {
        // Search text filter
        const matchesSearch = searchTerm === '' || 
            entry.Subcategory.toLowerCase().includes(searchTerm) || 
            entry.Example.toLowerCase().includes(searchTerm);
            
        // Category filter
        const matchesCategory = selectedCategory === 'all' || entry.Category === selectedCategory;

        // Subcategory filter
        const matchesSubcategory = SubcategorySelect.value === 'all' || entry.Subcategory === SubcategorySelect.value;
        
        // Tag filter
        let matchesTags = true;
        if (selectedTags.size > 0) {
            matchesTags = Array.isArray(entry.pos) 
                ? entry.pos.some(pos => selectedTags.has(pos))
                : selectedTags.has(entry.pos);
        }
        
        return matchesSearch && matchesCategory && matchesSubcategory && matchesTags;
    });
}

/**
 * Sort entries based on current sort option
 */
function sortEntries(entries) {
    return [...entries].sort((a, b) => {
        switch (currentSort) {
            case 'ID':
                return a.ID - b.ID;
            case 'Subcategory':
                return (a.Subcategory || '').localeCompare(b.Subcategory || '');
            case 'Category':
                return (a.Category || '').localeCompare(b.Category || '');
            case 'pos':
                const posA = Array.isArray(a.pos) ? a.pos[0] : a.pos;
                const posB = Array.isArray(b.pos) ? b.pos[0] : b.pos;
                return (posA || '').localeCompare(posB || '');
            case 'Example':
                return a.Example.localeCompare(b.Example);
            default:
                return 0;
        }
    });
}

/**
 * Render filtered and sorted entries with pagination
 */
function renderEntries() {
    // Get filtered and sorted entries
    const filteredEntries = getFilteredEntries();
    const sortedEntries = sortEntries(filteredEntries);
    
    // Calculate pagination
    const totalPages = Math.ceil(sortedEntries.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, sortedEntries.length);
    const entriesToDisplay = sortedEntries.slice(startIndex, endIndex);
    
    // Update pagination controls
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    // Clear existing entries
    entriesList.innerHTML = '';
    
    // Create entry items
    entriesToDisplay.forEach(entry => {
        const entryItem = createEntryItem(entry);
        entriesList.appendChild(entryItem);
    });
}

/**
 * Create a single entry item
 */
function createEntryItem(entry) {
    // Create list item
    const li = document.createElement('li');
    li.classList.add('entry-item');
    
    // Create details element
    const details = document.createElement('details');
    
    // Create summary element with title, category, and ID
    const summary = document.createElement('summary');
    
    const h3 = document.createElement('h3');
    h3.classList.add('entry-word');
    h3.textContent = entry.Subcategory;
    
    const CategorySpan = document.createElement('span');
    CategorySpan.classList.add('entry-Category');
    CategorySpan.textContent = entry.Category;
    
    const idSpan = document.createElement('span');
    idSpan.classList.add('entry-ID');
    idSpan.textContent = entry.ID;
    
    summary.appendChild(h3);
    summary.appendChild(CategorySpan);
    summary.appendChild(idSpan);

    // Create content paragraph with parts of speech and definition
    const content = document.createElement('p');
    content.classList.add('entry-content');
    
    // Create tags container
    const tagsContainer = document.createElement('div');
    tagsContainer.classList.add('entry-tags');
    
    // Add parts of speech tags
    if (Array.isArray(entry.pos)) {
        entry.pos.forEach(pos => {
            const posSpan = document.createElement('span');
            posSpan.classList.add('entry-pos');
            posSpan.textContent = pos;
            tagsContainer.appendChild(posSpan);
        });
    } else if (entry.pos) {
        const posSpan = document.createElement('span');
        posSpan.classList.add('entry-pos');
        posSpan.textContent = entry.pos;
        tagsContainer.appendChild(posSpan);
    }
    
    // Add definition
    const ExampleSpan = document.createElement('span');
    ExampleSpan.classList.add('entry-Example');
    ExampleSpan.innerHTML = entry.Example.replace(/\n/g, '<br>'); // Replace newlines with <br> tags
    
    content.appendChild(tagsContainer);
    content.appendChild(ExampleSpan);

    // Add "Copy" button at the top-right
    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-button");
    copyButton.innerHTML = `<img src="./copy.png" alt="Copy" />`; // Use a "Copy" icon
    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(entry.Example).then(() => {
            showCopyNotification("Example copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    });

    // Add "Go" button with an icon at the bottom-right
    const goButton = document.createElement("button");
    goButton.classList.add("go-button");
    goButton.innerHTML = `<img src="./go.png" alt="Go" />`; // Use a "Go" icon
    goButton.addEventListener("click", () => {
        window.location.href = `./action.html?subcategory=${encodeURIComponent(entry.Subcategory)}&example=${encodeURIComponent(entry.Example)}`;
    });

    // Wrap the content and buttons in a container
    const contentContainer = document.createElement("div");
    contentContainer.classList.add("entry-content-container");
    contentContainer.appendChild(copyButton); // Add copy button
    contentContainer.appendChild(content);
    contentContainer.appendChild(goButton);

    // Assemble the entry item
    details.appendChild(summary);
    details.appendChild(contentContainer);
    li.appendChild(details);
    
    return li;
}

/**
 * Show a notification at the bottom-right of the page
 */
function showCopyNotification(message) {
    let notification = document.getElementById("copy-notification");
    if (!notification) {
        notification = document.createElement("div");
        notification.id = "copy-notification";
        notification.classList.add("hidden");
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.classList.remove("hidden");
    setTimeout(() => {
        notification.classList.add("hidden");
    }, 3000); // Hide notification after 3 seconds
}

/**
 * Render pagination for the SituationType page
 */
function renderSituationTypePagination(currentPage, totalPages) {
    const situationTypePageInfo = document.getElementById('situationType-page-info');
    const situationTypePrevPageBtn = document.getElementById('situationType-prev-page');
    const situationTypeNextPageBtn = document.getElementById('situationType-next-page');

    situationTypePageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    situationTypePrevPageBtn.disabled = currentPage <= 1;
    situationTypeNextPageBtn.disabled = currentPage >= totalPages;
}

// Initialize the application when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Add notification container to the DOM
    const notification = document.createElement("div");
    notification.id = "copy-notification";
    notification.classList.add("hidden");
    document.body.appendChild(notification);
});

document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const category = urlParams.get("category");
	const subcategory = urlParams.get("subcategory");
	const example = urlParams.get("example"); // Get the example from the URL

	// Fetch data from Data3.json
	fetch("./Data4.json")
		.then((response) => response.json())
		.then((data) => {
			 // Remove logic for displaying data under "situation-list"

			// Display the example if provided
			const exampleElement = document.getElementById("example-display");
			if (example) {
				exampleElement.innerHTML = example.replace(/\n/g, "<br>"); // Replace newlines with <br> tags
			} else {
				exampleElement.textContent = "No example available.";
			}
		})
		.catch((error) => console.error("Error fetching data:", error));
});

document.addEventListener("DOMContentLoaded", () => {
	const queryParams = new URLSearchParams(window.location.search);
	const query = queryParams.get("query");

	if (query) {
		// Fetch the data from Data3.json
		fetch("./Data4.json")
			.then((response) => response.json())
			.then((data) => {
				// Filter examples that match the query
				const relatedExamples = data.filter((item) =>
					item.Example.toLowerCase().includes(query.toLowerCase())
				);

				// Display the related examples
				const examplesContainer = document.getElementById("examples-container");
				if (relatedExamples.length > 0) {
					relatedExamples.forEach((example) => {
						const exampleElement = document.createElement("p");
						exampleElement.textContent = example.Example;
						examplesContainer.appendChild(exampleElement);
					});
				} else {
					examplesContainer.textContent = "No related examples found.";
				}
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
			});
	}
});

document.addEventListener("DOMContentLoaded", () => {
	const queryParams = new URLSearchParams(window.location.search);
	const query = queryParams.get("query");

	if (query) {
		// Fetch data from Data3.json
		fetch("./Data4.json")
			.then((response) => response.json())
			.then((data) => {
				// Filter subcategories that match the query
				const relatedSubcategories = data.filter((item) =>
					item.Subcategory?.toLowerCase().includes(query)
				);

				// Display the related subcategories
				const subcategoriesContainer = document.getElementById("subcategories-container");
				if (relatedSubcategories.length > 0) {
					relatedSubcategories.forEach((subcategory) => {
						const subcategoryElement = document.createElement("p");
						subcategoryElement.textContent = subcategory.Subcategory;
						subcategoriesContainer.appendChild(subcategoryElement);
					});
				} else {
					subcategoriesContainer.textContent = "No related subcategories found.";
				}
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
			});
	}
});

document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const subcategory = urlParams.get("subcategory");

	if (subcategory) {
		searchTerm = subcategory.toLowerCase(); // Set the search term to the subcategory
		renderEntries(); // Re-render entries to filter by the subcategory
	}
});
