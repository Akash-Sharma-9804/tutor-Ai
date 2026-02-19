import React from 'react'

const FileUpload = ({ onChange }) => {
  return (
    <div className="border border-dashed p-4 rounded text-center">
      <input
        type="file"
        accept="application/pdf"
        onChange={onChange}
        className="hidden"
        id="pdfUpload"
      />
      <label
        htmlFor="pdfUpload"
        className="cursor-pointer text-blue-600"
      >
        Click to upload PDF
      </label>
    </div>
  );
};

export default FileUpload;

