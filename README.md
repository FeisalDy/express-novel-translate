# API Documentation

## User Endpoints

### Get All Users

- **URL:** `/api/users`
- **Method:** `GET`
- **Description:** Retrieve a list of all users.
- **Response:**
  - `200 OK` on success
  - `500 Internal Server Error` on failure

### Get User By ID

- **URL:** `/api/users/:id`
- **Method:** `GET`
- **Description:** Retrieve a user by their ID.
- **Response:**
  - `200 OK` on success
  - `400 Bad Request` if the ID is invalid
  - `404 Not Found` if the user is not found
  - `500 Internal Server Error` on failure

### Create User

- **URL:** `/api/users`
- **Method:** `POST`
- **Description:** Create a new user.
- **Request Body:**
  - `username` (string, required)
  - `email` (string, required)
  - `password` (string, required)
- **Response:**
  - `201 Created` on success
  - `400 Bad Request` if required fields are missing
  - `500 Internal Server Error` on failure

### Update User By ID

- **URL:** `/api/users/:id`
- **Method:** `PATCH`
- **Description:** Update a user by their ID.
- **Request Body:** Any fields to update
- **Response:**
  - `200 OK` on success
  - `400 Bad Request` if the ID is invalid
  - `404 Not Found` if the user is not found
  - `500 Internal Server Error` on failure

### Delete User By ID

- **URL:** `/api/users/:id`
- **Method:** `DELETE`
- **Description:** Delete a user by their ID.
- **Response:**
  - `200 OK` on success
  - `400 Bad Request` if the ID is invalid
  - `404 Not Found` if the user is not found
  - `500 Internal Server Error` on failure

## Book Endpoints

### Get All Books

- **URL:** `/api/books`
- **Method:** `GET`
- **Description:** Retrieve a list of all books.
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
  - `title` (string, optional)
  - `author` (string, optional)
  - `wordCount` (number, optional)
  - `tags` (string, optional, comma-separated)
- **Response:**
  - `200 OK` on success
  - `500 Internal Server Error` on failure

### Get Book By ID

- **URL:** `/api/books/:id`
- **Method:** `GET`
- **Description:** Retrieve a book by its ID.
- **Response:**
  - `200 OK` on success
  - `400 Bad Request` if the ID is invalid
  - `404 Not Found` if the book is not found
  - `500 Internal Server Error` on failure

### Create Book

- **URL:** `/api/books`
- **Method:** `POST`
- **Description:** Create a new book.
- **Request Body:**
  - `title` (string, required)
  - `author` (string, required)
  - `wordCount` (number, required)
  - `tags` (string, required, comma-separated)
  - `cover` (file, optional)
- **Response:**
  - `201 Created` on success
  - `400 Bad Request` if required fields are missing
  - `500 Internal Server Error` on failure

### Update Book By ID

- **URL:** `/api/books/:id`
- **Method:** `PATCH`
- **Description:** Update a book by its ID.
- **Request Body:** Any fields to update
- **Response:**
  - `200 OK` on success
  - `400 Bad Request` if the ID is invalid
  - `404 Not Found` if the book is not found
  - `500 Internal Server Error` on failure

### Delete Book By ID

- **URL:** `/api/books/:id`
- **Method:** `DELETE`
- **Description:** Delete a book by its ID.
- **Response:**
  - `200 OK` on success
  - `400 Bad Request` if the ID is invalid
  - `404 Not Found` if the book is not found
  - `500 Internal Server Error` on failure

## Chapter Endpoints

### Get Chapter By ID

- **URL:** `/api/chapters/:id`
- **Method:** `GET`
- **Description:** Retrieve a chapter by its ID.
- **Response:**
  - `200 OK` on success
  - `400 Bad Request` if the ID is invalid
  - `404 Not Found` if the chapter is not found
  - `500 Internal Server Error` on failure

### Create Chapter

- **URL:** `/api/chapters`
- **Method:** `POST`
- **Description:** Create a new chapter.
- **Request Body:**
  - `bookId` (number, required)
  - `chapterNumber` (number, required)
  - `chapterTitle` (string, required)
  - `content` (string, required)
- **Response:**
  - `201 Created` on success
  - `400 Bad Request` if required fields are missing
  - `500 Internal Server Error` on failure

### Update Chapter By ID

- **URL:** `/api/chapters/:id`
- **Method:** `PATCH`
- **Description:** Update a chapter by its ID.
- **Request Body:** Any fields to update
- **Response:**
  - `200 OK` on success
  - `400 Bad Request` if the ID is invalid
  - `404 Not Found` if the chapter is not found
  - `500 Internal Server Error` on failure

### Delete Chapter By ID

- **URL:** `/api/chapters/:id`
- **Method:** `DELETE`
- **Description:** Delete a chapter by its ID.
- **Response:**
  - `200 OK` on success
  - `400 Bad Request` if the ID is invalid
  - `404 Not Found` if the chapter is not found
  - `500 Internal Server Error` on failure
