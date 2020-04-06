#!/usr/bin/env ruby

require "json"
require "socket"

PORT = 31001
MULTICAST_ADDR = "224.4.4.4"

socket = UDPSocket.open
socket.setsockopt(:IPPROTO_IP, :IP_MULTICAST_TTL, 1)

loop do
    bcast_pkt = {}
    bcast_pkt["hostname"] = `hostname`.strip
    bcast_pkt["uptime"] = `uptime`.strip
    bcast_pkt["/proc/uptime"] = `cat /proc/uptime`.strip
    bcast_pkt["link"]  = JSON.parse(`ip -br -json link`)
    bcast_pkt["route"] = JSON.parse(`ip -br -json route`)
    bcast_pkt["addr"]  = JSON.parse(`ip -br -json addr`)

    puts bcast_pkt.to_json
    socket.send(bcast_pkt.to_json, 0, MULTICAST_ADDR, PORT)
    sleep 15
end
