import SubjectCard from "./SubjectCard";

const SubjectsGrid = ({ subjects, onView, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default SubjectsGrid;