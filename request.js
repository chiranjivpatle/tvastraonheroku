const Vonage = require('@vonage/server-sdk');
const vonage = new Vonage({
  apiKey: "68c85fe8",
  apiSecret: "jSJ5Ky90Qq0JntOT"
});

vonage.verify.request({
    number: "918806324339",
    brand: "Vonage"
  }, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      const verifyRequestId = result.request_id;
      console.log('request_id', verifyRequestId);
    }
  });

  vonage.verify.check({
    request_id: REQUEST_ID,
    code: CODE
  }, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
    }
  });

  vonage.verify.control({
    request_id: REQUEST_ID,
    cmd: 'cancel'
  }, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
    }
  });