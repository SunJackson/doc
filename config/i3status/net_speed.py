#!/bin/env python36

import time
import datetime

# 单位换算
def unit_conversion(byte):
    byte = int(byte)

    res = byte / 1024
    if res < 1000:
        res = float(round(res, 2))
        return str(res) + 'k'
    elif res < 1000 * 1024:
        res = res / 1024
        res = float(round(res, 2))
        return str(res) + 'm'
    else:
        res = res / (1024 * 1024)
        res = float(round(res, 2))
        return str(res) + 'g'


def get_net_data(netdev):
    with open('/proc/net/dev', 'r') as f:
        for line in f:
            if line.find(netdev) >= 0:
                receive = line.split(':')[1].split()[0]
                transmit = line.split(':')[1].split()[8]
                return float(receive), float(transmit)


def speed_monitor(netdev):
    receive_old = 0
    transmit_old = 0
    time_old = datetime.datetime.now()
    while True:
        receive, transmit = get_net_data(netdev)
        nowtime = datetime.datetime.now()
        time_s = (nowtime - time_old).seconds
        if time_s:
            receive_speed = '↓' + str(unit_conversion((receive - receive_old) / time_s)) + '/s'
            transmit_speed = '↑' + str(unit_conversion((transmit - transmit_old) / time_s)) + '/s'

            transmit_old = transmit
            receive_old = receive
            print(transmit_speed, receive_speed, time_s)
        time_old = nowtime




if __name__ == "__main__":

    receive, transmit = get_net_data('enp2s0')
    print(unit_conversion(receive))
    print(unit_conversion(transmit))
    speed_monitor('enp2s0')

