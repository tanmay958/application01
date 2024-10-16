import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const mongoURI = process.env.MONGO_URI;
console.log(process.env.MONGO_URI);
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Define a Mongoose schema
const RuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rule: { type: String, required: true },
  ast: { type: Object, required: true },
  dataAndTypes: { type: Object, required: true },
});

// Create a model based on the schema
const Rule = mongoose.model("Rule", RuleSchema);

const app = express();
const PORT = 5000;
app.use(cors());

// Middleware to parse JSON requests
// mongodb+srv://tanmay99:<db_password>@cluster0.xp8mx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

app.use(express.json());

class Node {
  constructor(type, value = null) {
    this.type = type; // 'operator' or 'operand'
    this.value = value; // value for conditions or operator type (AND/OR)
    this.left = null; // left child node
    this.right = null; // right child node
  }
}

const extractFieldsFromAST = (node, fieldTypeMap = {}) => {
  if (node.type === "operand") {
    const conditionRegex = /([a-zA-Z_]+)\s*(>=|<=|>|<|=)\s*('[^']*'|[0-9]+)/;
    const match = node.value.match(conditionRegex);

    if (match) {
      const fieldName = match[1];
      const value = match[3];

      let fieldType;

      // Determine field type based on value
      if (!isNaN(value) && !isNaN(parseFloat(value))) {
        if (value.includes(".")) {
          fieldType = "double"; // Floating point value
        } else {
          fieldType = "integer"; // Integer value
        }
      } else if (value.startsWith('"') || value.startsWith("'")) {
        fieldType = "string"; // String value
      } else {
        fieldType = "unknown"; // Unknown type
      }

      // If field already exists, set it to "mixed" if there are conflicting types
      if (!fieldTypeMap[fieldName]) {
        fieldTypeMap[fieldName] = fieldType;
      } else if (fieldTypeMap[fieldName] !== fieldType) {
        fieldTypeMap[fieldName] = "mixed";
      }
    }
  }

  // Recursively extract from left and right children if they exist
  if (node.left) extractFieldsFromAST(node.left, fieldTypeMap);
  if (node.right) extractFieldsFromAST(node.right, fieldTypeMap);

  return fieldTypeMap;
};

function parseRule2(rule) {
  const cleanRule = rule.replace(/\s+/g, " ").trim();

  // Check for balanced parentheses
  const openCount = (cleanRule.match(/\(/g) || []).length;
  const closeCount = (cleanRule.match(/\)/g) || []).length;
  if (openCount !== closeCount) {
    throw new Error(`Error: Unbalanced parentheses in rule: "${rule}"`);
  }

  const stack = [];
  let currentNode = null;

  // Split the rule into tokens and filter out empty strings
  const tokens = cleanRule
    .split(/(AND|OR|\(|\))/)
    .filter((token) => token.trim() !== "");

  for (let token of tokens) {
    token = token.trim();

    if (token === "(") {
      stack.push(currentNode);
      currentNode = null;
    } else if (token === ")") {
      const lastNode = stack.pop();
      if (lastNode) {
        if (!lastNode.left) {
          lastNode.left = currentNode;
        } else {
          lastNode.right = currentNode;
        }
        currentNode = lastNode;
      }
    } else if (token === "AND" || token === "OR") {
      const operatorNode = new Node("operator", token);
      if (currentNode) {
        operatorNode.left = currentNode;
      }
      currentNode = operatorNode;
    } else {
      const conditionMatch = token.match(
        /([a-zA-Z_]+)\s*(>=|<=|>|<|=)\s*('[^']*'|[0-9]+)/
      );
      if (!conditionMatch) {
        throw new Error(
          `Error: Invalid condition format in rule: "${rule}". Found: "${token}"`
        );
      }
      const conditionNode = new Node("operand", token);
      if (
        currentNode &&
        currentNode.type === "operator" &&
        !currentNode.right
      ) {
        currentNode.right = conditionNode;
      } else {
        currentNode = conditionNode;
      }
    }
  }

  return currentNode;
}

function evaluateAST(node, input) {
  if (node.type === "operand") {
    const [field, operator, value] = node.value.split(/\s+/);
    const fieldValue = input[field];

    switch (operator) {
      case ">":
        return fieldValue > (isNaN(value) ? value : Number(value));
      case "<":
        return fieldValue < (isNaN(value) ? value : Number(value));
      case "=":
        return (
          fieldValue ===
          (value.startsWith("'") ? value.slice(1, -1) : Number(value))
        );
      case ">=":
        return fieldValue >= (isNaN(value) ? value : Number(value));
      case "<=":
        return fieldValue <= (isNaN(value) ? value : Number(value));
      default:
        return false;
    }
  } else if (node.type === "operator") {
    const leftValue = evaluateAST(node.left, input);
    const rightValue = evaluateAST(node.right, input);

    if (node.value === "AND") {
      return leftValue && rightValue;
    } else if (node.value === "OR") {
      return leftValue || rightValue;
    }
  }

  return false;
}
function combine_rules(rules) {
  if (!Array.isArray(rules) || rules.length === 0) {
    throw new Error("Rules should be a non-empty array.");
  }

  // Helper function to extract the logical operator from a rule
  const extractOperator = (rule) => {
    if (rule.includes("AND")) return "AND";
    if (rule.includes("OR")) return "OR";
    return null; // No logical operator found
  };

  // Count the frequency of logical operators in the rules
  const operatorFrequency = { AND: 0, OR: 0 };
  rules.forEach((rule) => {
    const operator = extractOperator(rule);
    if (operator) {
      operatorFrequency[operator]++;
    }
  });

  // Determine the most frequent operator
  const mostFrequentOperator =
    operatorFrequency.AND >= operatorFrequency.OR ? "AND" : "OR";

  // Build the combined AST using the most frequent operator
  const root = {
    type: "LogicalExpression",
    operator: mostFrequentOperator,
    left: null,
    right: null,
  };

  // Combine the rules into the AST
  let currentNode = root;
  for (let i = 0; i < rules.length; i++) {
    const newNode = {
      type: "Rule",
      value: rules[i],
    };

    if (currentNode.left === null) {
      currentNode.left = newNode;
    } else if (currentNode.right === null) {
      currentNode.right = newNode;
    } else {
      // Create a new logical expression with the most frequent operator
      const newRoot = {
        type: "LogicalExpression",
        operator: mostFrequentOperator,
        left: currentNode,
        right: newNode,
      };
      currentNode = newRoot;
    }
  }

  return currentNode;
}
function extractFieldsAndTypes(rule) {
  const fieldTypeMap = {};

  // Regular expression to match field names and their types (if any)
  const regex = /(\w+)\s*([<>=!]+)\s*(['"]?\w+['"]?|\d*\.?\d+|NaN)/g;
  let match;

  while ((match = regex.exec(rule)) !== null) {
    const fieldName = match[1]; // The field name (e.g., age, department)
    const operator = match[2]; // The operator (e.g., >, =, <)
    const value = match[3]; // The value (e.g., 'Sales', 50000)

    let fieldType;

    // Determine the type based on the value
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      if (value.includes(".")) {
        fieldType = "double"; // Floating point value
      } else {
        fieldType = "integer"; // Integer value
      }
    } else if (value.startsWith('"') || value.startsWith("'")) {
      fieldType = "string"; // String value
    } else {
      fieldType = "unknown"; // Unknown type
    }

    // Add the field name and its type to the map
    if (!fieldTypeMap[fieldName]) {
      fieldTypeMap[fieldName] = fieldType;
    } else {
      // If the field already exists, keep the most generic type
      if (fieldTypeMap[fieldName] !== fieldType) {
        fieldTypeMap[fieldName] = "mixed"; // If different types are found, mark it as mixed
      }
    }
  }

  return fieldTypeMap;
}
app.get("/api/rules", async (req, res) => {
  try {
    const rules = await Rule.find(); // Fetch all rules from the database
    res.json(rules); // Send the rules as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Handle errors
  }
});

app.post("/validate", async (req, res) => {
  const { rule, ruleName } = req.body;
  if (!rule) {
    return res.json({ error: "No rule is present" });
  }

  try {
    const ast_converted = parseRule2(rule);
    console.log(ast_converted);
    const fieldWithDataTypes = extractFieldsAndTypes(rule);
    console.log(fieldWithDataTypes);
    // Save the validated data into MongoDB
    const newRule = new Rule({
      name: ruleName,
      rule,
      ast: ast_converted,
      dataAndTypes: fieldWithDataTypes,
    });

    await newRule.save();
    res.json({
      ast: ast_converted,
      dataAndTypes: fieldWithDataTypes,
    });
  } catch (err) {
    return res.json({ error: err.message });
  }
});

app.post("/extract-fields", (req, res) => {
  const ast = req.body; // Assume AST is passed as JSON
  console.log("Received AST:", ast); // Debugging: log the received AST

  if (!ast) {
    return res
      .status(400)
      .json({ error: "No AST provided in the request body" });
  }

  try {
    const fieldWithDataTypes = extractFieldsFromAST(ast);
    console.log("Extracted Fields with Data Types:", fieldWithDataTypes);
    res.json({
      fields: fieldWithDataTypes,
    });
  } catch (err) {
    console.log(err);
  }
});
app.post("/api", (req, res) => {
  try {
    const { jsonInput, ...formData } = req.body; // Extract jsonInput and formData
    console.log(jsonInput, formData);

    // Rule: Example rule - "qualify if age is greater than 30 and salary is above 50000"
    const qualifies = evaluateAST(jsonInput, formData);

    // Return the result
    return res.status(200).json({ qualified: qualifies });
  } catch (error) {
    return res.status(400).json({ message: "Error processing form data" });
  }
});
app.post("/combine", (req, res) => {
  console.log(req.body);
  try {
    const combined_rule = combine_rules(req.body);
    console.log(combined_rule);
    res.send(combined_rule);
  } catch (err) {
    res.send(err);
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
