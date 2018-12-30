#!/usr/bin/env node

const fs = require("fs");
const SET_POINT = 77;

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
const control_loop = async function(prev_state) {
    // read temp
    const data = await bme280.readSensorData();
    const temp = BME280.convertCelciusToFahrenheit(data.temperature_C);
    console.log(`temp: ${temp} °F`);

    // set heater state
    const new_state = calc_heater_state(prev_state, temp);
    heater.set({set: new_state});
    log(prev_state, new_state, temp);

    // start over
    setTimeout(() => control_loop(new_state), 1000);
};

function log(prev_state, new_state, temp) {
    const fname = "thermostate_log.csv";
    const str = `${(new Date()).getTime()/1000},${prev_state},${new_state},${temp}`;

    if (!fs.existsSync(fname))
        fs.appendFile(fname, "epoch,prev_state,next_state,temp");

    fs.appendFile(fname, str);
}

function calc_heater_state(state, temp) {
    // turn on heater if temp drops 2 degrees below SET_POINT
    if (!state && temp < (SET_POINT-2))
        return true;

    // turn off heater if temp has overshot SET_POINT by 1 degree
    if (state && temp > (SET_POINT+1))
        return false;
}

// init sensor and begin control loop
heater.get().then(state => {
    console.log("current heater state: " + state);
    bme280.init().then(() => control_loop(state));
});
