// Wait for the DOM to completely load before we run our JS
document.addEventListener("DOMContentLoaded", (e) => {
  console.log("dom loaded!");

  const burgerContainer = document.querySelector(".burger-container");
  const burgerForm = document.getElementById("burger-form");

  // Inital burgers array
  let burgers = [];

  // Helper function to hide items
  const hide = (el) => {
    el.style.display = "none";
  };
  const show = (el) => {
    el.style.display = "inline";
  };

  // This function resets the burgers displayed with new burgers from the database
  const initializeRows = () => {
    burgerContainer.innerHTML = "";
    const rowsToAdd = [];
    for (let i = 0; i < burgers.length; i++) {
      rowsToAdd.push(createNewRow(burgers[i]));
    }

    rowsToAdd.forEach((row) => burgerContainer.prepend(row));
  };

  // Helper function to grab burgers
  const getBurgers = () => {
    fetch("/api/burgers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success in getting burgers:", data);
        burgers = data;
        initializeRows();
      });
  };

  getBurgers();

  // Helper function to delete a burger
  const deleteBurgers = (e) => {
    e.stopPropagation();
    const { id } = e.target.dataset;

    fetch(`/api/burgers/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(getBurgers);
  };

  // Function to handle the editing of a burger when input is clicked
  const editBurgers = (e) => {
    const itemChildren = e.target.children;
    // console.log('editBurgers -> itemChildren', itemChildren);
    for (let i = 0; i < itemChildren.length; i++) {
      const currentEl = itemChildren[i];

      if (currentEl.tagName === "INPUT") {
        currentEl.value = currentEl.parentElement.children[0].innerText;
        show(currentEl);
        currentEl.focus();
      }

      if (currentEl.tagName === "SPAN" || currentEl.tagName === "BUTTON") {
        hide(currentEl);
      }
    }
  };

  // Function to handle when a user cancels editing
  const cancelEdit = (e) => {
    const itemParent = e.target.parentElement;
    if (itemParent) {
      for (let i = 0; i < itemParent.children.length; i++) {
        const currentChild = itemParent.children[i];

        if (currentChild.tagName === "INPUT") {
          hide(currentChild);
        } else {
          show(currentChild);
        }
      }
    }
  };

  // Update a burger (PUT)
  const updateBurger = (burger) => {
    console.log("attempting to update with", burger);
    fetch("/api/burgers", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(burger),
    }).then((response) => console.log(response));
  };

  // Function to call when we are finished editing a burger
  const finishEdit = (e) => {
    if (e.keyCode === 13) {
      const itemParent = e.target.parentElement;
      const updatedBurger = {
        text: e.target.value.trim(),
        completed: false,
        id: e.target.dataset.id,
      };

      // Update the text in the dom
      itemParent.childNodes[0].innerText = updatedBurger.text;

      // Call on our helper function to preform a PUT request
      updateBurger(updatedBurger);

      if (itemParent) {
        for (let i = 0; i < itemParent.children.length; i++) {
          const currentChild = itemParent.children[i];

          if (currentChild.tagName === "INPUT") {
            hide(currentChild);
          } else {
            show(currentChild);
          }
        }
      }
    }
  };

  // Construct a burger-item row
  const createNewRow = (burger) => {
    // Containing row
    const newInputRow = document.createElement("li");
    newInputRow.classList.add("list-group-item", "burger-item");
    newInputRow.setAttribute("complete", burger.complete);

    // Span
    const rowSpan = document.createElement("span");
    rowSpan.innerText = burger.text;

    // Input field
    const rowInput = document.createElement("input");
    rowInput.setAttribute("type", "text");
    rowInput.classList.add("edit");
    rowInput.style.display = "none";

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.classList.add("delete", "btn", "btn-danger");
    delBtn.setAttribute("data-id", burger.id);
    rowInput.setAttribute("data-id", burger.id);
    delBtn.innerText = "x";
    delBtn.addEventListener("click", deleteBurgers);

    // Complete button
    const completeBtn = document.createElement("button");
    completeBtn.classList.add("complete", "btn", "btn-primary");
    completeBtn.innerText = "✓";
    completeBtn.setAttribute("data-id", burger.id);

    completeBtn.addEventListener("click", toggleSmashed);

    // Add event listener for editing
    newInputRow.addEventListener("click", editBurgers);
    rowInput.addEventListener("blur", cancelEdit);
    rowInput.addEventListener("keyup", finishEdit);

    // Append all items to the row
    newInputRow.appendChild(rowSpan);
    newInputRow.appendChild(rowInput);
    newInputRow.appendChild(delBtn);
    newInputRow.appendChild(completeBtn);

    if (burger.complete) {
      rowSpan.style.textDecoration = "line-through";
    }

    return newInputRow;
  };

  const toggleSmashed = (e) => {
    e.stopPropagation();
    const spanEl = e.target.parentNode.children[0];
    const currentBurger = {
      text: e.target.parentNode.children[0].innerText,
      complete: false,
      id: e.target.dataset.id,
    };
    currentBurger.complete = !currentBurger.complete;
    spanEl.style.textDecoration = "line-through";
    updateBurger(currentBurger);
    console.log("toggleSmashed -> currentBurger", currentBurger);
  };

  // Function to actually put the burger on the page
  const createBurger = (e) => {
    e.preventDefault();
    const burger = {
      text: document.getElementById("newBurger").value.trim(),
      complete: false,
    };
    if (burger.text) {
      fetch("/api/burgers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(burger),
      })
        .then((response) => response.json())
        .then(() => {
          document.getElementById("newBurger").value = "";
          getBurgers();
        });
    }
  };
  burgerForm.addEventListener("submit", createBurger);
});
