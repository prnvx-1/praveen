document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('results');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');

    const API_URL = 'https://www.googleapis.com/books/v1/volumes?q=';
    let debounceTimer;

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            fetchBooks(query, 20);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                fetchBooks(query, 20);
            }
        }
    });

    // Added live-search (auto-search as you type) 
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        
        // Wait 500ms after the user stops typing before making the search
        debounceTimer = setTimeout(() => {
            const query = searchInput.value.trim();
            if (query) {
                fetchBooks(query, 20);
            } else {
                // If they clear the search, go back to the standard 3 books
                fetchBooks('popular novels', 3);
            }
        }, 500); 
    });

    async function fetchBooks(query, maxResults) {
        resultsContainer.innerHTML = '';
        errorEl.classList.add('hidden');
        loadingEl.classList.remove('hidden');

        try {
            const response = await fetch(`${API_URL}${encodeURIComponent(query)}&maxResults=${maxResults}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            loadingEl.classList.add('hidden');

            if (data.items && data.items.length > 0) {
                renderBooks(data.items.slice(0, maxResults));
            } else {
                showError('No books found for your search.');
            }
        } catch (error) {
            loadingEl.classList.add('hidden');
            showError('An error occurred while fetching data.');
            console.error('Fetch error:', error);
        }
    }

    function renderBooks(books) {
        books.forEach((book) => {
            const info = book.volumeInfo;
            
            const title = info.title || 'Unknown Title';
            const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
            const description = info.description || 'No description available.';
            const thumbnail = info.imageLinks?.thumbnail || 'https://via.placeholder.com/100x150?text=No+Cover';
            const link = info.infoLink || '#';

            const card = document.createElement('div');
            card.className = 'book-card';
            
            card.innerHTML = `
                <img src="${thumbnail.replace('http:', 'https:')}" alt="Cover" class="book-cover" onerror="this.src='https://via.placeholder.com/100x150?text=Error'">
                <div class="book-info">
                    <h3 class="book-title">${title}</h3>
                    <p class="book-author">By ${authors}</p>
                    <p class="book-desc">${description}</p>
                    <a href="${link}" target="_blank" rel="noopener noreferrer" class="book-link">View on Google Books</a>
                </div>
            `;
            
            resultsContainer.appendChild(card);
        });
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    // Initially load exactly 3 books onto the page when it opens
    fetchBooks('popular novels', 3);
});
