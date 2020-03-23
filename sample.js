#!/usr/bin/env node

// rpi temperature module
const BME280 = require("bme280-sensor");
const bme280 = new BME280({i2cBusNo: 1, i2cAddress: 0x76});

// main control loop
const control_loop = async function(prev_state) {
    try {
        // read temp
        const data = await bme280.readSensorData();
        const temp = BME280.convertCelciusToFahrenheit(data.temperature_C);
        console.log(`temp: ${temp.toFixed(2)} °F`);
    } catch (err) {
        console.log(err);
    }

    // start over
    setTimeout(() => control_loop(new_state), 5000);
};
