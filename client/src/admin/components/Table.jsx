import React from 'react'

const Table = ({ columns = [], data = [] }) => {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t">
              {Object.values(row).map((cell, i) => (
                <td key={i} className="px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-gray-500"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

