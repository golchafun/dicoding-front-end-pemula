const books = [];
const STORAGE_KEY = 'BOOKS_APPS';
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {

    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        event.target.reset()
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchInput = document.getElementById('searchBookTitle').value.toLowerCase();
        showSearchResult(searchInput);
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});



function showSearchResult(searchInput) {
    const bookList = document.querySelectorAll('[data-testid="bookItem"]');
    for (const bookItem of bookList) {
        const bookTitle = bookItem.querySelector('[data-testid="bookItemTitle"]').innerText.toLowerCase();
        if (bookTitle.includes(searchInput)) {
            bookItem.style.display = 'block';
        }
        else {
            bookItem.style.display = 'none';
        }
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
    const textTitle = document.getElementById('bookFormTitle').value;
    const textAuthor = document.getElementById('bookFormAuthor').value;
    const textYear = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year: parseInt(year),
        isComplete
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsedBooks = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsedBooks);
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    // clearing list item
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    // rendering list item
    for (const bookItem of books) {
        const bookElement = createBookElement(bookItem);
        if (bookItem.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
})

function createBookElement({ id, title, author, year, isComplete }) {
    
    const bookContainer = document.createElement('div');
    bookContainer.setAttribute("data-bookid", id);
    bookContainer.setAttribute("data-testid", "bookItem");

    const bookTitle = document.createElement('h3');
    bookTitle.setAttribute("data-testid", "bookItemTitle");
    bookTitle.innerText = title;

    const bookAuthor = document.createElement('p');
    bookAuthor.setAttribute("data-testid", "bookItemAuthor");
    bookAuthor.innerText = "Penulis: " + author;

    const bookYear = document.createElement('p');
    bookYear.setAttribute("data-testid", "bookItemYear");
    bookYear.innerText = "Tahun: " + year;

    bookContainer.append(bookTitle, bookAuthor, bookYear);

    // button
    const buttonContainer = document.createElement('div');

    const incompleteButton = document.createElement('button');
    incompleteButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    if (isComplete) {
        incompleteButton.innerText = "Belum Selesai Dibaca";

    } else {
        incompleteButton.innerText = "Selesai Dibaca";
    }

    incompleteButton.addEventListener('click', function () {
        changeBookStatus(id);
    });
    buttonContainer.append(incompleteButton);

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.innerText = "Hapus Buku";

    deleteButton.addEventListener('click', function () {
        removeBook(id);
    });

    buttonContainer.append(deleteButton);

    bookContainer.append(buttonContainer);

    return bookContainer;
}

function changeBookStatus(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;

    books[bookTarget].isComplete = !books[bookTarget].isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (let i = 0; i < books.length; i++) {
        if (books[i].id === bookId) {
            return i;
        }
    }
    return -1;
}