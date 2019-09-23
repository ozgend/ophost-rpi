#! /bin/bash
service isc-dhcp-server stop
service hostapd stop
ifconfig wlan0 10.10.0.1 netmask 255.255.255.0 up
service isc-dhcp-server start
service hostapd start