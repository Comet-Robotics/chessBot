import pip
import socket
import time

def import_or_install(package):
    try:
        return __import__(package)
    except ImportError:
        pip.main(['install', package])
        return __import__(package)

pygame = import_or_install("pygame")
pygame_menu = import_or_install("pygame_menu")
themes = pygame_menu.themes

JSON_PORT = 80
DEFAULT_IP = '192.168.113.184'

pygame.init()
pygame.display.set_caption('ChessBot Local Admin')

ipInput = None
sock = None

surface = pygame.display.set_mode((1200, 800))

def set_difficulty(value, difficulty):
    print(value)
    print(difficulty)

sock_data = ""
line = ""
def read_until_newline():
    global sock_data, line
    chunk = None

    while True:
        try:
            chunk = None
            chunk = sock.recv(1024)
        except BlockingIOError:
            pass

        if chunk is not None and len(chunk) != 0:
            print('Got some data: ', chunk.decode('utf-8'))
            
            sock_data += chunk.decode('utf-8')
            if '\n' in sock_data:
                pos = sock_data.find('\n')
                line = sock_data[0:pos]
                sock_data = sock_data[pos:]
                break

        time.sleep(0.01)
 
def connect():
    global sock, line

    ip = ipInput.get_value()
    print('Connecting to', ip)
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((ip, JSON_PORT))
    sock.setblocking(0)

    # Expect a hello
    read_until_newline()
    print('output', line)
    
 
def level_menu():
    mainmenu._open(level)

mainmenu = pygame_menu.Menu('Welcome', 1200, 800, theme=themes.THEME_SOLARIZED)

ipInput = mainmenu.add.text_input('Target IP: ', default=DEFAULT_IP, maxchar=15)
mainmenu.add.button('Connect', connect)
mainmenu.add.button('Levels', level_menu)
mainmenu.add.button('Quit', pygame_menu.events.EXIT)
 
level = pygame_menu.Menu('Select a Difficulty', 1200, 800, theme=themes.THEME_BLUE)
level.add.selector('Difficulty:',[('Hard',1),('Easy',2)], onchange=set_difficulty)

while True:
    events = pygame.event.get()
    for event in events:
        if event.type == pygame.QUIT:
            exit()
 
    if mainmenu.is_enabled():
        mainmenu.update(events)
        mainmenu.draw(surface)
 
    pygame.display.update()