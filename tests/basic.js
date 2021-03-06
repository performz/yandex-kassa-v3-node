var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var responses = require('./successResponses');
var errorResponse = require('./errorResponses');
var YandexKassa = require('../lib/index')({ shopId: 'your_shop_id', secretKey: 'your_secret_key' });

var idempotenceKey = 1;
var paymentInfo = {
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
};

var infoWithoutConfirm = {
  'amount': {
    'value': '2.00',
    'currency': 'RUB'
  },
  'payment_method_data': {
    'type': 'bank_card'
  }
};

describe('Test all functionality', function () {
  describe('Tests for creating payment', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_createPayment').resolves(responses.responseForCreate);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.createPayment(paymentInfo, idempotenceKey);
    });

    describe('Creating payment', function () {
      it('should success create new payment', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('status');
          expect(data).to.have.property('payment_method');
          expect(data).to.have.property('recipient');
          done();
        })
      });
    });
  });

  describe('Tests for get information about payment', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_getPaymentInfo').resolves(responses.responseForGetInfo);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.getPayment(responses.responseForCreate.id);

      return;
    });

    describe('Get info about payment by id', function () {
      it('should return information about payment', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('status');
          expect(data).to.have.property('paid');
          expect(data).to.have.property('payment_method');
          expect(data).to.have.property('recipient');
          done();
        })
      })
    });
  });

  describe('Tests for payment confirm', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_capturePayment').resolves(responses.responseForConfirmPayment);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.capturePayment(responses.responseForCreate.id,
        {
          value: '2.00',
          currency: 'RUB'
        }, idempotenceKey);

      return;
    });

    describe('Confirmation payment', function () {
      it('should return information about success confirmed payment', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('status');
          expect(data).to.have.property('paid');
          expect(data.paid).to.equal(true);
          expect(data).to.have.property('payment_method');
          expect(data).to.have.property('recipient');
          done();
        })
      })
    });
  });

  describe('Tests for cancel payment', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_cancelPayment').resolves(responses.responseForCancelPayment);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.cancelPayment(responses.responseForCreate.id, idempotenceKey);

      return;
    });

    describe('Cancel payment', function () {
      it('should return information about canceled payment', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('status');
          expect(data).to.have.property('paid');
          expect(data.status).to.equal('canceled');
          expect(data).to.have.property('payment_method');
          expect(data).to.have.property('recipient');
          done();
        })
      })
    });
  });

  describe('Tests create refund', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_createRefund').resolves(responses.responseForRefundCreateAndGet);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.createRefund(responses.responseForCreate.id,
        {
          value: '2.00',
          currency: 'RUB'
        }, idempotenceKey);

      return;
    });

    describe('Creating refund', function () {
      it('should return information about success created payment', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('status');
          expect(data).to.have.property('amount');
          expect(data.status).to.equal("succeeded");
          expect(data).to.have.property('payment_id');
          done();
        })
      })
    });
  });

  describe('Tests for get information about refund', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_getRefundInfo').resolves(responses.responseForRefundCreateAndGet);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.getRefund(responses.responseForRefundCreateAndGet.id, idempotenceKey);

      return;
    });

    describe('Get info about refund', function () {
      it('should return information about refund', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('amount');
          expect(data).to.have.property('status');
          expect(data).to.have.property('payment_id');
          done();
        })
      })
    });
  });

  describe('failed creating payment with authentication error', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_createPayment').resolves(errorResponse.authenticationFailed);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.createPayment(paymentInfo, idempotenceKey);

      return;
    });

    describe('failed creating payment', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('description');
          expect(data).to.have.property('code');
          expect(data.code).to.equal('invalid_credentials');
          expect(data.description).to.equal('Basic authentication failed');
          done();
        })
      })
    });
  });

  describe('Tests for get information about payment with error', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_getPaymentInfo').resolves(errorResponse.paymentNotFound);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.getPayment(responses.responseForRefundCreateAndGet.id);

      return;
    });

    describe('Get info about payment by id', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('description');
          expect(data).to.have.property('code');
          expect(data.code).to.equal('not_found');
          expect(data.description).to.equal('Payment not found or forbidden');
          done();
        })
      })
    });
  });

  describe('Tests for get information about refund with error', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_getRefundInfo').resolves(errorResponse.refundNotFound);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.getRefund(responses.responseForCreate.id);

      return;
    });

    describe('Get info about refund by id', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('description');
          expect(data).to.have.property('code');
          expect(data.code).to.equal('not_found');
          expect(data.description).to.equal('Refund not found or forbidden');
          done();
        })
      })
    });
  });

  describe('Tests for create payment without idempotence key', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_createPayment').resolves(errorResponse.emptyIdempotenceKey);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.createPayment(paymentInfo);

      return;
    });

    describe('failed creating payment without idempotence key', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_request');
          expect(data.description).to.equal('Idempotence key is empty');
          done();
        })
      })
    });
  });

  describe('Tests for create refund without idempotence key', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_createRefund').resolves(errorResponse.emptyIdempotenceKey);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.createRefund(paymentInfo);

      return;
    });

    describe('failed creating refund without idempotence key', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_request');
          expect(data.description).to.equal('Idempotence key is empty');
          done();
        })
      })
    });
  });

  describe('Tests for capture payment without idempotence key', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_capturePayment').resolves(errorResponse.emptyIdempotenceKey);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.capturePayment(paymentInfo);

      return;
    });

    describe('failed capture payment', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_request');
          expect(data.description).to.equal('Idempotence key is empty');
          done();
        })
      })
    });
  });

  describe('Tests for cancel payment without idempotence key', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_cancelPayment').resolves(errorResponse.emptyIdempotenceKey);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.cancelPayment(paymentInfo);

      return;
    });

    describe('failed cancel payment', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_request');
          expect(data.description).to.equal('Idempotence key is empty');
          done();
        })
      })
    });
  });
  
  describe('Tests for create payment with duplicate of idempotence key', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_createPayment').resolves(errorResponse.duplicateIdempotenceKey);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.createPayment(paymentInfo);

      return;
    });

    describe('failed creating payment with duplicate of idempotence key', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_request');
          expect(data.description).to.equal('Idempotence key duplicated');
          done();
        })
      })
    });
  });

  describe('Tests for create refund with duplicate of idempotence key', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_createRefund').resolves(errorResponse.duplicateIdempotenceKey);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.createRefund(paymentInfo);

      return;
    });

    describe('failed creating payment with duplicate of idempotence key', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_request');
          expect(data.description).to.equal('Idempotence key duplicated');
          done();
        })
      })
    });
  });

  describe('Tests for capture payment with duplicate of idempotence key', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_capturePayment').resolves(errorResponse.duplicateIdempotenceKey);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.capturePayment(paymentInfo);

      return;
    });

    describe('failed capture payment', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_request');
          expect(data.description).to.equal('Idempotence key duplicated');
          done();
        })
      })
    });
  });

  describe('Tests for cancel payment without idempotence key', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_cancelPayment').resolves(errorResponse.duplicateIdempotenceKey);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.cancelPayment(paymentInfo);

      return;
    });

    describe('failed cancel payment', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_request');
          expect(data.description).to.equal('Idempotence key duplicated');
          done();
        })
      })
    });
  });

  describe('Tests for create payment without confirmation info', function () {
    var test;
    var stub;

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_createPayment').resolves(errorResponse.missingConfirmType);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = YandexKassa.createPayment(infoWithoutConfirm, idempotenceKey);

      return;
    });

    describe('failed creating payment', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_request');
          expect(data.description).to.equal('Missing confirmation type for payment method type: bank_card');
          done();
        })
      })
    });
  });

  describe('Tests for authentication fail', function () {
    var test;
    var stub;
    var failYandexKassa = require('../lib/index')('your_shop_id', 'your_secret_key');

    before(function () {
      stub = sinon.stub(YandexKassa.__proto__, '_getPaymentInfo').resolves(errorResponse.authenticationFailed);
    });

    after(function () {
      stub.restore();
    });

    before(function () {
      test = failYandexKassa.getPayment(responses.responseForGetInfo.id);

      return;
    });

    describe('failed creating payment', function () {
      it('should return error', function (done) {
        test.then(function (data) {
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data).to.have.property('type');
          expect(data).to.have.property('code');
          expect(data).to.have.property('description');
          expect(data.code).to.equal('invalid_credentials');
          expect(data.description).to.equal('Basic authentication failed');
          done();
        })
      })
    });
  });
});
