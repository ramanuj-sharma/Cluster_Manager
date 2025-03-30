from flask import request, jsonify, Flask, Response, send_file
import json
import keys
import clustering
import traceback

app = Flask(__name__)

# Data
datafile = "./key.txt"
key = ['','',''] # URL, Token, Type

key = keys.load_key(datafile)

@app.route("/")
def hello_world():
    return Response("OK", mimetype="text/plain")

@app.route("/key", methods=['GET'])
def read_key():
    return Response(json.dumps({'url': key[0], 'token': key[1], 'type': key[2]}), mimetype="application/json")

@app.route("/key", methods=['POST'])
def set_key():
    json_input = request.json
    if json_input is None:
        return "Bad request!", 400
    key[0] = str(json_input['url'])
    key[1] = str(json_input['token'])
    key[2] = str(json_input['type'])
    keys.store_key(datafile, key)
    return Response("OK", mimetype="text/plain")

@app.route("/setup")
def setup():
    clustering.setup(key)
    return "OK", 200

@app.route("/pools")
def get_data_pools():
    try:
        res = clustering.get_data_pools()
    except:
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")

@app.route("/models")
def get_data_models():
    pool_id = request.args.get('pool_id')
    try:
        res = clustering.get_data_models(pool_id)
    except:
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")

@app.route("/process_config")
def get_process_config():
    model_id = request.args.get('model_id')
    try:
        res = clustering.get_process_config(model_id)
    except:
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")

@app.route("/size")
def get_size():
    try:
        res = clustering.get_size()
    except Exception as e:
        print(e)
        return "Bad request!", 400
    return Response(res, mimetype="text/plain")

@app.route("/min_pts", methods=['POST'])
def set_min_pts():
    json_input = request.json
    if json_input is None:
        return "Bad request!", 400
    min_pts = str(json_input['min_pts'])
    try:
        clustering.set_min_pts(min_pts)
    except:
        return "Bad request!", 400
    return "OK", 200

@app.route("/epsilon", methods=['POST'])
def set_epsilon():
    json_input = request.json
    if json_input is None:
        return "Bad request!", 400
    epsilon = str(json_input['epsilon'])
    try:
        clustering.set_epsilon(epsilon)
    except:
        return "Bad request!", 400
    return "OK", 200

@app.route("/dimension_alg", methods=['POST'])
def set_dimension_alg():
    json_input = request.json
    if json_input is None:
        return "Bad request!", 400
    dimension_alg = str(json_input['dimension_alg'])
    try:
        clustering.set_dimension_alg(dimension_alg)
    except:
        return "Bad request!", 400
    return "OK", 200

@app.route("/min_pts", methods=['GET'])
def get_min_pts():
    try:
        res = clustering.get_min_pts()
    except:
        return "Bad request!", 400
    return Response(res, mimetype="text/plain")

@app.route("/epsilon", methods=['GET'])
def get_epsilon():
    try:
        res = clustering.get_epsilon()
    except:
        return "Bad request!", 400
    return Response(res, mimetype="text/plain")

@app.route("/dimension_alg", methods=['GET'])
def get_dimension_alg():
    try:
        res = clustering.get_dimension_alg()
    except:
        return "Bad request!", 400
    return Response(res, mimetype="text/plain")

@app.route("/algorithm", methods=['POST'])
def set_algorithm():
    json_input = request.json
    if json_input is None:
        return "Bad request!", 400
    algorithm = str(json_input['algorithm'])
    try:
        clustering.set_algorithm(algorithm)
    except:
        return "Bad request!", 400
    return "OK", 200

@app.route("/algorithm", methods=['GET'])
def get_algorithm():
    try:
        res = clustering.get_algorithm()
        if res:
            res = "dbscan"
        else:
            res = "fixed"
    except:
        return "Bad request!", 400
    return Response(res, mimetype="text/plain")

@app.route("/features_fixed_selection", methods=['POST'])
def set_features_fixed_selection():
    json_input = request.json
    if json_input is None:
        return "Bad request!", 400
    num = json_input['num_selection']
    cat = json_input['cat_selection']
    date = json_input['date_selection']
    try:
        clustering.set_features_fixed_selection(num, cat, date)
    except:
        return "Bad request!", 400
    return "OK", 200

@app.route("/features_fixed_selection", methods=['GET'])
def get_features_fixed_selection():
    try:
        res = clustering.get_features_fixed_selection()
    except:
        return "Bad request!", 400
    return Response(res, mimetype="application/json")

@app.route("/manual_alg", methods=['POST'])
def set_manual_alg():
    json_input = request.json
    if json_input is None:
        return "Bad request!", 400
    alg = str(json_input['algorithm'])
    try:
        clustering.set_manual_alg(alg)
    except:
        return "Bad request!", 400
    return "OK", 200

@app.route("/manual_alg", methods=['GET'])
def get_manual_alg():
    try:
        res = clustering.get_manual_alg()
    except:
        return "Bad request!", 400
    return Response(res, mimetype="text/plain")

@app.route("/manual_k", methods=['POST'])
def set_manual_k():
    json_input = request.json
    if json_input is None:
        return "Bad request!", 400
    k = int(json_input['k'])
    try:
        clustering.set_manual_k(k)
    except:
        return "Bad request!", 400
    return "OK", 200

@app.route("/manual_k", methods=['GET'])
def get_maual_k():
    try:
        res = clustering.get_manual_k()
    except:
        return "Bad request!", 400
    return Response(str(res), mimetype="text/plain")

@app.route("/estimate", methods=['GET'])
def get_estimate():
    try:
        res = clustering.estimate()
    except:
        return "Bad request!", 400
    return Response(res, mimetype="text/plain")

@app.route("/cluster_column", methods=['POST'])
def set_cluster_column():
    json_input = request.json
    if json_input is None:
        return "Bad request!", 400
    column = str(json_input['column'])
    print("Cluster column:", column)
    try:
        clustering.set_cluster_column(column)
    except:
        return "Bad request!", 400
    return "OK", 200

@app.route("/cluster")
def get_perform_clustering():
    reload = request.args.get('reload') != "false"
    print("Reload value:", reload)
    if not reload:
        try:
            res = clustering.clustering
        except Exception as e:
            print(e)
            return "Bad request!", 400
        return Response(json.dumps(res), mimetype="application/json")
    if clustering.dbscan:
        try:
            res = clustering.perform_clustering_dbscan()
        except Exception as e:
            print(e)
            return "Bad request!", 400
    else:
        try:
            res = clustering.perform_clustering_fixed()
        except Exception as e:
            print(e)
            return "Bad request!", 400

    return Response(json.dumps(res), mimetype="application/json")

@app.route("/features_fixed")
def get_features_clustering_fixed():
    try:
        res = clustering.get_features_clustering_fixed()
    except:
        print(traceback.format_exc())
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")

@app.route("/dfg")
def get_route():
    cluster_id = request.args.get('cluster_id')
    try:
        res = clustering.get_dfg(cluster_id)
    except Exception as e:
        print(e)
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")        
    
@app.route("/features")
def get_features():
    try:
        res = clustering.get_features()
    except:
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")

@app.route("/num_feature")
def get_num_feature():
    table_name = request.args.get('table_name')
    column_name = request.args.get('column_name')
    intermediate_agg = request.args.get('intermediate_agg')
    try:
        res = clustering.get_num_feature(table_name, column_name, intermediate_agg)
    except:
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")

@app.route("/cat_feature")
def get_cat_feature():
    table_name = request.args.get('table_name')
    column_name = request.args.get('column_name')
    try:
        res = clustering.get_cat_feature(table_name, column_name)
    except:
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")

@app.route("/date_feature")
def get_date_feature():
    table_name = request.args.get('table_name')
    column_name = request.args.get('column_name')
    try:
        res = clustering.get_date_feature(table_name, column_name)
    except:
        return "Bad request!", 400
    return Response(res, mimetype="application/json")

@app.route("/throughput")
def get_throughput_time():
    try:
        res = clustering.get_throughput_time()
    except:
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")       

@app.route("/summary")
def get_summary_extraction():
    try:
        res = clustering.summary_extraction()
    except Exception as e:
        print(e)
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")

@app.route("/export")
def get_export():
    try:
        clustering.export()
    except Exception as e:
        print(e)
        return "Bad request!", 400
    return "OK", 200

@app.route("/load")
def get_load():
    timestamp = request.args.get('timestamp')
    try:
        clustering.load(timestamp)
    except Exception as e:
        print(e)
        return "Bad request!", 400
    return "OK", 200

@app.route("/export_list")
def get_export_list():
    try:
        res = clustering.export_list()
    except Exception as e:
        print(e)
        return "Bad request!", 400
    return Response(json.dumps(res), mimetype="application/json")

app.run()