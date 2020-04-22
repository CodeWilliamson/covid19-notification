# COVID19 SMS Project

## Overview

This project currently is to enable the callback from SMS messages going out to COVID19 test clients who received negative results. This callback is designed to work with Twilio. This application is only a server-side process, there is no front end at this time.

This service is configured specifically to run with a SharePoint list as that is the master data source for lab results and client information.

The application runs on nodejs using express. Through routes in express, the app responds to 1 POST request to update the lab result list item in SharePoint to indicate that the client acknowledged the SMS message.

## Prerequisites

- Connected app credentials to SharePoint (client id and secret). This can be done directly through the site collection using the appregnew.aspx method or through Azure.
- SharePoint site with a list with the following structure
  - lab result list must have these columns: ClientFeedback (string), RelatedClient (lookup to related client list)
  - related client list with these columns: FirstName, LastName, PrimaryPhone

## Getting Started

1. Configure environment variables. Please see the .env.sample file for required variables.

2. Install npm modules: `npm install`

3. Run the server: `npm start`
