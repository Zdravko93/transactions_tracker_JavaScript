const currentBalanceElement = document.querySelector(".balance-number");
const currentBalanceElementParent = currentBalanceElement.parentNode;
const totalIncomeElement = document.querySelector(".income-amount");
const totalExpenseElement = document.querySelector(".expense-amount");
const dataList = document.querySelector(".data-list");
const newTransactionNameInput = document.querySelector("input[id='name']");
const newTransactionAmountInput = document.querySelector("input[id='amount']");
const addButtons = document.querySelectorAll(".expense_tracker button");

const errorModal = document.querySelector(".modal");
const errorMessageElement = document.querySelector(".modal-error-message");
const errorModalButton = document.querySelector(".modal-button");
const backdrop = document.querySelector(".backdrop");

let totalIncomeNumber = 0;
let totalExpenseNumber = 0;
let currentBalanceNumber = 0;

const showErrorModal = message => {
    errorModal.style.display = "flex";
    backdrop.style.display = "block";
    errorMessageElement.classList.add("modal-fade-in");
    errorMessageElement.textContent = message;
};

const addErrorModal = message => {
    document.querySelector("body").appendChild(errorModal);
    document.querySelector("body").appendChild(backdrop);
    showErrorModal(message);
};

const removeErrorModal = () => {
    errorModal.parentElement.removeChild(errorModal);
    backdrop.parentElement.removeChild(backdrop);
};

const validateInput = (inputName, inputAmount) => {
    const inputTextStringContainsNumbers = /\d/.test(inputName);
    const parsedNumber = parseFloat(inputAmount);

    if (inputName === "" || inputAmount === "") {
        addErrorModal("Name and amount fields must not be empty.")
        return;
    }
    else if (inputTextStringContainsNumbers) {
        addErrorModal('Transaction name cannot contain numbers.')
        return;
    } else if (isNaN(parsedNumber)) {
        addErrorModal("Amount must be a valid number.")
        return;
    } else if (parsedNumber < 0) {
        addErrorModal("You must enter positive amount number");
        return;
    }

    return true;
};

const formatNumber = number => {
    return new Intl.NumberFormat().format(number);
};

const resetAnimation = (animatedElement, time) => {
    setTimeout(() => {
        animatedElement.classList.remove("item-fade-in");
    }, time);
};

const updateTotalAndBalance = (parsedInputAmountValue, operatorString) => {
    if (operatorString === "Add income") {
        totalIncomeNumber += parsedInputAmountValue;
        totalIncomeElement.classList.add("item-fade-in");
        totalIncomeElement.textContent = `$${formatNumber(totalIncomeNumber)} USD`;
        currentBalanceNumber += parsedInputAmountValue;
    } else if (operatorString === "Add expense") {
        totalExpenseNumber -= parsedInputAmountValue;
        totalExpenseElement.classList.add("item-fade-in");
        totalExpenseElement.textContent = `$${formatNumber(totalExpenseNumber)} USD`;
        currentBalanceNumber -= parsedInputAmountValue;
    }

    // REMOVE element from the DOM/ADD element to the DOM(for adding class/animation again)
    currentBalanceElementParent.removeChild(currentBalanceElement);
    currentBalanceElementParent.appendChild(currentBalanceElement);

    currentBalanceElement.classList.add("current-balance-update");
    currentBalanceElement.textContent = `$${formatNumber(currentBalanceNumber)} USD`;
    resetAnimation(operatorString === "Add income" ? totalIncomeElement : totalExpenseElement, 300);
    resetAnimation(currentBalanceElement, 700);
};

const createTransactionItem = (inputNameValue, inputAmountValue, operatorString) => {
    const newListItemElement = document.createElement("li");
    newListItemElement.classList.add("item-fade-in");
    newListItemElement.classList.add("expense-item");

    const newItemTextElement = document.createElement("div");
    newItemTextElement.textContent = inputNameValue;
    newListItemElement.appendChild(newItemTextElement);

    const newItemNumberElement = document.createElement("div");
    newItemNumberElement.classList.add("item-amount");

    const amountPrefix = operatorString === "Add income" ? "+" : "-";
    newItemNumberElement.textContent = `$${amountPrefix}${formatNumber(inputAmountValue)} USD`;
    newListItemElement.appendChild(newItemNumberElement);

    const newListItemBorderClass = amountPrefix === "+" ? "border-green" : "border-red";
    newListItemElement.classList.add(newListItemBorderClass);

    const editDeleteButtonsContainer = document.createElement("div");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
        const deleteButtonParentElement = deleteButton.parentElement;
        const listItemToDelete = deleteButtonParentElement.parentElement;
        listItemToDelete.classList.add("list-item-fade-out");
        setTimeout(() => {
            const amountToDelete = operatorString === "Add income" ? inputAmountValue : -inputAmountValue;
            if (operatorString === "Add income") {
                totalIncomeNumber -= amountToDelete;
            } else if (operatorString === "Add expense") {
                totalExpenseNumber -= amountToDelete;
            }
            // Update the UI 
            totalIncomeElement.textContent = `$${formatNumber(totalIncomeNumber)} USD`;
            totalExpenseElement.textContent = `$${formatNumber(totalExpenseNumber)} USD`;

            // Update changes on the current balance
            currentBalanceNumber = totalIncomeNumber - totalExpenseNumber;
            currentBalanceElement.textContent = `$${formatNumber(currentBalanceNumber)} USD`;
            currentBalanceElement.classList.add("current-balance-update");

            listItemToDelete.parentElement.removeChild(listItemToDelete);

            saveTransactionsToLocalStorage();
        }, 700); // after animation plays, remove element from the DOM
    });
    editDeleteButtonsContainer.appendChild(deleteButton);

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", () => {
        // Alligning input fields vertically by adding 'display: flex' to their parent elements
        newItemTextElement.style.display = "flex";
        newItemNumberElement.style.display = "flex";

        // Create input fields to edit name and amount values
        const newNameInput = document.createElement("input");
        newNameInput.type = "text";
        newNameInput.value = inputNameValue; // Initial value of INPUT element
        newNameInput.classList.add("new-edit-input");
        newItemTextElement.innerHTML = ""; // Clear existing content
        newItemTextElement.appendChild(newNameInput);

        const newAmountInput = document.createElement("input");
        newAmountInput.type = "number";
        newAmountInput.value = inputAmountValue;  // Initial value of INPUT element
        newAmountInput.classList.add("new-edit-input");
        newItemNumberElement.innerHTML = ""; // Clear existing content
        newItemNumberElement.appendChild(newAmountInput);

        newNameInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                saveChanges();
            }
        });

        newAmountInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                saveChanges();
            }
        });

        newAmountInput.addEventListener("keypress", event => { // listening to every user's keystroke to check if "+" or "-" have been pressed
            const keyCode = event.keyCode || event.which;

            if (keyCode === 45 || keyCode === 43) {
                event.preventDefault();
            }
        });

        //Create a 'Save" button to save changes
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.classList.add("save-button");
        editDeleteButtonsContainer.innerHTML = ""; // clear existing content
        editDeleteButtonsContainer.appendChild(saveButton);

        saveButton.addEventListener("click", () => {
            saveChanges();
        });

        const saveChanges = () => {
            const updatedName = newNameInput.value;
            const updatedAmount = parseFloat(newAmountInput.value);

            if (updatedName === "" || isNaN(updatedAmount)) {
                addErrorModal("Name and amount must be valid.");
                return;
            }

            // Remove element temporarily from the DOM, so it can be aded back again 
            currentBalanceElementParent.removeChild(currentBalanceElement);

            // Update transaction item with new values
            newItemTextElement.textContent = updatedName;
            newItemNumberElement.textContent = `$${amountPrefix}${formatNumber(updatedAmount)} USD`;

            // Calculate the difference between the updated amount and the original amount
            const amountDifference = updatedAmount - inputAmountValue;

            if (operatorString === "Add income") {
                totalIncomeNumber += amountDifference;
                totalIncomeElement.classList.add("item-fade-in");
                totalIncomeElement.textContent = `$${formatNumber(totalIncomeNumber)} USD`;
                resetAnimation(totalIncomeElement, 300);
            } else if (operatorString === "Add expense") {
                totalExpenseNumber -= amountDifference;
                totalExpenseElement.classList.add("item-fade-in");
                totalExpenseElement.textContent = `$${formatNumber(totalExpenseNumber)} USD`;
                resetAnimation(totalExpenseElement, 300);
            }

            // Calculate the new current balance number
            currentBalanceNumber = totalIncomeNumber - totalExpenseNumber;
            currentBalanceElement.classList.add("current-balance-update");
            currentBalanceElement.textContent = `$${formatNumber(currentBalanceNumber)} USD`;

            // Add element back to its parent
            currentBalanceElementParent.appendChild(currentBalanceElement);

            // Remove the 'Save' button and 're-add' the 'Edit' and 'Delete' buttons
            editDeleteButtonsContainer.innerHTML = "";
            editDeleteButtonsContainer.appendChild(deleteButton);
            editDeleteButtonsContainer.appendChild(editButton);

            saveTransactionsToLocalStorage();
        };
    });

    editDeleteButtonsContainer.appendChild(editButton);
    newListItemElement.appendChild(editDeleteButtonsContainer);

    dataList.appendChild(newListItemElement);
};

const addTransaction = event => {
    const inputNameValue = newTransactionNameInput.value;
    const inputAmountValue = newTransactionAmountInput.value;
    const parsedInputAmountValue = parseFloat(inputAmountValue);

    const operatorString = event.target.textContent;
    const isValid = validateInput(inputNameValue, inputAmountValue);

    if (!isValid) {
        newTransactionNameInput.value = "";
        newTransactionAmountInput.value = "";
        return;
    }

    createTransactionItem(inputNameValue, parsedInputAmountValue, operatorString);
    updateTotalAndBalance(parsedInputAmountValue, operatorString);
    saveTransactionsToLocalStorage();

    newTransactionNameInput.value = "";
    newTransactionAmountInput.value = "";
};

addButtons.forEach(button => {
    button.addEventListener("click", addTransaction);
});

backdrop.addEventListener("click", removeErrorModal);
errorModalButton.addEventListener("click", removeErrorModal);


const saveTransactionsToLocalStorage = () => {
    const transactions = [];

    const transactionItems = document.querySelectorAll('.expense-item');
    transactionItems.forEach(item => {
        const name = item.querySelector("div:first-child").textContent;
        const amountString = item.querySelector(".item-amount").textContent;
        // .replace("$", "") => This is to remove "$" sign from the 'amountString', because the parseFloat expects a numberic string without symbols like "$" etc
        // .replace(",", ""); => This is to remove commas from the 'amountString'. It is done to handle cases where numbers are formatted with commas as thousands separators
        const amount = parseFloat(amountString.replace("$", "").replace(",", "")); // Remove "$" signs and commas
        transactions.push({ name, amount });
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));
};

const loadTransactionsFromLocalStorage = () => {
    const transactionString = localStorage.getItem("transactions");
    if (transactionString) {
        const transactions = JSON.parse(transactionString);

        transactions.forEach(transaction => {
            createTransactionItem(transaction.name, transaction.amount, "Add expense");
        });
    }
};

window.onload = loadTransactionsFromLocalStorage();


