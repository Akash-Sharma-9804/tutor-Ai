import SchoolCard from "./SchoolCard";

const SchoolsGrid = ({ schools, onView, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {schools.map((school) => (
        <SchoolCard
          key={school.id}
          school={school}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default SchoolsGrid;