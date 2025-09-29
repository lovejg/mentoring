document.addEventListener("DOMContentLoaded", () => {
  let currentInput = "0";
  let expression = "";
  let isNewNumber = true;
  let isCalculationDone = false;

  let expressionDisplay = document.querySelector(".expression");
  let resultDisplay = document.querySelector(".result");

  function formatNumber(num) {
    if (num === "") {
      return "0";
    }
    const token = num.toString().split(".");
    token[0] = token[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return token.join(".");
  }

  function updateDisplay() {
    expressionDisplay.textContent = expression
      .replace(/\*/g, "x")
      .replace(/\//g, "÷");
    resultDisplay.textContent = formatNumber(currentInput);
  }

  function inputNumber(num) {
    if (isCalculationDone) {
      currentInput = "";
      expression = "";
      isCalculationDone = false;
    }

    if (isNewNumber) {
      currentInput = num;
      isNewNumber = false;
    } else {
      if (currentInput === "0") {
        currentInput = num;
      } else {
        currentInput += num;
      }
    }
    updateDisplay();
  }

  function inputDot() {
    if (isCalculationDone) {
      currentInput = "";
      expression = "";
      isCalculationDone = false;
    }

    if (isNewNumber) {
      currentInput = "0.";
      isNewNumber = false;
    } else if (!currentInput.includes(".")) {
      currentInput += ".";
    }
    updateDisplay();
  }

  function inputOperator(operator) {
    if (isNewNumber && expression !== "" && !isCalculationDone) {
      expression = expression.slice(0, -2) + operator + " ";
    } else {
      expression += formatNumber(currentInput) + " " + operator + " ";
      isNewNumber = true;
      isCalculationDone = false;
    }
    updateDisplay();
  }

  function calculate() {
    if (expression === "" || isNewNumber) {
      return;
    }

    let finalExpression = expression + formatNumber(currentInput);
    let realExpression = finalExpression
      .replace(/,/g, "")
      .replace(/x/g, "*")
      .replace(/÷/g, "/");
    let result = new Function(
      '"use strict"; return (' + realExpression + ")"
    )();

    expressionDisplay.textContent =
      finalExpression.replace(/\*/g, "×").replace(/\//g, "÷") + " =";
    currentInput = result.toString();
    expression = "";
    isCalculationDone = true;
    isNewNumber = true;
    resultDisplay.textContent = formatNumber(currentInput);
  }

  function clear() {
    currentInput = "0";
    expression = "";
    isNewNumber = true;
    isCalculationDone = false;
    updateDisplay();
  }

  function backspace() {
    if (isCalculationDone || isNewNumber) {
      return;
    }

    currentInput = currentInput.slice(0, -1);
    if (currentInput === "") {
      currentInput = "0";
      isNewNumber = true;
    }
    updateDisplay();
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target.matches("button")) {
      return;
    }

    if (target.classList.contains("number")) {
      target.id === "dot" ? inputDot() : inputNumber(target.textContent);
    } else if (target.classList.contains("operator")) {
      target.id === "equal" ? calculate() : inputOperator(target.textContent);
    } else if (target.classList.contains("func")) {
      target.id === "ac" ? clear() : backspace();
    }
  });

  document.addEventListener("keydown", (event) => {
    let key = event.key;
    if (key >= "0" && key <= "9") {
      inputNumber(key);
    } else if (key === ".") {
      inputDot();
    } else if (["+", "-", "*", "/"].includes(key)) {
      event.preventDefault();
      inputOperator(key);
    } else if (key === "Enter" || key === "=") {
      event.preventDefault();
      calculate();
    } else if (key === "Backspace") {
      event.preventDefault();
      backspace();
    } else if (key === "Escape") {
      event.preventDefault();
      clear();
    }
  });
});
