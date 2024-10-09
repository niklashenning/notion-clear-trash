
window.onload = function() {
    getSpaceId().then(spaceId => { 
        console.log(spaceId);
    });
};


async function getSpaceId() {
    let apiEndpoint = "https://www.notion.so/api/v3/loadUserContent";
    let options = {
        method: "POST",
        body: "{}"
    }

    let response = await fetch(apiEndpoint, options);
    let json = await response.json();
    return Object.keys(json.recordMap.space)[0];
};
