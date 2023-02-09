// Get the textarea and the list
let input = document.getElementById("question-input");
let autocompleteList = document.getElementById("commandAutocompleteList");
// Get the dynamic list of strings
let stringList = ["apple", "banana", "cherry", "date", "elderberry"];

// Listen for input changes
input.addEventListener("input", function () {
  // Clear the list
  while (autocompleteList.firstChild) {
    autocompleteList.removeChild(autocompleteList.firstChild);
  }
  // Get the input value
  let inputValue = input.value;
  // Filter the list based on the input value
  let filteredList = stringList.filter(function (string) {
    return (
      string.substr(0, inputValue.length).toLowerCase() ===
      inputValue.toLowerCase()
    );
  });
  filteredList.reverse();
  // Populate the autocomplete list with filtered items
  for (let i = 0; i < filteredList.length; i++) {
    let item = document.createElement("div");
    item.innerHTML = filteredList[i];
    autocompleteList.appendChild(item);
  }
});

// Listen for clicks on the textarea
input.addEventListener("click", function () {
  // Clear the list
  while (autocompleteList.firstChild) {
    autocompleteList.removeChild(autocompleteList.firstChild);
  }
  // Get the input value
  let inputValue = input.value;
  // Filter the list based on the input value
  let filteredList = stringList.filter(function (string) {
    return (
      string.substr(0, inputValue.length).toLowerCase() ===
      inputValue.toLowerCase()
    );
  });

  // Populate the autocomplete list with filtered items
  for (let i = 0; i < filteredList.length; i++) {
    let item = document.createElement("div");
    item.innerHTML = filteredList[i];
    autocompleteList.appendChild(item);
  }
});

// Listen for item clicks
autocompleteList.addEventListener("click", function (event) {
  // Add the clicked item to the textarea
  input.value = event.target.innerHTML;

  // Clear the list
  while (autocompleteList.firstChild) {
    autocompleteList.removeChild(autocompleteList.firstChild);
  }
});
