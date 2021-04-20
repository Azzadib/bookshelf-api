const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    const id = nanoid(16);
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {
        id, 
        name, 
        year, 
        author, 
        summary, 
        publisher, 
        pageCount,
        readPage,
        finished,
        reading, 
        insertedAt, 
        updatedAt,
    };

    if (name && readPage <= pageCount) books.push(newBook);

    const isSuccess = books.filter((book) => book.id === id).length > 0;

    if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }

    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        });
        response.code(201);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Catatan agal ditambahkan',
    });
    response.code(500);
    return response;
};

const showBoksHandler = (request, h) => {
    const { reading, finished, name } = request.query;

    if (reading !== undefined) {
        const readingStat = reading === '1';
        const readingResult = books.filter((book) => book.reading === readingStat);
        if (readingResult.length === 0) {
            const response = h.response({
                status: 'fail',
                message: 'Tidak ada buku yan sedang dibaca',
            });
            response.code(404);
            return response;
        }

        return {
            status: 'success',
            data: {
                books: readingResult.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        };
    }

    if (finished !== undefined) {
        const finishStat = finished === '1';
        const finishResult = books.filter((book) => book.finished === finishStat);
        if (finishResult.length === 0) {
            const response = h.response({
                status: 'fail',
                message: 'Tidak ada buku yan sedang selesai dibaca',
            });
            response.code(404);
            return response;
        }

        return {
            status: 'success',
            data: {
                books: finishResult.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        };
    }

    if (name !== undefined) {
        const lowName = name.toLowerCase();
        const nameResult = books.filter((book) => book.name.toLowerCase().search(lowName) !== -1);
        if (nameResult.length === 0) {
            const response = h.response({
                status: 'fail',
                message: `Tidak dapat menemukan buku dengan judul ${name}`,
            });
            response.code(404);
            return response;
        }

        return {
            status: 'success',
            data: {
                books: nameResult.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        };
    }

    return {
        status: 'success',
        data: {
            books: books.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            })),
        },
    };
};

const getBookByIdHandler = (request, h) => {
    const { id } = request.params;
    const book = books.filter((b) => b.id === id)[0];

    if (book !== undefined) {
        return {
            status: 'success',
            data: {
                book,
            },
        };
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
};

const editBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;
    const finished = pageCount === readPage;
    const updatedAt = new Date().toISOString();

    const index = books.findIndex((book) => book.id === bookId);

    if (index === -1) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
        });
        response.code(404);
        return response;
    }

    if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }

    books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        updatedAt,
    };

    return {
        status: 'success',
        message: 'Buku berhasil diperbarui',
    };
};

const deleteBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const index = books.findIndex((book) => book.id === bookId);

    if (index === -1) {
        const response = h.response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan',
        });
        response.code(404);
        return response;
    }

    books.splice(index, 1);

    return {
        status: 'success',
        message: 'Buku berhasil dihapus',
    };
};

module.exports = {
    addBookHandler,
    showBoksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler,
};
