import BookCard from "./BookCard";

const BooksGrid = ({ books, onView, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BooksGrid;