# directory and file pathing for everything points to locations of files

from aiohttp import web
import aiohttp
import asyncio
from base64 import b64encode

# sets initial values
routes = web.RouteTableDef()
websockets = []
camera_websockets = []
pi_websocket = None
pi_camera_websocket = None

# gets all the files required to run the GUI/UI


@routes.get('/templates/home/index.js')
async def test(request):
    return web.Response(text=open('templates/home/index.js').read(), content_type="text/javascript")

# index.css get


@routes.get('/templates/home/index.css')
async def test(request):
    return web.Response(text=open('templates/home/index.css').read(), content_type="text/css")

# index.html get


@routes.get('/')
async def test(request):
    return web.Response(text=open('templates/home/index.html').read(), content_type="text/html")

# cameraPopup.html get


@routes.get('/camera_popup')
async def test(request):
    return web.Response(text=open('templates/camera/cameraPopup.html').read(), content_type="text/html")

# cameraPopup.js get


@routes.get('/templates/camera/cameraPopup.js')
async def test(request):
    return web.Response(text=open('templates/camera/cameraPopup.js').read(), content_type="text/javascript")

# cameraPopup.css get


@routes.get('/templates/camera/cameraPopup.css')
async def test(request):
    return web.Response(text=open('templates/camera/cameraPopup.css').read(), content_type="text/css")


@routes.get('/log_popup')
async def test(request):
    print('1')
    return web.Response(text=open('templates/log/logPopup.html').read(), content_type="text/html")


@routes.get('/templates/log/logPopup.js')
async def test(request):
    print('1')
    return web.Response(text=open('templates/log/logPopup.js').read(), content_type="text/javascript")


@routes.get('/templates/log/logPopup.css')
async def test(request):
    print('1')
    return web.Response(text=open('templates/log/logPopup.css').read(), content_type="text/css")


@routes.get('/pi')
async def websocket_handler(request):
    global pi_websocket
    pi_log_count = 0
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    pi_websocket = ws

    async for msg in ws:
        pi_log_count += 1
        if msg.type == aiohttp.WSMsgType.TEXT:
            if msg.data == 'disconnect_request':
                ws.force_close()
                break
            else:
                await asyncio.gather(*(ws.send_str("pi log #{}: {}".format(pi_log_count, msg.data)) for ws in websockets))
        elif msg.type == aiohttp.WSMsgType.ERROR:
            print('pi connection closed with exception %s' % ws.exception())

    print('pi websocket connection closed')
    pi_websocket = None
    return ws


@routes.post('/pi_data')
async def websocket_handler(request):
    data = await request.json()
    await pi_websocket.send_json(data)
    return


@routes.get('/pi_camera_feed')
async def websocket_handler(request):
    global pi_camera_websocket
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    pi_camera_websocket = ws

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.BINARY:
            data = b64encode(msg.data)
            await asyncio.gather(*(ws.send_str(data.decode("ascii")) for ws in camera_websockets))
        elif msg.type == aiohttp.WSMsgType.TEXT:
            if msg.data == "disconnect_request":
                ws.force_close()
                break
        elif msg.type == aiohttp.WSMsgType.ERROR:
            print('pi camera connection closed with exception %s' %
                  ws.exception())

    print('pi camera connection closed')
    pi_camera_websocket = None
    return ws


@routes.get('/ws')
async def websocket_handler(request):
    count = 0
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    websockets.append(ws)

    async for msg in ws:
        count += 1
        if msg.type == aiohttp.WSMsgType.TEXT:
            if msg.data == 'disconnect_request':
                await ws.close()
                break
            else:
                await asyncio.gather(*(ws.send_str("client: {}".format(msg.data)) for ws in websockets))
        elif msg.type == aiohttp.WSMsgType.ERROR:
            print('ws connection closed with exception %s' % ws.exception())

    print('client websocket connection closed')
    websockets.remove(ws)
    return ws


@routes.get('/ws_camera_feed')
async def websocket_handler(request):
    count = 0
    ws = web.WebSocketResponse()
    camera_websockets.append(ws)
    await ws.prepare(request)
    async for msg in ws:
        count += 1
        if msg.type == aiohttp.WSMsgType.TEXT:
            if msg.data == 'disconnect_request':
                ws.force_close()
                break
        elif msg.type == aiohttp.WSMsgType.ERROR:
            print('ws connection closed with exception %s' % ws.exception())

    print('client camera connection closed')
    camera_websockets.remove(ws)
    return ws

app = web.Application()
app.add_routes(routes)
web.run_app(app)
