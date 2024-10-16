import { useEffect, useState } from "react";
import axios from "axios";
import { FaDatabase, FaTimes } from "react-icons/fa"; // Importing React Icons

const WidgetDatabase = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // State to control the visibility of the widget

  // Function to fetch rules from the server
  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/rules");
      setRules(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);

  // Handle copying rule to clipboard
  const copyToClipboard = (rule) => {
    navigator.clipboard
      .writeText(rule)
      .then(() => alert("Rule copied to clipboard!"))
      .catch((err) => alert("Failed to copy: ", err));
  };

  // Refresh content handler
  const handleRefresh = () => {
    fetchRules();
  };

  // Toggle the widget's visibility
  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed top-5 right-5 z-50">
      <button
        className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-200"
        onClick={toggleWidget}
        aria-label="Toggle Database Widget"
      >
        <FaDatabase size={24} /> {/* Database icon */}
      </button>
      {isOpen && (
        <div className="widget-container relative mt-2 bg-white bg-opacity-80 backdrop-blur-sm border rounded-lg shadow-lg p-5">
          <button
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition duration-200"
            onClick={toggleWidget}
            aria-label="Close Widget"
          >
            <FaTimes size={20} /> {/* Close icon */}
          </button>
          <h2 className="widget-title text-lg font-bold">Rules</h2>
          <button
            className="refresh-button bg-blue-500 text-white rounded px-4 py-2 mt-2"
            onClick={handleRefresh}
          >
            Refresh
          </button>
          {loading && <p className="loading-text">Loading...</p>}
          {error && <p className="error-text text-red-500">Error: {error}</p>}
          <ul className="rules-list mt-2">
            {rules.map((rule) => (
              <li
                key={rule._id}
                className="rule-item flex justify-between items-center p-2 border-b"
              >
                <span className="rule-name">{rule.name}</span>
                <button
                  className="copy-button bg-green-500 text-white rounded px-2 py-1"
                  onClick={() => copyToClipboard(rule.rule)}
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WidgetDatabase;
