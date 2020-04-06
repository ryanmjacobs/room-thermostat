require "json"
require "socket"
require "ipaddr"
require "colorize"

def netcolor(addr)
    return :red    if addr.map{|x| x.start_with?("192.168.")}.any?
    return :yellow if addr.map{|x| x.start_with?("10.0.1")}.any?
    return :blue
end
 
BIND_ADDR = "0.0.0.0"
MULTICAST_ADDR = "224.4.4.4"
PORT = 31001
socket = UDPSocket.new
membership = IPAddr.new(MULTICAST_ADDR).hton + IPAddr.new(BIND_ADDR).hton
socket.setsockopt(:IPPROTO_IP, :IP_ADD_MEMBERSHIP, membership)
socket.setsockopt(:SOL_SOCKET, :SO_REUSEPORT, 1)
socket.bind(BIND_ADDR, PORT)

while true do
    begin
        data = socket.recvfrom(32768)[0]
        jd   = JSON.parse(data)
        addr = jd["addr"]
            .filter{|x| x["ifname"] != "lo" && !x["ifname"].start_with?("docker") && x["operstate"] != "DOWN" && x["addr_info"].length >= 1}
            .map{|x| x["addr_info"][0]["local"]}

        addr_color  = netcolor(addr)
        pretty_addr = addr.map{|x| x.ljust(16)}.join(",")
        puts "#{jd["hostname"].rjust(16).bold.colorize(addr_color)} - #{pretty_addr}"
    rescue
        puts jd
    end
    STDOUT.flush
end
