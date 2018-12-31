#!/usr/bin/env node

const fs = require("fs");
const text = fs.readFileSync("thermostat_log.csv").toString();

const lines = text.split("\n");
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const fields = line.split(",");

    if (line.startsWith("2018"))
        continue;

    const epoch = fields[0] * 1000;
    const date = new Date(epoch);

    console.log(date.toISOString() + "," + fields.slice(1).join(","));
}
