import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import AstVisualiser from "./AstVisualiser";

function Combine() {
  const [showAst, setShowAst] = useState(true); // State for toggling between AST and JSON

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rules: [""],
    },
  });
  const [result, setResult] = useState(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  const onSubmit = async (data) => {
    try {
      console.log(data.rules);
      const response = await axios.post(
        "http://localhost:5000/combine",
        data.rules,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Input Rules</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((item, index) => (
            <div key={item.id} className="mb-4 flex gap-2">
              <input
                {...register(`rules.${index}`, { required: true })}
                placeholder="Enter a rule as a string"
                className="w-full p-2 border rounded-md focus:outline-none"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 ml-2"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => append("")}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Add Rule
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              Submit
            </button>
          </div>
          {errors.rules && (
            <p className="text-red-500 mt-2">Please fill out all rules.</p>
          )}
        </form>
        {result && (
          <div className="flex justify-between items-center mt-4">
            <button
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              onClick={() => setShowAst(!showAst)} // Toggle AST visibility
            >
              {showAst ? "Show JSON" : "Show AST"}
            </button>
          </div>
        )}
      </div>

      {/* Conditional rendering based on toggle state */}
      {result && showAst && result && <AstVisualiser ast={result} />}
      {result && !showAst && (
        <pre className="mt-4 p-3 bg-gray-100 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default Combine;
