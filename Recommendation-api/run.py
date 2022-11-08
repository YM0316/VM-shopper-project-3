import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

import Rec_azure_v2
import Rec_aws_v2
import Rec_gcp_v2

app = Flask(__name__)
CORS(app)

#Api method: Get
# URL: (your ip address):(port number)/(route)
# URL: 35.204.125.116:3389/
@app.route('/')
def index():
    return 'hello Caloudi Project'

#Api method: Post
# URL: (your ip address):(port number)/(route)
# URL: 35.204.125.116:3389/azure_v2
@app.route('/azure_v2', methods=['POST'])
def azure_v2():
    # Get post data cpu,memory,cost
    insertValues = request.get_json()
    print(insertValues)
    vendor=insertValues['vendor']
    cpu=insertValues['cpu']
    memory=insertValues['memory']
    gpu=insertValues['gpu']
    region=insertValues['region']
    vm_name=insertValues['name']
    OS=insertValues['OS']
    topN=insertValues['topN']
    azure_rec = Rec_azure_v2.rec_azure(vendor,region,cpu,memory,gpu,vm_name,OS,topN)
    print(azure_rec)
    return jsonify(azure_rec)

@app.route('/aws_v2', methods=['POST'])
def aws_v2():
    # Get post data cpu,memory,cost
    insertValues = request.get_json()
    print(insertValues)
    vendor=insertValues['vendor']
    cpu=insertValues['cpu']
    memory=insertValues['memory']
    gpu=insertValues['gpu']
    region=insertValues['region']
    vm_name=insertValues['name']
    OS=insertValues['OS']
    topN=insertValues['topN']
    if region == 'US West (Oregon))':
        region = 'US West (Oregon)'
    aws_rec = Rec_aws_v2.rec_aws(vendor,region,cpu,memory,gpu,vm_name,OS,topN)
    print(aws_rec)
    return jsonify(aws_rec)

@app.route('/gcp_v2', methods=['POST'])
def gcp_v2():
    # Get post data cpu,memory,cost
    insertValues = request.get_json()
    print(insertValues)
    vendor=insertValues['vendor']
    cpu=insertValues['cpu']
    memory=insertValues['memory']
    gpu=insertValues['gpu']
    region=insertValues['region']
    vm_name=insertValues['name']
    OS=insertValues['OS']
    topN=insertValues['topN']
    gcp_rec = Rec_gcp_v2.rec_gcp(vendor,region,cpu,memory,gpu,vm_name,OS,topN)
    print(gcp_rec)
    return jsonify(gcp_rec)

if __name__ == '__main__':
    Rec_azure_v2.init()
    app.run(host='0.0.0.0', port=3389, debug=True)