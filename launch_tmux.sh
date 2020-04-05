#!/bin/bash

sesh="room-thermostat"
cd /home/ryan/room-thermostat

run() { tmux send-keys -t $sesh "$1" Enter;}
create() { tmux new-window -t $sesh; run "$1";}
tmux new -d -s $sesh

run 'while sleep 1; do source DUKELANA_PG_CRED; node sample.js; done'
create 'while sleep 1; do ruby ~/discovery/broadcast.rb; done'
