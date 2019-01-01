#!/usr/bin/env node

const fs = require("fs");

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

// controller
const SET_POINT = 75;
const Controller = require("node-pid-controller");
const ctr = new Controller({
    k_p: 0.55,
    k_i: 465,
    k_d: 93
});

// main control loop
const control_loop = async function(prev_state) {
    let new_state = undefined;
    let temp = -1;

    try {
        // read temp
        const data = await bme280.readSensorData();
        temp = BME280.convertCelciusToFahrenheit(data.temperature_C);
        console.log(`temp: ${temp.toFixed(2)} °F`);

        // calculate new state
        ctr.setTarget(SET_POINT);
        const correction = ctr.update(temp);
        console.log(correction);
        new_state = correction > 0 ? true : false;

        // set heater state
      //new_state = calc_heater_state(prev_state, temp);
        await heater.set({set: new_state});
        log(prev_state, new_state, temp);
    } catch (err) {
        console.log(err);
        log(prev_state, new_state, temp, err);
    }

    // start over
    setTimeout(() => control_loop(new_state), 2500);
};

function log(prev_state, new_state, temp, err) {
    const fname = "thermostat_log.csv";

    function b(v) {
        if (v === true) return 1;
        if (v === false) return 0;
        return -1;
    }

    const error = err ? JSON.stringify(err) : "none";
    const str = `${(new Date()).toISOString()},${b(prev_state)},${b(new_state)},${temp},${SET_POINT},${error}\n`;

    if (!fs.existsSync(fname))
        fs.appendFileSync(fname, "timestamp,prev_state,new_state,temp,set_point,error\n");

    fs.appendFileSync(fname, str);
}

function calc_heater_state(state, temp) {
    // turn on heater
    if (!state && temp < (SET_POINT-0.01))
        return true;

    // turn off heater
    if (state && temp > (SET_POINT+0.01))
        return false;

    return state;
}

// init sensor and begin control loop
heater.get().then(state => {
    console.log("current heater state: " + state);
    bme280.init().then(() => control_loop(state));
});
