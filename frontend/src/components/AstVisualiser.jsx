import Tree from "react-d3-tree";

// Function to transform AST into tree data
const transformAstToTree = (node) => {
  // Check if the node has left or right children and map them accordingly
  const children = [];
  if (node.left) {
    children.push(transformAstToTree(node.left));
  }
  if (node.right) {
    children.push(transformAstToTree(node.right));
  }

  return {
    name: node.type,
    attributes: {
      value: node.value || null,
    },
    children: children.length > 0 ? children : null, // Only include children if they exist
  };
};

// Main component to visualize the AST
const AstVisualizing = ({ ast }) => {
  const treeData = transformAstToTree(ast); // Transform the AST for tree rendering

  // Function to handle the rendering of the tree
  const renderTree = () => {
    const translate = { x: 260, y: 500 }; // Adjust as needed for centering
    const scale = 1; // Adjust the scale to fit the tree

    return (
      <Tree
        data={treeData}
        translate={translate}
        scale={scale}
        orientation="horizontal" // Set to horizontal for left rotation
      />
    );
  };

  return (
    <div className="border border-black h-[500px] shadow-2xl rounded-md">
      {renderTree()}
    </div>
  );
};

// Usage in your main component
const AstVisualiser = (props) => {
  console.log("i am loaded");
  const { ast } = props;
  return (
    <div>
      <AstVisualizing ast={ast} />
    </div>
  );
};

export default AstVisualiser;
