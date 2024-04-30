import os
import json
import sys
import re
import subprocess
import time

task = sys.argv[1]
print('Doing task: ' + task)

esptool = os.environ[r'espPythonPath'] + ' ' + os.environ[r'espIdfPath'] + r'\components\esptool_py\esptool\esptool.py'
idf = os.environ[r'espPythonPath'] + ' ' + os.environ[r'espIdfPath'] + r'\tools\idf.py'

def getCreds():
    with open('./env.h', 'r') as f:
        contents = f.read()
        user = re.search(r'ota\-ssh\-user=(.+)\n', contents).groups()[0]
        password = re.search(r'ota\-ssh\-password=(.+)\n', contents).groups()[0]

if task == 'ota-disable':
    # Upload new info.json
    with open('./build/info.json', 'w') as f:
        json.dump({'disabled':True}, f)
    os.system(r'scp ./build/info.json admin@chess-ota.internal:/var/www/html/update/chessbot/info.json')
elif task == 'ota':
    # Build the project
    os.system('cd build && ninja')

    # Read app image to find hash
    cmd = esptool + r' --chip esp32s2 image_info --version 2 .\build\chessbot.bin'

    imageInfo = subprocess.check_output(cmd)
    imageInfo = str(imageInfo)
    
    res = re.search(r'Validation hash: ([0-9a-fA-F]{64})', imageInfo)
    hash = res.group(1)
    print('Found hash', hash)

    try:
        # Download current info.json
        os.system(r'scp admin@chess-ota.internal:/var/www/html/update/chessbot/info.json ./build/info.json')

        with open('./build/info.json', 'r') as f:
            info = json.load(f)

        if info['hash'] == hash:
            print('No image change since last OTA Push')
            exit()

        # Get current URL index
        urlIndex = int(re.search(r'(\d+)', info['url']).groups()[-1])

        # Increment it
        newUrl = info['url'].replace(str(urlIndex), str(urlIndex + 1))
    except:
        urlIndex = time.time_ns() // 1_000_000
        newUrl = 'chess-server.internal/update/chessbot/firmware' + str(urlIndex) + '.bin'

    newInfo = {
        'hash': hash,
        'url': newUrl
    }

    # Upload new firmware
    os.system(r'scp ./build/chessbot.bin admin@chess-ota.internal:/var/www/html/update/chessbot/firmware' + str(urlIndex + 1) + '.bin')

    # Upload new info.json
    with open('./build/info.json', 'w') as f:
        json.dump(newInfo, f)
    os.system(r'scp ./build/info.json admin@chess-ota.internal:/var/www/html/update/chessbot/info.json')

elif task == 'dns':
    # Check current IP
    '''lookup ='nslookup chess-server.internal '
    cmd = lookup + 'chess-ota.internal'

    res = str(subprocess.check_output(cmd))
    if 'can\'t find' in res:
        # Try again with no bound DNS server
        cmd = lookup
        res = str(subprocess.check_output(cmd))

    # Find our own IP'''

    ipconfig = str(subprocess.check_output('ipconfig'))

    ips = re.findall(r'IPv4 Address[. :]*([\d.]{8,15})', ipconfig)
    routers = re.findall(r'Default Gateway[. :]*([\d.]{8,15})', ipconfig)
    

    print(ips, routers)
        

    # Update DNS entry to our IP on chess-server
    

else:
    print('Unsupported task!')