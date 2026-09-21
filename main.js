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


if (!localStorage.getItem("Data")) {
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


// reurns how many items the user has in their data
const getUserItemsLength = function() {
    const userItems = getUserItems();
    return Object.keys(userItems).length;
}



// formats numbers to always end with two decimal places
const formatNumber = function(number) {
    number = Math.round(number*100) / 100;
    let numberString = String(number);
    if (!numberString.includes(".")) {
        return `${numberString}.00`;
    } else if (numberString.indexOf(".") === numberString.length - 2) {
        return `${numberString}0`;
    }
    return number;
}


// localStorage.clear();
// const ob = {};
// localStorage.setItem("Data", JSON.stringify(ob));

/*
===== PARAMETERS =====
price: the best price of an item
quantity: the amount in the package
unit: is the quantity measured in grams, kilograms, or pounds?
----------------------
returns price per pound or price per 100 grams, depending on the unit
*/
const calculatePricePerUnit = function(price, quantity, unit) {
    price = Number(price);
    quantity = Number(quantity);
    if (unit === "lbs") {
        return formatNumber(price / quantity);
    } else if (unit === "kg") {
        return formatNumber(price / (quantity * 10));
    } else if (unit === "g") {
        return formatNumber(price / (quantity / 100));
    } else
        return "N/A";
}


// format for object that stores an item's data
const generateNewItem = function(formalName, name, quantity, unit, normalPrice, bestPrice, ) {
    return {formalName: formalName, name: name, quantity: quantity, unit: unit, normalPrice: formatNumber(normalPrice), bestPrice: formatNumber(bestPrice), unitPrice: calculatePricePerUnit(bestPrice, quantity, unit)};
}


const addNewItemToData = function(formalName, name, quantity, unit, normalPrice, bestPrice) {
    const newItem = generateNewItem(formalName, name, quantity, unit, normalPrice, bestPrice);
    let userItems = getUserItems();
    

    if (typeof userItems === "string") {
        userItems = {};
    }
    
    // adds new item to user's local storage
    userItems[formalName] = newItem;
    updateUserItems(userItems);
}


// clears values inputted to create new item
const clearAddNewItemField = function() {
    const inputs = document.querySelectorAll("dialog input");
    for (const input of inputs) {
        input.value = "";
    }
}


// shows all of the user's items in the search bar
const userItemOptions = function() {
    const userItems = getUserItems();
    const userItemsLength = getUserItemsLength();
    // resets search bar's content
    searchBar.innerHTML = "<option></option>";

    // displays the name of each item in the search bar
    for (const key of Object.keys(userItems)) {
        searchBar.innerHTML += `<option>${userItems[key].formalName}</option>`
    }
} 



// shows information for a selected item
const showItem = function(formalItemName) {
    const userItems = getUserItems();
    const selectedItem = userItems[formalItemName];
    console.log(selectedItem);

    title.textContent = selectedItem.formalName;
    if (selectedItem.unit !== "g") {
        unitPriceHeading.textContent = selectedItem.unit;
        unitPriceUnit.textContent = selectedItem.unit;
    } else {
        unitPriceHeading.textContent = "100g";
        unitPriceUnit.textContent = "100g";
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
const addNewItem = document.querySelector("dialog");
const newItemFormalName = document.getElementById("new-item-formal-name");
const newItemName = document.getElementById("new-item-name");
const newItemQuantity = document.getElementById("new-item-quantity");
const newItemUnit = document.getElementById("new-item-unit");
const newItemNormalPrice = document.getElementById("new-item-normal-price"); 
const newItemBestPrice = document.getElementById("new-item-best-price");
const createNewItemBtn = document.getElementById("add-new-item-btn");
const cancelNewItem = document.getElementById("cancel-btn");

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
        addNewItemToData(newItemFormalName.value, newItemName.value, newItemQuantity.value, newItemUnit.value, newItemNormalPrice.value, newItemBestPrice.value);
        addNewItem.close();
        clearAddNewItemField();
        userItemOptions();
    }
    
})


// cancel add new item button
cancelNewItem.addEventListener("click", () => {
    addNewItem.close();
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
