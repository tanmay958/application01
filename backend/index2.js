class Node {
  constructor(type, value = null) {
    this.type = type; // 'operator' or 'operand'
    this.value = value; // value for conditions or operator type (AND/OR)
    this.left = null; // left child node
    this.right = null; // right child node
  }
}
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

function parseRule(rule) {
  // Remove whitespace for easier parsing
  const cleanRule = rule.replace(/\s+/g, " ");

  // Basic regex patterns to match conditions and operators
  const conditionPattern = /([a-zA-Z_]+)\s*(>=|<=|>|<|=)\s*('[^']*'|[^ ]+)/g;
  const operatorPattern = /(\bAND\b|\bOR\b)/g;

  const stack = [];
  let currentNode = new ASTNode("Group");

  // Split the rule into tokens
  let tokens = cleanRule.split(/(AND|OR|\(|\))/).filter(Boolean);

  tokens.forEach((token) => {
    token = token.trim();

    if (token === "(") {
      const newGroup = new ASTNode("Group");
      currentNode.children.push(newGroup);
      stack.push(currentNode);
      currentNode = newGroup;
    } else if (token === ")") {
      currentNode = stack.pop();
    } else if (token.match(operatorPattern)) {
      const operatorNode = new ASTNode("Operator", token);
      currentNode.children.push(operatorNode);
    } else if (token.match(conditionPattern)) {
      const conditionNode = new ASTNode("Condition", token);
      currentNode.children.push(conditionNode);
    }
  });

  return currentNode;
}
function extractFieldsAndTypes(rule) {
  const fieldTypeMap = {};

  // Regular expression to match field names and their types (if any)
  const regex = /(\w+)\s*([<>=!]+)\s*(['"]?\w+['"]?|\d+)/g;
  let match;

  while ((match = regex.exec(rule)) !== null) {
    const fieldName = match[1]; // The field name (e.g., age, department)
    const operator = match[2]; // The operator (e.g., >, =, <)
    const value = match[3]; // The value (e.g., 'Sales', 50000)

    let fieldType;

    // Determine the type based on the value
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      fieldType = "number"; // Numeric value
    } else if (value.startsWith('"') || value.startsWith("'")) {
      fieldType = "string"; // String value
    } else {
      fieldType = "unknown"; // Unknown type
    }

    // Add the field name and its type to the map
    if (!fieldTypeMap[fieldName]) {
      fieldTypeMap[fieldName] = fieldType;
    }
  }

  return fieldTypeMap;
}
// Example rules
// const rules = [
//     "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5.2)",
// ];

// Extract and report unique operands with their types
// const uniqueOperandsReport = extractUniqueOperandsWithTypes(rules);
// console.log(uniqueOperandsReport);

// Example rules
// const rules = [
//     "((age > 30.5 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)",
//     "((department = 'HR' AND experience < 3.2) OR (salary <= 30000))",
// ];

// Extract and report unique operands with their types
// const uniqueOperandsReport = extractUniqueOperandsWithTypes(rules);
// console.log(uniqueOperandsReport);

// Example rules
const rules = [
  "((age > 30.5 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)",
  "((department = 'HR' AND experience < 3.2) OR (salary <= 30000))",
];

// Extract and report unique operands with their types
// const uniqueOperandsReport = extractUniqueOperandsWithTypes(rules);
// console.log(uniqueOperandsReport);

// Example usage
const rule1 =
  "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)";
const rule2 =
  "((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)";

const ast1 = parseRule2(rule1);
const ast2 = parseRule2(rule2);
// function evaluateAST(node, input) {
//   if (node.type === "Condition") {
//     const [field, operator, value] = node.value.split(/\s+/);
//     const fieldValue = input[field];

//     switch (operator) {
//       case ">":
//         return fieldValue > (isNaN(value) ? value : Number(value));
//       case "<":
//         return fieldValue < (isNaN(value) ? value : Number(value));
//       case "=":
//         return (
//           fieldValue ===
//           (value.startsWith("'") ? value.slice(1, -1) : Number(value))
//         );
//       case ">=":
//         return fieldValue >= (isNaN(value) ? value : Number(value));
//       case "<=":
//         return fieldValue <= (isNaN(value) ? value : Number(value));
//       default:
//         return false;
//     }
//   } else if (node.type === "Operator") {
//     return node.value === "AND";
//   } else if (node.type === "Group") {
//     let results = [];
//     for (let i = 0; i < node.children.length; i++) {
//       const child = node.children[i];

//       if (child.type === "Operator") {
//         const nextCondition = node.children[i + 1];
//         if (nextCondition) {
//           const result = evaluateAST(nextCondition, input);
//           if (child.value === "AND") {
//             results.push(result);
//           } else if (child.value === "OR") {
//             return results.some(Boolean) || result;
//           }
//         }
//       } else {
//         results.push(evaluateAST(child, input));
//       }
//     }

//     return results.every(Boolean);
//   }
// }
const inputData1 = {
  age: 32,
  department: "Sales",
  salary: 60000,
  experience: 6,
};

const inputData2 = {
  age: 30,
  department: "Marketing",
  salary: 20000,
  experience: 7,
};
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

// Evaluate the AST against the input data
const result1 = evaluateAST(ast1, inputData1); // Expected: true
const result2 = evaluateAST(ast2, inputData2); // Expected: false

console.log("Result of rule 1 evaluation:", result1);
console.log("Result of rule 2 evaluation:", result2);
console.log(
  combine_rules([
    "age >= 18 AND salary > 30000",
    "experience > 2",
    "status == 'active' OR level > 5",
  ])
);
