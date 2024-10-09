
window.onload = function() {
    getSpaceId().then(spaceId => {
        getTrashedPages(spaceId).then(trashedPages => { 
            for (let i = 0; i < trashedPages.length; i++) {
                deleteTrashedPage(spaceId, trashedPages[i]);   
            }
        });
    });
};


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
                "limit": 20,
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
