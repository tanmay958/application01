import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

function Evaluate() {
  const [jsonInput, setJsonInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fields, setFields] = useState(null); // To store the dynamic fields after API response
  const [qualificationResult, setQualificationResult] = useState(null); // State to hold qualification result
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Function to send initial JSON input and get required fields
  const sendData = async () => {
    setErrorMessage(""); // Clear previous errors
    try {
      // Validate JSON
      const parsedInput = JSON.parse(jsonInput);

      const response = await axios.post(
        "http://localhost:5000/extract-fields",
        parsedInput,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.fields) {
        // Store the fields in the state to render the dynamic form
        setFields(response.data.fields);
      }
    } catch (error) {
      setErrorMessage(
        "Invalid JSON: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // Function to handle form submission with dynamic inputs
  const onSubmit = async (formData) => {
    try {
      // Combine the JSON input with the form data
      const combinedData = {
        jsonInput: JSON.parse(jsonInput), // Ensure jsonInput is parsed
        ...formData,
      };

      const response = await axios.post(
        "http://localhost:5000/api",
        combinedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Data sent successfully!");
        // Check if the user qualifies based on the response
        setQualificationResult(response.data.qualified);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Error submitting form: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">JSON Input</h2>

        {/* Textarea for JSON input */}
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"key": "value"}'
          className="w-full h-24 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300 resize-none"
        />

        {/* Button to send JSON and get dynamic fields */}
        <div className="flex justify-end mt-3">
          <button
            onClick={sendData}
            className="bg-blue-500 text-white py-2 px-5 rounded-md hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
        )}

        {/* Render dynamic form if fields are available */}
        {fields && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Fields According to Json Data
            </h2>

            {/* Grid Layout for side-by-side form fields */}
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(fields).map(([fieldName, fieldType]) => (
                <div key={fieldName} className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    {fieldName} ({fieldType})
                  </label>

                  {/* Render appropriate input based on field type */}
                  {fieldType === "string" && (
                    <input
                      {...register(fieldName, { required: true })}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
                      placeholder={`Enter ${fieldName}`}
                    />
                  )}

                  {fieldType === "integer" && (
                    <input
                      {...register(fieldName, {
                        required: true,
                        valueAsNumber: true,
                      })}
                      type="number"
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
                      placeholder={`Enter ${fieldName}`}
                    />
                  )}

                  {errors[fieldName] && (
                    <span className="text-red-500 text-sm">
                      This field is required
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Submit button */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition"
              >
                Submit Form
              </button>
            </div>
          </form>
        )}

        {/* Display qualification result if available */}
        {qualificationResult !== null && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">
              {qualificationResult
                ? "Qualified for the role!"
                : "Not Qualified for the role."}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Evaluate;
