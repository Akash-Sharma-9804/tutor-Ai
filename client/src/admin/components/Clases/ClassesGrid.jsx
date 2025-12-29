import ClassCard from "./ClassCard";

const ClassesGrid = ({ classes, onView, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {classes.map((classItem) => (
        <ClassCard
          key={classItem.id}
          classData={classItem}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ClassesGrid;