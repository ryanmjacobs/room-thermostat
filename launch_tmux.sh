#!/bin/bash

sesh="room-thermostat"
cd /home/ryan/room-thermostat

run() { tmux send-keys -t $sesh "$1" Enter;}
create() { tmux new-window -t $sesh; run "$1";}
tmux new -d -s $sesh

run 'while true; do ./app.js; sleep 1; done'
