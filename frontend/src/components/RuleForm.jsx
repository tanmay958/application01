import { useState } from "react";
import axios from "axios";
import AstVisualizer from "./AstVisualiser";

export default function RuleForm() {
  const [ruleName, setRuleName] = useState(""); // State for rule name
  const [rule, setRule] = useState("");
  const [result, setResult] = useState(null); // State for storing the server response
  const [error, setError] = useState(""); // State for error messages
  const [showAst, setShowAst] = useState(true); // State for toggling between AST and JSON

  const validateRule = async () => {
    try {
      setError(""); // Reset error state
      const response = await axios.post("http://localhost:5000/validate", {
        ruleName, // Include rule name in the request
        rule, // Include rule in the request
      });
      console.log(response.data);
      setResult(response.data); // Update result state with server response
    } catch (err) {
      console.error("Error communicating with the server:", err);
      setError("Error communicating with the server. Please try again."); // Update error state
      setResult(null); // Reset result on error
    }
  };

  return (
    <>
      <div className="container mx-auto p-4 bg-white rounded shadow-md">
        <h2 className="text-lg font-semibold mb-3">MAKE RULES</h2>
        {/* Input for Rule Name */}
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded mb-3"
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)} // Update ruleName state on change
          placeholder="Enter the rule name here..."
        />
        {/* Textarea for Rule */}
        <textarea
          className="w-full border border-gray-300 p-2 rounded mb-3"
          rows="3"
          value={rule}
          onChange={(e) => setRule(e.target.value)} // Update rule state on change
          placeholder="Enter your rule here..."
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
          onClick={validateRule} // Trigger validation on click
        >
          Make Rule
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}{" "}
        {/* Display error if it exists */}
        {result && result.dataAndTypes && (
          <div className="mt-4">
            <h3 className="font-semibold">Validation Result:</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              {Object.entries(result.dataAndTypes).map(([field, type]) => (
                <div
                  key={field}
                  className="flex justify-between items-center p-3 bg-blue-100 rounded-md shadow-sm border border-blue-300"
                >
                  <span className="text-sm font-medium text-blue-800">
                    {field + " :"}
                  </span>
                  <span className="text-sm text-gray-600">{": " + type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Toggle button to switch between AST visualizer and JSON */}
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
      {result && showAst && result.ast && <AstVisualizer ast={result.ast} />}
      {result && !showAst && (
        <pre className="mt-4 p-3 bg-gray-100 rounded">
          {JSON.stringify(result.ast, null, 2)}
        </pre>
      )}
    </>
  );
}
