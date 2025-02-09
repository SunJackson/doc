#!/usr/bin/env python
# -*- coding: utf-8 -*-

# This script is a simple wrapper which prefixes each i3status line with custom
# information. It is a python reimplementation of:
# http://code.stapelberg.de/git/i3status/tree/contrib/wrapper.pl
#
# To use it, ensure your ~/.i3status.conf contains this line:
#     output_format = "i3bar"
# in the 'general' section.
# Then, in your ~/.i3/config, use:
#     status_command i3status | ~/i3status/contrib/wrapper.py
# In the 'bar' section.
#
# In its current version it will display the cpu frequency governor, but you
# are free to change it to display whatever you like, see the comment in the
# source code below.
#
# © 2012 Valentin Haenel <valentin.haenel@gmx.de>
#
# This program is free software. It comes without any warranty, to the extent
# permitted by applicable law. You can redistribute it and/or modify it under
# the terms of the Do What The Fuck You Want To Public License (WTFPL), Version
# 2, as published by Sam Hocevar. See http://sam.zoy.org/wtfpl/COPYING for more
# details.

import sys
import json
import time

'''
net-speed
'''
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


''' memory stat'''
def memory_stat():
    mem = {}
    f = open("/proc/meminfo")
    lines = f.readlines()
    f.close()
    for line in lines:
        if len(line) < 2: continue
        name = line.split(':')[0]
        var = line.split(':')[1].split()[0]
        mem[name] = int(var)
    mem['MemUsed'] = mem['MemTotal'] - mem['MemFree'] - mem['Buffers'] - mem['Cached']
    return mem


def print_line(message):
    """ Non-buffered printing to stdout. """
    sys.stdout.write(message + '\n')
    sys.stdout.flush()


def read_line():
    """ Interrupted respecting reader for stdin. """
    # try reading a line, removing any extra whitespace
    try:
        line = sys.stdin.readline().strip()
        # i3status sends EOF, or an empty line
        if not line:
            sys.exit(3)
        return line
    # exit on ctrl-c
    except KeyboardInterrupt:
        sys.exit()


if __name__ == '__main__':
    netdev = 'enp2s0'
    # Skip the first line which contains the version header.
    print_line(read_line())

    # The second line contains the start of the infinite array.
    print_line(read_line())

    while True:
        line, prefix = read_line(), ''
        # ignore comma at start of lines
        if line.startswith(','):
            line, prefix = line[1:], ','

        j = json.loads(line)

        mem = memory_stat()
        MemAvailablePer = mem['MemAvailable'] / mem['MemTotal'] * 100
        SwapAvailablePer = 100 - mem['SwapFree'] / mem['SwapTotal'] * 100
        RAM = '{}%'.format(round(100 - MemAvailablePer, 2))
        Swap = '{}%'.format(round(SwapAvailablePer, 2))

        # insert information into the start of the json, but could be anywhere
        # CHANGE THIS LINE TO INSERT SOMETHING ELSE
        if MemAvailablePer < 95.00:
            j.insert(0, {'full_text': 'RAM %s' % RAM, 'name': 'RAM', "color": "#3CB371"})
        else:
            j.insert(0, {'full_text': 'RAM %s' % RAM, 'name': 'RAM', "color": "#DC143C"})
        if SwapAvailablePer < 95.00:
            j.insert(1,{'full_text': 'Swap %s' % Swap, 'name': 'Swap', "color": "#3CB371"})
        else:
            j.insert(1,{'full_text': 'Swap %s' % Swap, 'name': 'Swap', "color": "#DC143C"})

        receive_old, transmit_old = get_net_data(netdev)
        time.sleep(1)
        receive, transmit = get_net_data(netdev)
        receive_speed = '↓' + str(unit_conversion(receive - receive_old)) + '/s'
        transmit_speed = '↑' + str(unit_conversion(transmit - transmit_old)) + '/s'
        j.insert(2, {'full_text': receive_speed , 'name': 'receive_speed', "color": "#3CB371"})
        j.insert(3, {'full_text': transmit_speed , 'name': 'transmit_speed', "color": "#3CB371"})

        # and echo back new encoded json
        print_line(prefix + json.dumps(j))
