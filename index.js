const express = require("express");
const Client = require("./app");
const app = express();
const port = 3000;

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.get("/", async (req, res) => {
  const api = new Client({
    env: "UAT",
    merchantId: "PGTESTPAYUAT",

    apiKeys: {
      UAT: "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
      PROD: "4915c02d-e87b-47e3-b2fc-d56dbf65e387",
    },
  });

  const mobile = "7021652059";
  const apiKeyIndex = 1;
  const new_transaction_id = "shmooz" + mobile + Date.now();

  const amount = 100;

  // Run these one by one as they are async calls.

  /* api
    .qrcode(100, new_transaction_id, apiKeyIndex)
    .then(console.log, console.error);
   */

  const response = await api.charge(
    amount,
    new_transaction_id,
    mobile,
    apiKeyIndex
  );
  /* .then((phonePeRes) => {
      console.log(phonePeRes);
      if (phonePeRes.success) {
   
        console.log("providerReferenceId", phonePeRes.data.providerReferenceId);
      }
    }, console.error); */
  res.send(response.data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
