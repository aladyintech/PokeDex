// pokemonRepository function (IIFE)
let pokemonRepository = (function () {
  // the first object ( pokemonList[0] ) is used as validation for the 'addv()' method
  let pokemonList = [];

  function loadList() {
    let apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=150";
    showLoadingMessage();

    return fetch(apiUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        json.results.forEach(function (item) {
          let pokemon = {
            name: capitalizeFirstLetter(item.name),
            detailsUrl: item.url,
          };
          add(pokemon);
        });

        hideLoadingMessage();
      })
      .catch(function (e) {
        console.error(e);
        hideLoadingMessage();
      });
  }

  // fetches details from an object with a "detailsUrl"
  function loadDetails(item) {
    let url = item.detailsUrl;

    showLoadingMessage();

    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (details) {
        // now add details to the item
        item.imageUrl = details.sprites.front_default;
        item.height = details.height;
        item.types = details.types;

        hideLoadingMessage();
      })
      .catch(function (e) {
        console.error(e);
        hideLoadingMessage();
      });
  }

  function showDetails(pokemon, e) {
    loadDetails(pokemon)
      .then(function () {
        showModal(pokemon, e);
      })
      .catch(function () {
        console.log(`failed to show ${pokemon}`);
      });
  }

  function showModal(pokemon, e) {
    let modal = document.querySelector(".modal");
    let clickedButton = e.target;
    modal.classList.add("show");
    modal.classList.remove("hide");

    // counting the number of pokemon that have been clicked and setting nav totalizer
    clickedButton.dataset.isClicked = true;
    let navTotalizer = document.querySelector("#navTotalizer");

    let totalPokemon = document.querySelectorAll(
      '[data-is-clicked="true"]'
    ).length;
    navTotalizer.innerText = totalPokemon;

    // add modal content
    let closeButtonElement = document.querySelector("button.close");
    closeButtonElement.addEventListener("click", hideModal);

    let titleElement = document.querySelector(".modal-title");
    let capitalizedName = capitalizeFirstLetter(pokemon.name);
    titleElement.innerText = capitalizedName;

    let imgElement = document.querySelector(".modalImg");
    imgElement.src = pokemon.imageUrl;

    let modalBody = document.querySelector(".modal-body");
    let phraseHeightString = phraseHeight(pokemon.height);
    let firstType = pokemon.types[0].type.name;
    modalBody.innerHTML = `
      <b>Height: </b>${pokemon.height}
      <p><em>${phraseHeightString}</em></p>
      <b>Type: </b> ${capitalizeFirstLetter(firstType)}`;

    let modalContent = document.querySelector(".modal-content");
    modalContent.classList.add(firstType);
    clickedButton.classList.add(firstType, "borderW-3px");

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("show")) {
        hideModal();
      }
    });

    modal.addEventListener("click", (e) => {
      let target = e.target;
      if (target === modal) {
        hideModal();
      }
    });
  }

  function hideModal() {
    let modalContainer = document.querySelector(".modal");
    modalContainer.classList.remove("show");
    modalContainer.classList.add("hide");

    let modalContent = document.querySelector(".modal-content");

    // this takes off the pokemon type class
    modalContent.setAttribute("class", "modal-content");
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function addListItem(pokemon) {
    let listItem = document.createElement("li");
    let button = document.createElement("button");

    listItem.classList.add(
      "group-list-item",
      "row",
      "justify-content-center",
      "mb-2"
    );
    button.innerText = `${pokemon.name}`;
    button.classList.add("poke", "btn", "btn-light", "col-12", "col-lg-6");
    button.addEventListener("click", function (e) {
      showDetails(pokemon, e);
    });

    listItem.appendChild(button);
    button.setAttribute("data-target", ".modal");
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-is-clicked", "false");
    document.querySelector(".pokemon-list").appendChild(listItem);
  }

  // pushes a pokemon object with validated key names to the pokemonList array
  function add(pokemon) {
    if (
      typeof pokemon === "object" &&
      "name" in pokemon &&
      "detailsUrl" in pokemon
    ) {
      pokemonList.push(pokemon);
    } else {
      console.log(`failed to add ${pokemon}`);
    }
  }

  // returns the pokemonList array
  function getAll() {
    return pokemonList;
  }

  function showLoadingMessage() {
    let element = document.createElement("div");

    element.classList.add("loading-message");
    element.innerText = "Rounding up those pesky Pokemon...";
    document.querySelector("ul.pokemon-list").appendChild(element);
  }

  function hideLoadingMessage() {
    let element = document.querySelector("div.loading-message");
    document.querySelector("ul.pokemon-list").removeChild(element);
  }

  // evaluates the height and returns a string
  function phraseHeight(height) {
    let phrase;

    if (height >= 12) {
      phrase = "This thing's HUGE! O_O";
    } else if (height < 12 && height >= 8) {
      phrase = "That ain't small o_o";
    } else if (height < 8 && height >= 4) {
      phrase = "Kind of a shorty -_-";
    } else {
      phrase = "What a tiny little Pokemon! ^o^";
    }

    return phrase;
  }

  // ! -- only the things in this returned object are accessible outside the scope of this function
  return {
    add: add,
    getAll: getAll,
    addListItem: addListItem,
    phraseHeight: phraseHeight,
    showDetails: showDetails,
    loadList: loadList,
    loadDetails: loadDetails,
    showLoadingMessage: showLoadingMessage,
  };
})();

pokemonRepository.loadList().then(function () {
  //data loaded in from API
  pokemonRepository.getAll().forEach(function (pokemon) {
    pokemonRepository.addListItem(pokemon);
  });
});
