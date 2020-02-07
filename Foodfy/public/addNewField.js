// Add new field 

function addIngredient() {
    const ingredients = document.querySelector("#ingredients");
    const fieldContainer = document.querySelectorAll(".ingredient");
    
    const newField = fieldContainer[fieldContainer.length - 1].cloneNode(
      true
    );
    
    if (newField.children[0].value == "") return false;
  
    newField.children[0].value = ""; 
    ingredients.appendChild(newField);
  }

  function addPreparation() {
    const ingredients = document.querySelector("#preparation");
    const fieldContainer = document.querySelectorAll(".preparation");
    
    // Realiza um clone do último ingrediente adicionado
    const newField = fieldContainer[fieldContainer.length - 1].cloneNode(
      true
    );
    
    // Não adiciona um novo input se o último tem um valor vazio
    if (newField.children[0].value == "") return false;
  
    // Deixa o valor do input vazio
    newField.children[0].value = ""; 
    ingredients.appendChild(newField);
  }

  document
  .querySelector(".add-ingredient")
  .addEventListener("click", addIngredient);
  
  document
  .querySelector(".add-preparation")
  .addEventListener("click", addPreparation);