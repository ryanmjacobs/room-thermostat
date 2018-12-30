#!/usr/bin/env node

// wifi smart plug
const TuyAPI = require("tuyapi");
const heater = new TuyAPI({
    id: "012007015ccf7f6ae937",
    key: "3c01d5c38b319004",
    ip: "10.0.10.154"
});

// rpi temperature module
const BME280 = require("bme280-sensor");
const bme280 = new BME280({i2cBusNo: 1, i2cAddress: 0x76});

// main control loop
const control_loop = async function() {
    // read temp
    const data = await bme280.readSensorData();
    const temp = BME280.convertCelciusToFahrenheit(data.temperature_C);
    console.log(`temp: ${temp} °F`);

    // set heater state
    heater.set({set: temp < 78.7});

    // start over
    setTimeout(control_loop, 1000);
};

// init sensor and begin control loop
bme280.init().then(control_loop);
