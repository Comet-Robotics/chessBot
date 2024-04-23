import os
import json
import sys
import re
import subprocess

task = sys.argv[1]
print('Doing task: ' + task)

esptool = os.environ[r'espPythonPath'] + ' ' + os.environ[r'espIdfPath'] + r'\components\esptool_py\esptool\esptool.py'

if task == 'ota':
    # Read app image to find hash
    cmd = esptool + r' --chip esp32s2 image_info --version 2 .\build\chessbot.bin'

    imageInfo = subprocess.check_output(cmd)
    imageInfo = str(imageInfo)
    
    res = re.search(r'Validation hash: ([0-9a-fA-F]{64})', imageInfo)
    hash = res.group(1)
    print('Found hash', hash)

    # Download current info.json
    os.system(r'scp admin@10.42.0.1:/var/www/html/update/chessbot/info.json ./build/info.json')

    with open('./build/info.json', 'r') as f:
        info = json.load(f)

    if info['hash'] == hash:
        print('No image change since last OTA Push')
        exit()

    # Get current URL index
    urlIndex = int(re.search(r'(\d+)', info['url']).groups()[-1])

    # Increment it
    newUrl = info['url'].replace(str(urlIndex), str(urlIndex + 1))

    newInfo = {
        'hash': hash,
        'url': newUrl
    }

    # Upload new firmware
    os.system(r'scp ./build/chessbot.bin admin@10.42.0.1:/var/www/html/update/chessbot/firmware' + str(urlIndex + 1) + '.bin')

    # Upload new info.json
    with open('./build/info.json', 'w') as f:
        json.dump(newInfo, f)
    os.system(r'scp ./build/info.json admin@10.42.0.1:/var/www/html/update/chessbot/info.json')

elif task == 'dns':
    # Update DNS entry to our IP on chess-server
    pass

else:
    print('Unsupported task!')