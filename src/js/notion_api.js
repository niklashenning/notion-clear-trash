
// After some testing, 1000 seems to be the limit per api call
const blockLimit = 1000;


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


async function getTrashedBlocks(spaceId) {
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
                "limit": ` + blockLimit + `,
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


async function deleteTrashedBlocks(spaceId, blockIds) {
    let blocks = blockIds.map(blockId => {
        return {
            id: blockId,
            space: spaceId
        };
    });
    let apiEndpoint = "https://www.notion.so/api/v3/deleteBlocks";
    let options = {
        headers: {
            "cache-control": "no-cache",
            "content-type": "application/json",
        },
        method: "POST",
        body: `
            {
                "blocks": ` + JSON.stringify(blocks) + `,
                "permanentlyDelete": true
            }
        `
    }

    fetch(apiEndpoint, options);
}
