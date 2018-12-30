#!/usr/bin/env node

const TuyAPI = require("tuyapi");

const device = new TuyAPI({
  id: '012007015ccf7f6ae937', key: '3c01d5c38b319004',
  ip: '10.0.10.154',
});

device.get().then(status => {
  console.log('Status:', status);

  device.set({set: !status}).then(result => {
    console.log('Result of setting status to ' + !status + ': ' + result);

    device.get().then(status => {
      console.log('New status:', status);
      return;
    });
  });
});
