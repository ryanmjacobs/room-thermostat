#!/usr/bin/env node

const fs = require("fs");

// rpi temperature module
const BME280 = require("bme280-sensor");
const bme280 = new BME280({i2cBusNo: 1, i2cAddress: 0x76});

// database connection
const {Client} = require("pg");

async function insert_pg(bme_temp, cpu_temp) {
  const client = new Client();
  await client.connect();

  const query = "INSERT INTO dukelana_temperature_humidity_pressure (source, temperature_celsius) VALUES ($1, $2)";
  await client.query(query, ["porch-rpi-bme280", bme_temp]);
  await client.query(query, ["porch-rpi-cpu", cpu_temp]);

  await client.end()
}

function read_cpu_temp() {
	const text = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
	return parseInt(text) / 1000;
}

// main control loop
const control_loop = async function() {
    try {
        // read temp
        const data = await bme280.readSensorData();
        const bme_temp = data.temperature_C;
	const cpu_temp = read_cpu_temp();

        console.log(`bme_temp: ${bme_temp.toFixed(2)}, cpu_temp: ${cpu_temp.toFixed(2)}`);
	insert_pg(bme_temp, cpu_temp);
    } catch (err) {
        console.log(err);
    }

    // start over
    setTimeout(() => control_loop(), 60*1000);
};

bme280.init().then(() => control_loop()).catch(e=>console.log(e));
