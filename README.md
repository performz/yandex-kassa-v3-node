# Yandex Kassa API Library

[![Version](https://img.shields.io/npm/v/yandex-kassa-v3.svg)](https://www.npmjs.org/package/yandex-kassa-v3)
[![Build Status](https://travis-ci.org/lodosstm/yandex-kassa-v3-node.svg?branch=master)](https://travis-ci.org/lodosstm/yandex-kassa-v3-node)
[![Downloads](https://img.shields.io/npm/dm/yandex-kassa-v3.svg)](https://www.npmjs.com/package/yandex-kassa-v3)
[![Try on RunKit](https://badge.runkitcdn.com/yandex-kassa-v3.svg)](https://runkit.com/npm/yandex-kassa-v3)


[Yandex.Kassa](https://kassa.yandex.ru/) - a universal solution for working with online payments. The Yandex.Kassa API
 is built on REST-principles, works with real objects and has predictable behavior. Using this API, you can send
 payment requests, save payment information for repeated charges (and include auto payments),
 make refunds and much more.

The API uses HTTP as the main protocol, which means it is suitable for development in any programming language that can 
work with HTTP libraries (for example, cURL). Authentication uses Basic Auth, so you can make your first request
directly from the browser.

The API supports POST and GET requests. POST requests use JSON arguments, GET requests work with query strings. 
The API always returns a response in JSON format, regardless of the type of request.

## Authentication

For HTTP authentication. In the request headers it is necessary to transfer:
- username - the identifier of your store in Yandex.Kassa;
- password - your secret key.

Release the secret key (as well as re-issue and delete the irrelevant) in the personal cabinet of Yandex.Kassa, in the
[Settings](https://money.yandex.ru/my/tunes) section.

Example request with authentication
```
$ curl https://payment.yandex.net/api/v3/payments/{payment_id} \
-u <Store ID>: <Secret key>
```
## Idempotency

In the context of the API, [idempotency](https://tools.ietf.org/html/rfc7231#section-4.2.2) means that multiple requests
are handled in the same way as one-time requests. This means that after receiving a repeated request with the same 
parameters, Yandex.Kassa will return the result of the original request (if the request is fulfilled) or the status in 
the processing (if the request is still executed) in response.


This behavior helps prevent unwanted repetition of transactions. For example, if there were problems with the network 
during the payment and the connection was interrupted, you can safely repeat the requested request an unlimited number 
of times. GET requests are by default idempotent, since they do not have undesirable consequences.

Example query with idempotence key
```
$ curl https://payment.yandex.net/api/v3/refunds \
  -X POST \
  -u <Store ID>: <Secret key> \
  -H 'Idempotence-Key: <Idempotence key>' \
  -H 'Content-Type: application / json' \
  -d '{
        "amount": {
          "value": "2.00",
          "currency": "RUB"
        },
        "payment_id": "215d8da0-000f-50be-b000-0003308c89be"
      } '
```
To ensure the idempotency of POST requests, the Idempotence-Key (or idempotence key) header is used.

How it works: 
if you repeat a query with the same data and the same key, the API treats it as a repeated one;
if the data in the request is the same, and the idempotency key is different, the request is executed as new.

In the Idempotence-Key header, you can pass any value unique to this operation on your side. We recommend using the 
V4 UUID.

Yandex.Kassa provides Idempotency within 24 hours after the first request, then a second request will be processed 
as new.


## Asynchrony

Each payment is a complex process in which several participants are involved. Transaction processing can take up to 
several seconds, so Yandex.Kassa processes requests asynchronously. This makes the API really productive and does not 
keep the connection open for a few seconds.

If Yandex.Kassa for some reason does not have time to process the request for the allotted time, the response comes in 
the HTTP code 202 and the object with processing type. To get the result, send the request again with the same data 
and the same Idempotence-Key. In the retry_after field, the API returns the number of milliseconds through which it is 
recommended to repeat the request.


Example of the body of the response, after which you need repeat the request
```
  {
    "type": "processing",
    "description": "Request accepted, but not processed yet. Retry again with the same Idempotence-Key",
    retry_after: 1800
  }
```
## Reference
[Yandex.Money API page](https://kassa.yandex.ru/docs/checkout-api/#api-yandex-kassy)

## Installation
```bash
npm install yandex-kassa-v3
```
## Getting started
The package needs to be configured with your account's secret key and shop identifier which you can create also recreate
and delete in personal area Yandex.Kassa in [Settings](https://money.yandex.ru/my/tunes). And 
[tutorial](https://yandex.ru/support/checkout/payments/keys.html) for creating secret key.
after you have secret key and shop identifier:
- Add dependency 'yandex-kassa-v3' in your package.json file.
- Require 'yandex-kassa-v3' in your app with shop identifier and secret key. You can use 2 variation:

##### first
```javascript
var yandexKassa = require('yandex-kassa-v3')('your_shopId', 'your_secretKey'); 
```

##### second
```javascript
var yandexKassa = require('yandex-kassa-v3')({ shopId: 'your_shopId', secretKey: 'your_secretKey' }); 
```

##### Also you can use another parameter for require:
- timeout(default = 120000)
- debug(default = false)
- host(default = 'https://payment.yandex.net')
- path(default = '/api/v3/')

##### For example:
```javascript
var yandexKassa = require('yandex-kassa-v3')({ shopId: 'your_shopId', secretKey: 'your_secretKey', timeout: 20000 }); 
```
### Examples

##### Payment creating
```javascript
var idempotenceKey = '02347fc4-a1f0-49db-807e-f0d67c2ed5a5';
YandexKassa.createPayment({
  'amount': {
    'value': '2.00',
    'currency': 'RUB'
  },
  'payment_method_data': {
    'type': 'bank_card'
  },
  'confirmation': {
    'type': 'redirect',
    'return_url': 'https://www.merchant-website.com/return_url'
  }
}, idempotenceKey)
  .then(function(result) {
    console.log({payment: result});
  })
  .catch(function(err) {
    console.error(err);
  })
```

##### Getting information about payment
```javascript
var paymentId  = '21966b95-000f-50bf-b000-0d78983bb5bc';
YandexKassa.getPaymentInfo(paymentId)
  .then(function(result) {
    console.log({payment: result});
  })
  .catch(function(err) {
    console.error(err);
  })
```



## Running Tests

To install the development dependencies (run where the package.json is):
```bash
$ npm install
```

Run the tests:
```bash
$ npm test
```