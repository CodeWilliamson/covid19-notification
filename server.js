const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const constants = require('constants');

// App Config
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));

// ROUTES
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);
app.use('/', (req, res) => {
  res.status(404).send();
});

const port = process.env.port || 5000;

if(process.env.serverCertPath){
  let serverCertificate = fs.readFileSync(process.env.serverCertPath);
  let serverPrivateKey  = fs.readFileSync(process.env.serverKeyPath);
  let options = {key: serverPrivateKey, 
      cert: serverCertificate,
      secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
      ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384'};
  let httpsServer = https.createServer(options, app);
  httpsServer.listen(port);
  console.log(`App is listening with protocol HTTPS on port ${port}`);
}else{
  const server = http.createServer(app);
  server.listen(port);
  console.log(`App is listening with protocol HTTP on port ${port}`);
}