import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import RuleForm from "./RuleForm";
import Evaluate from "./Evaluate";
import Combine from "./Combine";
import App from "../App";

const Navbar = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="fixed top-0 left-0 w-full flex justify-center">
          <div className="bg-blue-600 text-white shadow-md rounded-full px-8 py-4 mt-4 animate-fade-in-down w-[60%] flex justify-around">
            <NavLink
              to="/create"
              className={({ isActive }) =>
                `text-lg font-semibold hover:text-gray-300 transition duration-300 ease-in-out transform hover:scale-105 ${
                  isActive ? "border-b-2 border-white" : ""
                }`
              }
            >
              Create
            </NavLink>
            <NavLink
              to="/evaluate"
              className={({ isActive }) =>
                `text-lg font-semibold hover:text-gray-300 transition duration-300 ease-in-out transform hover:scale-105 ${
                  isActive ? "border-b-2 border-white" : ""
                }`
              }
            >
              Evaluate
            </NavLink>
            <NavLink
              to="/combine"
              className={({ isActive }) =>
                `text-lg font-semibold hover:text-gray-300 transition duration-300 ease-in-out transform hover:scale-105 ${
                  isActive ? "border-b-2 border-white" : ""
                }`
              }
            >
              Combine
            </NavLink>
          </div>
        </nav>

        {/* Define the routes for different components */}
        <main className="pt-24">
          <Routes>
            <Route path="/create" element={<RuleForm />} />
            <Route path="/evaluate" element={<Evaluate />} />
            <Route path="/combine" element={<Combine />} />
            <Route path="/" element={<App />} /> {/* Default route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default Navbar;
