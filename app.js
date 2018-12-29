#!/usr/bin/env node

const TuyAPI = require("tuyapi");

const device = new TuyAPI({
  id: '03200329b4e62d002122', key: '79519e10bd62610d',
  ip: '192.168.0.14',
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
