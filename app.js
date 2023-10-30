const { default: axios } = require("axios");
const endpoints = require("./endpoints");
const { encodeRequest, signRequest, request } = require("./helpers");

const CHARGE_ENDPOINT = "/pg/v1/pay";
const QRINIT_ENDPOINT = "/v3/qr/init";
const TRANSACTION_ENDPOINT = "/v3/transaction";
const REFUND_ENDPOINT = "/v3/credit/backToSource";
const PAYOUT_ENDPOINT = "/pg/v1/pay";

class Client {
  constructor(config) {
    this.env = config.env || "UAT";
    this.merchantId = config.merchantId || "unknown-merchant";

    this.apiKeys = config.apiKeys;
    this.hostname = "https://api-preprod.phonepe.com/apis/pg-sandbox";

    if (!this.apiKeys) {
      throw new Error("API keys missing");
    }
  }

  charge(amount, transactionId, mobile, apiKeyIndex) {
    const payload = {
      merchantId: this.merchantId, // 'M10HR1UHP5A8', //
      merchantTransactionId: transactionId,
      merchantUserId: "akash",
      amount: amount,
      redirectUrl: "https://webhook.site/redirect-url",
      redirectMode: "REDIRECT",
      callbackUrl: "https://webhook.site/callback-url",
      mobileNumber: mobile,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    console.log(transactionId);

    const saltKey = this.apiKeys[this.env];

    // 4915c02d-e87b-47e3-b2fc-d56dbf65e387`

    const base64 = encodeRequest(payload);
    const sign = `${base64}${PAYOUT_ENDPOINT}${saltKey}`;
    const X_VERIFY = `${signRequest(sign)}###${apiKeyIndex || 1}`;

    return axios.post(
      `${this.hostname}${PAYOUT_ENDPOINT}`,
      { request: base64 },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": X_VERIFY,
        },
        withCredentials: false,
      }
    );

    /*  return request(
      {
        method: "POST",
        hostname: endpoints[this.env] + CHARGE_ENDPOINT,
        //  path: CHARGE_ENDPOINT,
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": X_VERIFY,
        },
      },
      { request: base64 }
    ); */
  }

  qrcode(amount, transactionId, apiKeyIndex) {
    const payload = {
      amount: amount, // Amount in paise
      expiresIn: 180,
      merchantId: this.merchantId,
      merchantOrderId: transactionId,
      storeId: this.storeId,
      terminalId: this.terminalId,
      transactionId: transactionId,
      message: "Payment for " + transactionId,
    };

    const base64 = encodeRequest(payload);
    const sign = base64 + QRINIT_ENDPOINT + this.apiKeys[apiKeyIndex];
    const X_VERIFY = make_hash(sign) + "###" + apiKeyIndex;

    return request(
      {
        method: "POST",
        hostname: endpoints[this.env],
        path: QRINIT_ENDPOINT,
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": X_VERIFY,
        },
      },
      { request: base64 }
    );
  }

  status(transactionId, apiKeyIndex) {
    const endpoint =
      TRANSACTION_ENDPOINT +
      "/" +
      this.merchantId +
      "/" +
      transactionId +
      "/status";
    const sign = endpoint + this.apiKeys[apiKeyIndex];
    const X_VERIFY = make_hash(sign) + "###" + apiKeyIndex;

    return request({
      method: "GET",
      hostname: endpoints[this.env],
      path: endpoint,
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": X_VERIFY,
      },
    });
  }

  cancel(transactionId, apiKeyIndex) {
    const endpoint =
      CHARGE_ENDPOINT + "/" + this.merchantId + "/" + transactionId + "/cancel";
    const sign = endpoint + this.apiKeys[apiKeyIndex];
    const X_VERIFY = signRequest(sign) + "###" + apiKeyIndex;

    return request({
      method: "POST",
      hostname: endpoints[this.env],
      path: endpoint,
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": X_VERIFY,
      },
    });
  }

  refund(transactionId, providerReferenceId, apiKeyIndex) {
    const payload = {
      amount: 100,
      merchantId: this.merchantId,
      providerReferenceId: providerReferenceId,
      transactionId: transactionId + "_refund",
      message: "Refund",
    };

    const base64 = encodeRequest(payload);
    const sign = base64 + REFUND_ENDPOINT + this.apiKeys[apiKeyIndex];
    const X_VERIFY = signRequest(sign) + "###" + apiKeyIndex;

    /* 
    return request(
      {
        method: "POST",
        hostname: endpoints[this.env],
        path: REFUND_ENDPOINT,
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": X_VERIFY,
        },
      },
      { request: base64_payload }
    ); */
  }
}

module.exports = Client;
