/*
=============================================================
                     STUFF TO WORK ON
=============================================================
1. Create a search bar: allow the user to type and see items with formal names that match what is in the search bar
2. Show the best priced product for each kind of item: if a product has the best price out of all products with the 
   same name, put a star next to it on the search bar and create a visual indicator when displaying the product
3. Allow for comparison between units: show the price per different units
4. Refine the GUI: make more modern
5. Make a small-screen version of the GUI
*/

// enables service worker
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("./service-worker.js")
//       .then(() => {
//         console.log("Service Worker Registered");
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   });
// }

// checks if local storage already has items
if (!localStorage.getItem("Data")) {
    // creates space for user to add items
    const ob = {};
    localStorage.setItem("Data", JSON.stringify(ob));
}


// all items recorded in local storage
const getUserItems = function() {
    return JSON.parse(localStorage.getItem("Data"));
}


const updateUserItems = function(newUserItems) {
    localStorage.setItem("Data", JSON.stringify(newUserItems));
}


// changes the normal price or best price of an item
/*
formalItemName: the lengthly name of an item (Ex: Family Farm Carrots, 2lbs bag); the key for an item stored in local storage
updatedInformationName: the name of what about the item is being changed; either "normalPrice" or "bestPrice"
updatedInformation: what the changed information is being changed to (Ex: updatedInformation would be 5 if bestPrice was being changed from $6.00 to $5.00)
*/
const updateItem = function(formalItemName, updatedInformationName, updatedInformation) {
    const userItems = getUserItems();
    userItems[formalItemName][updatedInformationName] = formatNumber(updatedInformation);
    // if the best price changes then the unit price (shows how much per kg, lbs, or 100g something costs) is changed too
    if (updatedInformationName === "bestPrice") {
        userItems[formalItemName].unitPrice = calculatePricePerUnit(userItems[formalItemName].bestPrice, userItems[formalItemName].quantity, userItems[formalItemName].unit);
    }
    updateUserItems(userItems);
}



// formats numbers to always end with two decimal places
const formatNumber = function(number) {
    // rounds numbers with decimal places to 2 decimal places
    number = Math.round(number*100) / 100;

    let numberString = String(number);
    // ensures numbers without decimals also have two decimal points
    if (!numberString.includes(".")) {
        return `${numberString}.00`;
    } else if (numberString.indexOf(".") === numberString.length - 2) {
        return `${numberString}0`;
    }
    return number;
}


// returns price per pound or price per 100 grams, depending on the unit

/*
price: the bestPrice of an item
quantity: the amount in the package
unit: what the quantity is measured in
*/
const calculatePricePerUnit = function(price, quantity, unit) {
    price = Number(price);
    quantity = Number(quantity);
    if (unit === "kg") {
        // price per 100g
        return formatNumber(price / (quantity * 10));
    } else if (unit === "g" || unit === "mL") {
        // price per 100g or 100mL
        return formatNumber(price / (quantity / 100));
    } else {
        // price per lbs or L
        return formatNumber(price / quantity);
    }

}


// format for object that stores an item's data
const generateNewItem = function(formalName, name, quantity, unit, normalPrice, bestPrice, ) {
    return {formalName: formalName, name: name, quantity: quantity, unit: unit, normalPrice: formatNumber(normalPrice), bestPrice: formatNumber(bestPrice), unitPrice: calculatePricePerUnit(bestPrice, quantity, unit)};
}


// shows warning if user tries to create an item that has the same formal name as an existing item
const showDuplicateEntryWarning = function(userItems, formalName) {
    // warning dialog
    duplicateWarningDiv.showModal();

    // shows the formal name of the item being created/duplicated item
    const duplicateItemLabel = document.querySelector("#duplicate-entry-warning label");
    duplicateItemLabel.textContent = formalName;

    // button to confirm create duplicate item
    createDuplicateItem.addEventListener("click", () => {
        addNewItemToData(userItems);
        clearAddNewItemField();
        // closes warning dialog
        duplicateWarningDiv.close();
    })

    // button to cancel creating duplicate item
    cancelDuplicateItem.addEventListener("click", () => {
        duplicateWarningDiv.close();
    })
}


const addNewItemToData = function(userItems) {
    updateUserItems(userItems);
}

// checks if newly created item has the same formal name as an existing item
const checkIfDuplicate = function(formalName, name, quantity, unit, normalPrice, bestPrice) {
    const newItem = generateNewItem(formalName, name, quantity, unit, normalPrice, bestPrice);
    let userItems = getUserItems();

    // prevents errors if no items are saved in data
    if (typeof userItems === "string") {
        userItems = {};
    }

    // checks if item exists    
    if (userItems[formalName]) {
        userItems[formalName] = newItem;
        showDuplicateEntryWarning(userItems, formalName);
    } else {
        userItems[formalName] = newItem;
        // adds new item to user's local storage
        addNewItemToData(userItems);
        clearAddNewItemField();
    }
}


// clears values inputted to create new item
const clearAddNewItemField = function() {
    const inputs = document.querySelectorAll("dialog input");
    for (const input of inputs) {
        input.value = "";
    }
    // dialog to get information about new item
    addNewItem.close();
    // updates list of items in search dropdown
    userItemOptions();
}


// shows all of the user's items in the search bar
const userItemOptions = function() {
    const userItems = getUserItems();
    // resets search bar's content
    searchBar.innerHTML = "<option></option>";

    // displays the name of each item in the search bar
    for (const key of Object.keys(userItems)) {
        searchBar.innerHTML += `<option>${userItems[key].formalName}</option>`
    }
} 



// shows the section that shows information about an item when it is selected
const showSelectedItemDiv = function() {
    // makes the container div visible
    selectedItem.hidden = false;
    selectedItem.classList.add("visible");
    // makes the elements of the container div visible
    for (const child of selectedItemChildren) {
        child.hidden = false;
    }

    // hides the sections that appear when a user wants to makes changes to an existing item
    changeNormalPrice.hidden = true;
    changeBestPrice.hidden = true;
    changeUnit.hidden = true;
    
}


// shows information for a selected item
const showItem = function(formalItemName) {

    const userItems = getUserItems();
    const selectedItem = userItems[formalItemName];

    // shows section that shows information about a selected item 
    // only returns true the first time an item is selected from the search menu
    if (selectedItem.hidden = true) {
        showSelectedItemDiv();
    }

    title.textContent = selectedItem.formalName;
    // display "100" before units in case of g or mL
    if (selectedItem.unit === "g" || selectedItem.unit === "mL") {
        unitPriceHeading.textContent = `100${selectedItem.unit}`;
        unitPriceUnit.textContent = `100${selectedItem.unit}`;
    // display "100g" for kg
    } else if (selectedItem.unit === "kg") {
        unitPriceHeading.textContent = `100g`;
        unitPriceUnit.textContent = '100g';
    } else {
        unitPriceHeading.textContent = selectedItem.unit;
        unitPriceUnit.textContent = selectedItem.unit;
    }

    generalName.textContent = selectedItem.name;
    normalPriceNumber.textContent = selectedItem.normalPrice;
    bestPriceNumber.textContent = selectedItem.bestPrice;
    unitPriceNumber.textContent = selectedItem.unitPrice;
}

const updateChangeDisplayField = function() {
    changeNormalPrice.innerHTML = `<p>$<label contenteditable>${normalPriceNumber.textContent}</label></p><button class="exit-change-btn">X</button>`;
    changeBestPrice.innerHTML = `<p>$<label contenteditable>${bestPriceNumber.textContent}</label></p><button class="exit-change-btn">X</button>`;
}

const updateChangeUnit = function() {
    changeUnit.innerHTML = '<select><option>lbs</option><option>kg</option><option>100g</option></select><button class="exit-change-btn unit">X</button>';
}


// search bar
const searchBar = document.getElementById("search-bar");

// elements used to collect user input to add a new item
const addNewItemBtn = document.getElementById("add-new-item");
const addNewItem = document.getElementById("add-new-item-dialog");
const newItemFormalName = document.getElementById("new-item-formal-name");
const newItemName = document.getElementById("new-item-name");
const newItemQuantity = document.getElementById("new-item-quantity");
const newItemUnit = document.getElementById("new-item-unit");
const newItemNormalPrice = document.getElementById("new-item-normal-price"); 
const newItemBestPrice = document.getElementById("new-item-best-price");
const createNewItemBtn = document.getElementById("add-new-item-btn");
const cancelNewItem = document.getElementById("cancel-btn");

// show warning when two items with same formal name are being created
const duplicateWarningDiv = document.getElementById("duplicate-entry-warning");
const createDuplicateItem = document.getElementById("confirm-duplicate-btn");
const cancelDuplicateItem = document.getElementById("cancel-duplicate-btn");


/// shows information about a selected item
const selectedItem = document.getElementById("selected-item");
const selectedItemChildren = document.querySelectorAll("#selected-item *");
// the elements in the div that shows information about a selected item
const title = document.querySelector("#selected-item h2");
const unitPriceHeading = document.querySelector("#price-per-heading label");
const generalName = document.getElementById("name");
const normalPrice = document.getElementById("normal-price");
const normalPriceNumber = document.querySelector("#normal-price label");
const bestPrice = document.getElementById("best-price");
const bestPriceNumber = document.querySelector("#best-price label");
const unitPrice = document.getElementById("unit-price");
const unitPriceNumber = document.querySelector("#unit-price label:first-of-type");
const unitPriceUnit = document.querySelector("#unit-price label:last-of-type");

// the buttons that are used to change information about an item
const changeNormalPriceButton = document.getElementById("normal-price-btn");
const changeBestPriceButton = document.getElementById("best-price-btn");
const changeUnitButton = document.getElementById("unit-btn");

// the divs that collect input from a user to change information about an item
const changeNormalPrice = document.getElementById("change-normal-price");
const changeBestPrice = document.getElementById("change-best-price");
const changeUnit = document.getElementById("change-unit");


for (const child of selectedItemChildren) {
    child.hidden = true;
}

// search bar
searchBar.addEventListener("change", () => {
    if (searchBar.value) {
        showItem(searchBar.value);
    }
})


// add new item button
addNewItemBtn.addEventListener("click", () => {
    addNewItem.showModal();
})


// officially create new item button
createNewItemBtn.addEventListener("click", () => {
    // makes sure user inputted values for all fields before creating a new item
    if (!newItemFormalName.value || !newItemName.value || !newItemQuantity.value || !newItemNormalPrice.value || !newItemBestPrice.value) {
        alert("All fields must be filled to create an item");
    } else {
        checkIfDuplicate(newItemFormalName.value, newItemName.value, newItemQuantity.value, newItemUnit.value, newItemNormalPrice.value, newItemBestPrice.value);
    }
})


// cancel add new item button
cancelNewItem.addEventListener("click", () => {
    clearAddNewItemField();
})



// button to change normal price of existing item
changeNormalPriceButton.addEventListener("click", () => {
    // shows space for user to change normal price
    changeNormalPrice.hidden = false;
    updateChangeDisplayField();

    const normalPriceExitBtn = document.querySelector("#change-normal-price .exit-change-btn");
    const normalPriceInput = document.querySelector("#change-normal-price label");
    // stops showing space to change normal price when user clicks exit button
    normalPriceExitBtn.addEventListener("click", () => {
        updateItem(title.textContent, "normalPrice", normalPriceInput.textContent);
        showItem(title.textContent);
        // normalPriceNumber.textContent = document.querySelector("#change-normal-price label").textContent;
        changeNormalPrice.hidden = true; 
    })
})


// button to change best price of existing item
changeBestPriceButton.addEventListener("click", () => {
    // shows space for user to change best price
    changeBestPrice.hidden = false;
    updateChangeDisplayField();

    const bestPriceExitBtn = document.querySelector("#change-best-price .exit-change-btn");
    const bestPriceInput = document.querySelector("#change-best-price label");
    // stops showing space to change best price when user clicks exit button
    bestPriceExitBtn.addEventListener("click", () => {
        updateItem(title.textContent, "bestPrice", bestPriceInput.textContent);
        showItem(title.textContent);
        changeBestPrice.hidden = true; 
    })

})


// button to change unit of existing item
changeUnitButton.addEventListener("click", () => {
    changeUnit.hidden = false;
    updateChangeUnit();
})



// display initial elements on screen
userItemOptions();
