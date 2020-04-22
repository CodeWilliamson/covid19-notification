const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const sharepoint = require('./../api/sharepoint');
var router = express.Router();

/**
 * This endpoint is for the Twilio web hook when a client sends a tet message.
 * Parameters MessagingServiceSid, MessageSid, From, Body MUST be present.
 * The main purpose of this endpoint is to record the clients acknowledgement in the SharePoint list item
 */
router.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();
    try {
        // is this request from twilio and with the correct parameters?
        const {MessagingServiceSid, MessageSid, From, Body} = req.body;
        if(MessagingServiceSid && MessagingServiceSid === process.env.twilio_MessagingServiceSid && MessageSid && From && Body) {
            sharepoint.acknowledgeSMS(From, Body)
            .then(result => {
                twiml.message(`Thank you ${result}, we have received your confirmation.`);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            }).catch(err => {
                console.error(`/sms - ${err.message || err}`);
                twiml.message(`Sorry we could not record your acknowledgement.`);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            });
        }else {
            console.error(`/sms - Missing required parameters: ${JSON.stringify(req.body)}`);
            res.status(500).send('Missing required parameters');
        }
    } catch (error) {
        console.error(`/sms - ${error.message || error}`);
        res.status(500).send(error.message);
    } 
});

router.get('/status', (req,res) => {
    res.status(200).send('online');
});

module.exports = router;