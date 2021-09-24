from flask import Flask, request, render_template
import json, random, string
import fileHandeling;
import requests
import datetime;

app = Flask(__name__)

"""
Post route for the data, logs, ect.
"""
@app.route("/data", methods=["POST"])
def on_data_recieve():
    data = {} # keeps an empty data dict if data didn't come as json 
    if request.is_json:
        data = request.get_json()
        fileHandeling.main(data['data']);
    res_data = {} #possible data that can be sent to the client
    return (json.dumps({'success': True, 'data': res_data}), 200, {'ContentType':'application/json'}) # returns 200, ok if successfull

app.run(host="localhost", port=5000) # localhost:5000