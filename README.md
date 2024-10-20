﻿# Application1

This is a simple 3-tier rule engine application designed to determine user eligibility based on various attributes such as age, department, income, and spend. The system utilizes an Abstract Syntax Tree (AST) to represent conditional rules, allowing for dynamic creation, combination, and modification of these rules.

## Installation

```bash
git clone  https://github.com/tanmay958/application01
cd  application01
```
## Tech Stack
Reactjs, MongoDB (easier to store json object), Docker, NodeJs, Express
## Usage

```docker
docker compose up --build
## go to localhost:5173
```

## Extra Feature

1. Visualization of AST tree.
2. Automatic Fields and its type fetching based on the rule/json rule.
3. Type checking

## Rules to take Care

1.  Between operands, operator, literals there should be space like given in example

### 1. Rule Making

![Rule Making tab ](./Assets/Create.png)

### 2. Evaluating

![Evaluate Tab](./Assets/Evaluate.png)

### 3. Combine Rules

![Combine Tab](./Assets/Combine_Rules.png)
