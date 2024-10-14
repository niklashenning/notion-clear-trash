
let clearTrashButton;


window.onload = function() {
    const callback = function(mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
                if (mutation.target.classList.contains("notion-overlay-container")
                    && mutation.target.classList.contains("notion-default-overlay-container")) {
                    addClearTrashButton();
                }
            }
        }
    };

    const observerConfig = { 
        childList: true,
        subtree: true
    };

    const observer = new MutationObserver(callback);
    observer.observe(document.body, observerConfig);
};


function addClearTrashButton() {
    let trashMenu = document.getElementsByClassName("notion-sidebar-trash-menu")[0];

    if (trashMenu && !document.getElementById("clear-trash-button")) {
        let searchDiv = trashMenu.children[0].children[0].children[0];
        clearTrashButton = document.createElement("button");
        clearTrashButton.innerHTML = "Clear Trash";
        clearTrashButton.id = "clear-trash-button";
        clearTrashButton.onclick = clearTrash;
        searchDiv.appendChild(clearTrashButton);
    }
}


async function clearTrash() {
    clearTrashButton.disabled = true;
    clearTrashButton.innerHTML = "Clearing..";

    let spaceId = await getSpaceId();
    let trashCleared = false;

    while (!trashCleared) {
        let trashedBlocks = await getTrashedBlocks(spaceId);
        deleteTrashedBlocks(spaceId, trashedBlocks);   
        
        if (trashedBlocks.length < BLOCK_LIMIT) {
            trashCleared = true;

            setTimeout(function() {
                clearTrashButton.disabled = false;
                clearTrashButton.innerHTML = "Clear Trash";
            }, 1000);
        }
    }
}
