#!/usr/bin/env ruby

require "json"
require "socket"

PORT = 31001

socket = UDPSocket.open
socket.setsockopt(Socket::SOL_SOCKET, Socket::SO_BROADCAST, true)

loop do
    bcast_pkt = {}
    bcast_pkt["hostname"] = `hostname`.strip
    bcast_pkt["uptime"] = `uptime`.strip
    bcast_pkt["/proc/uptime"] = `cat /proc/uptime`.strip
    bcast_pkt["link"]  = JSON.parse(`ip -br -json link`)
    bcast_pkt["route"] = JSON.parse(`ip -br -json route`)

    bcast_pkt["addr"]  = JSON.parse(`ip -br -json addr`).filter do |x|
        (x["ifname"].start_with?("e") || x["ifname"].start_with?("t"))
    end

    puts bcast_pkt.to_json
    socket.send(bcast_pkt.to_json, 0, "10.0.0.255",    PORT)
    socket.send(bcast_pkt.to_json, 0, "10.0.10.255",   PORT)
    socket.send(bcast_pkt.to_json, 0, "192.168.3.255", PORT)
    sleep 15
end
