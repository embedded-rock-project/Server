from aiohttp import web
import aiohttp

routes = web.RouteTableDef()
@routes.get('/')
async def hello(request):
    html = open("server/templates/index.html").read()
    return web.Response(text=html, content_type="text/html")





@routes.get('/websocket')
async def websocket_handler(request):
    count = 0
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        count += 1
        if msg.type == aiohttp.WSMsgType.TEXT:
            if msg.data == 'disconnect_request':
                await ws.close()
            else:
                await ws.send_json({"data": msg.data, "count": count})
        elif msg.type == aiohttp.WSMsgType.ERROR:
            print('ws connection closed with exception %s' %
                  ws.exception())

    print('websocket connection closed')

    return ws

app = web.Application()
app.add_routes(routes)
web.run_app(app)