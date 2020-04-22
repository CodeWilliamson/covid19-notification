const NodeCache = require( "node-cache" );
const sharepointCache = new NodeCache();
const fetch = require('node-fetch');

/**
 * Gets a new access token from SharePoint
 *
 * @returns SharePoint access_token
 */
async function getNewAccessToken(){
    const body = `client_id=${process.env.sharepoint_clientid}@${process.env.sharepoint_tenantid}&client_secret=${encodeURIComponent(process.env.sharepoint_secret)}&grant_type=client_credentials&resource=${process.env.sharepoint_resourceid}@${process.env.sharepoint_tenantid}`;
    let response = await fetch(process.env.sharepoint_oauth_token_url, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded'} });
    let responseJSON = await response.json();
    sharepointCache.set('accessToken', responseJSON.access_token, responseJSON.expires_in - 600);
    return responseJSON.access_token;
}

/**
 * Gets SharePoint token from cache if one exists or requests a NEW one
 *
 * @returns SharePoint access_token
 */
async function getAccessToken(){
    return sharepointCache.get('accessToken') || await getNewAccessToken();
}

/**
 * This function will update the SharePoint list item process status to Acknowledged
 * if the client phone number matches the phone number recorded in the lab result list item.
 *
 * @param {string} phone phone number sms message came from
 * @param {string} labResultId list item id
 * @returns Client first and last name
 */
function acknowledgeSMS(phone, labResultId){
    return new Promise(async (resolve, reject) => {
        try {
            const accessToken = await getAccessToken();
            // get lab result list item
            const getItemUrl = `${process.env.sharepoint_lab_results_list_uri}/items(${labResultId})?$select=RelatedClient/FirstName,RelatedClient/LastName,RelatedClient/PrimaryPhone&$expand=RelatedClient/FirstName,RelatedClient/LastName,RelatedClient/PrimaryPhone`;
            const getItemResponse = await fetch(getItemUrl, {headers: {Authorization: `Bearer ${accessToken}`, Accept: 'application/json'}});
            const labResultItem = await getItemResponse.json();

            if(labResultItem.RelatedClient && phone.replace(/\D/g,'').includes(labResultItem.RelatedClient.PrimaryPhone.replace(/\D/g,''))){
                const body = `{"ClientFeedback": "Acknowledged"}`;
                const updateItemUrl = `${process.env.sharepoint_lab_results_list_uri}/items(${labResultId})`;
                const updateResponse = await fetch(updateItemUrl, {method: 'POST', headers: {Authorization: `Bearer ${accessToken}`, Accept: 'application/json', 'Content-Type': 'application/json', 'X-HTTP-Method': 'MERGE', 'If-Match': '*', 'Content-Length': body.length}, 'body': body});
                if(updateResponse.ok){
                    resolve(labResultItem.RelatedClient.FirstName);
                }else{
                    const updateResult = await updateResponse.json();
                    reject(`Error updating lab result id ${labResultId}: ${updateResult['odata.error'] ? updateResult['odata.error'].message.value : 'something went wrong'}`);
                }
            }else if(labResultItem['odata.error']){
                reject(`Error fetching lab result id ${labResultId}: ${labResultItem['odata.error'].message.value}`);
            }else{
                reject(`SMS sender ${phone} does not match client for lab result id ${labResultId}`);
            }
        } catch (error) {
            reject(error.message);
        }
    });
}

module.exports.acknowledgeSMS = acknowledgeSMS;