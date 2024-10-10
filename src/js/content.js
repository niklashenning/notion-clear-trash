
const pageLimit = 20;


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

    if (trashMenu && !trashMenu.querySelector("#clear-trash-button")) {
        let searchDiv = trashMenu.children[0].children[0].children[0];
        let button = document.createElement("button");
        button.innerHTML = "Clear Trash";
        button.id = "clear-trash-button";
        button.onclick = clearTrash;
        searchDiv.appendChild(button);
    }
}


async function clearTrash() {
    let spaceId = await getSpaceId();
    let trashCleared = false;

    while (!trashCleared) {
        let trashedPages = await getTrashedPages(spaceId);

        for (let i = 0; i < trashedPages.length; i++) {
            deleteTrashedPage(spaceId, trashedPages[i]);   
        }
        
        if (trashedPages.length < pageLimit) {
            trashCleared = true;
        }
    }
}


async function getSpaceId() {
    let apiEndpoint = "https://www.notion.so/api/v3/loadUserContent";
    let options = {
        headers: {
            "cache-control": "no-cache",
            "content-type": "application/json",
        },
        method: "POST",
        body: "{}"
    }

    let response = await fetch(apiEndpoint, options);
    let json = await response.json();
    return Object.keys(json.recordMap.space)[0];
};


async function getTrashedPages(spaceId) {
    let apiEndpoint = "https://www.notion.so/api/v3/search";
    let options = {
        headers: {
            "cache-control": "no-cache",
            "content-type": "application/json",
        },
        method: "POST",
        body: `
            {
                "type": "BlocksInSpace",
                "spaceId": "` + spaceId + `",
                "limit": ` + pageLimit + `,
                "filters": {
                    "isDeletedOnly": true,
                    "excludeTemplates": false,
                    "navigableBlockContentOnly": false,
                    "requireEditPermissions": false,
                    "includePublicPagesWithoutExplicitAccess": false,
                    "ancestors": [],
                    "createdBy": [],
                    "editedBy": [],
                    "lastEditedTime": {},
                    "createdTime": {},
                    "inTeams": []
                },
                "sort": {
                    "field": "relevance"
                },
                "source": "trash",
                "searchExperimentOverrides": {}
            }
        `
    }

    let response = await fetch(apiEndpoint, options);
    let json = await response.json();
    return json.results.map(object => object.id);
}


async function deleteTrashedPage(spaceId, pageId) {
    let apiEndpoint = "https://www.notion.so/api/v3/deleteBlocks";
    let options = {
        headers: {
            "cache-control": "no-cache",
            "content-type": "application/json",
        },
        method: "POST",
        body: `
            {
                "blocks": [
                    {
                        "id": "` + pageId + `",
                        "spaceId": "` + spaceId + `"
                    }
                ],
                "permanentlyDelete": true
            }
        `
    }
    fetch(apiEndpoint, options);
}
