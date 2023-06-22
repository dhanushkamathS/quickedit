import React from "react";

const CustomInput = ({ customInput, setCustomInput }) => {
  return (
    <>
      {" "}
      <textarea
        rows="5"
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder={`Custom input`}
        className="bg-gray-600 w-full h-full px-4 py-2 text-white"
      ></textarea>
    </>
  );
};

export default CustomInput;