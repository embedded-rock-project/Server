from aiohttp import web
import aiohttp
import asyncio
from base64 import b64encode

routes = web.RouteTableDef()
websockets = []
camera_websockets = []
pi_websocket = None
pi_camera_websocket = None



@routes.get('/index.js')
async def test(request):
    return web.Response(text=open('index.js').read(), content_type="text/javascript")

@routes.get('/index.css')
async def test(request):
    return web.Response(text=open('index.css').read(), content_type="text/css")

@routes.get('/')
async def test(request):
    return web.Response(text=open('index.html').read(), content_type="text/html")



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
    print(data)
    try:
        await pi_websocket.send_json(data)
    except Exception:
        pass
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
            print('pi camera connection closed with exception %s' % ws.exception())

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
