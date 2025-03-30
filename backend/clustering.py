from pycelonis import *
from pycelonis.pql import *
import logging
import pm4py

import pandas as pd
from pandas.util import hash_pandas_object
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture
from pacmap import PaCMAP
import alphashape as alpha
from descartes import *
from shapely.geometry.multipolygon import *
from shapely.geometry import Polygon
import geopandas
import traceback
import json
import time
from pathlib import Path
from io import FileIO

from collections import Counter

import matplotlib.pyplot as plt
import numpy as np
from matplotlib import colormaps
from matplotlib.colors import to_hex

from utils import *

celonis = None
pool = None
model = None

tables = None
activity_table = None
case_table = None

activity_table_id = None
activity_column = None
case_table_id = None
case_column = None
timestamp_column = None

dbscan = True

# Defaults for clustering
epsilon = 3
min_pts = 579  # change this to search
dimension_alg = "TSVD"

clustering = None
areas = None
activity_df = None
case_assignment = None

# Defaults for manual clustering
num_selection = {}
cat_selection = {}
date_selection = {}
manual_alg = "kmeans"
k = 2

# Prevent submodule outputs
logger = logging.getLogger('cluster_manager')
logger.setLevel(logging.ERROR)
logging.getLogger("root").setLevel(logging.ERROR)

def setup(key):
    """
    Sets up the Celonis object based on the given key.

    Args:
        key: The key to be used.
    """
    global celonis
    celonis = get_celonis(base_url=key[0], api_token=key[1], key_type=key[2])


def get_data_pools():
    """
    Reads all data pools from the Celonis object.

    Returns:
        A dict of the form pool_id --> pool_name.
    """
    check_celonis()
    res = {}
    for d in celonis.data_integration.get_data_pools():
        res[d.id] = d.name
    return res


def get_data_models(pool_id):
    """
    Reads all data models from the selected pool object.

    Args:
        pool_id: The id of the data pool to be inspected.

    Returns:
        A dict of the form model_id --> model_name.
    """
    global pool
    check_celonis()
    res = {}
    pool = None
    for d in celonis.data_integration.get_data_pools():
        if d.id == pool_id:
            pool = d
            break
    for m in pool.get_data_models():
        res[m.id] = m.name
    return res


def get_process_config(model_id):
    """
    Reads the process configuration from the model.

    Args:
        model_id: The id of the data model to be inspected.

    Returns:
        A dict containing the activity table id, the activity column name, case table id, the case column name, and all available columns of the activity table.
    """
    global model, activity_table_id, case_table_id, case_column, tables, activity_table, case_table, timestamp_column
    model = None
    check_celonis()
    for m in pool.get_data_models():
        if m.id == model_id:
            model = m
            break
    properties = model.get_process_configurations()[0]
    activity_table_id = properties.activity_table_id
    activity_column = properties.activity_column
    case_table_id = properties.case_table_id
    case_column = properties.case_id_column
    timestamp_column = properties.timestamp_column

    tables = model.get_tables()
    for t in tables:
        if t.id == activity_table_id:
            activity_table = t
        if t.id == case_table_id:
            case_table = t
    
    case_table_alias = case_table.name
    if case_table.alias:
        case_table_alias = case_table.alias
    activity_table_alias = activity_table.name
    if activity_table.alias:
        activity_table_alias = activity_table.alias
    
    activity_columns = []
    #for col in activity_table.get_columns():
    #    activity_columns.append(col.name)
    # Same bug as for visualization
    activity_columns = get_features()['Categorical'][activity_table.name]
    #activity_columns = ['ACTIVITY_DE', 'ACTIVITY_EN', '_SORTING', 'STATUS', 'LOCATION', 'USERTYPE']

    return {'activity_table_id': activity_table_id, 'activity_column': activity_column, 'case_table_id': case_table_id, 'case_column': case_column, 'activity_columns': activity_columns, 'case_table_alias': case_table_alias, 'activity_table_alias': activity_table_alias}

def get_size():
    """
    Reads the size of the event log.

    Returns:
        The size of the event log as a string.
    """
    check_celonis()
    # Handle aliasing, otherwise Celonis does refuse the queries.
    if case_table.alias:
        cases = case_table.alias
    else:
        cases = case_table.name
    
    # Get size
    query = PQL(distinct=False)
    query += PQLColumn(name="SIZE",
                       query=f""" COUNT ( "{cases}"."{case_column}" ) """)
    result_df = model.export_data_frame(query)

    return str(result_df['SIZE'][0])

def set_min_pts(_min_pts):
    """
    Sets the parameter MIN_PTS for clustering.

    Args:
        _min_pts: The value to be set.
    """
    check_celonis()
    global min_pts
    min_pts = _min_pts

def set_epsilon(_epsilon):
    """
    Sets the parameter EPSILON for clustering.

    Args:
        _epsilon: The value to be set.
    """
    check_celonis()
    global epsilon
    epsilon = _epsilon

def set_dimension_alg(_dimension_alg):
    """
    Sets the dimension reduction algorithm identifier for clustering.

    Args:
        _dimension_alg: The name of the algorithm.
    """
    check_celonis()
    global dimension_alg
    dimension_alg = _dimension_alg

def get_min_pts():
    """
    Reads the parameter MIN_PTS for clustering.

    Returns:
        The value being read.
    """
    check_celonis()
    return str(min_pts)

def get_epsilon():
    """
    Reads the parameter EPSILON for clustering.

    Returns:
        The value being read.
    """
    check_celonis()
    return str(epsilon)

def set_algorithm(type):
    """
    Sets the technique to be used for clustering.

    Args:
        type: The value being set.
    """
    global dbscan
    dbscan = type == "dbscan"

def get_algorithm():
    """
    Reads the technique to be used for clustering.

    Returns:
        True iff DBSCAN control flow based clustering is used.
    """
    return dbscan

def set_features_fixed_selection(num, cat, date):
    """
    Sets the selection to be used for manual clustering.

    Args:
        num: The selection of numerical features to cluster on.
        cat: The selection of categorical features to cluster on.
        date: The selection of datetime features to cluster on.
    """
    global num_selection, cat_selection, date_selection
    num_selection = num
    cat_selection = cat
    date_selection = date

def get_features_fixed_selection():
    """
    Reads the feature selection used for fixed clustering.

    Returns:
        A dict of the form {'Numerical': {...}, 'Categorical': {...}, 'Datetime': {...}}
    """
    return {'Numerical': num_selection, 'Categorical': cat_selection, 'Datetime': date_selection}

def set_manual_alg(alg):
    """
    Sets the algorithm to be used for manual clustering.

    Args:
        alg: The algorithm to be used for fixed clustering.
    """
    global manual_alg
    manual_alg = alg

def get_manual_alg():
    """
    Reads the technique to be used for fixed clustering.

    Returns:
        The identifier of the algorithm.
    """
    return manual_alg

def set_manual_k(num):
    """
    Sets the selection to be used for fixed clustering.

    Args:
        num: The number of clusters for fixed clustering.
    """
    global k
    k = num

def get_manual_k():
    """
    Reads the number of clusters desired to be used for fixed clustering.

    Returns:
        The numer of clusters.
    """
    return k

def get_dimension_alg():
    """
    Reads the dimension reduction algorithm identifier for clustering.

    Returns:
        The identifier of the algorithm.
    """
    check_celonis()
    return str(dimension_alg)

def estimate():
    """
    Sets the initial values for MIN_PTS and EPSILON based on a heuristic.

    Returns:
        True iff no error occured.
    """
    global epsilon, min_pts, dimension_alg
    epsilon = 3
    min_pts = int(0.01 * int(get_size())) # 1 % of the data set is required per cluster
    dimension_alg = "TSVD"

    return "true"

def set_cluster_column(_column):
    """
    Sets the column for the variant clustering algorithm.

    Args:
        _column: The name of the column.
    """
    check_celonis()
    global activity_column
    activity_column = _column

def perform_clustering_dbscan():
    """
    Uses DBSCAN clustering of the Celonis API to obtain a clustering of the datset. All needed parameters are read from the global variables min_pts, epsilon, dimension_alg.

    Returns:
        A dict of the form cluster_id --> cluster_properties describing the truncated Cartesian shapes, colors, and size of the clusters.
    """
    global clustering, activity_df, case_assignment, areas
    try:
        check_celonis()
        print("Using:", min_pts, epsilon, dimension_alg)
        # Hanlde aliasing, otherwise Celonis does refuse the queries.
        if case_table.alias:
            cases = case_table.alias
        else:
            cases = case_table.name
        
        if activity_table.alias:
            activities = activity_table.alias
        else:
            activities = activity_table.name
        
        # Get clustering
        print("Clustering on", activity_column)
        query = PQL(distinct=False)
        query += PQLColumn(name="CID",
                        query=f""" "{cases}"."{case_column}" """)
        query += PQLColumn(name="CLUSTER",
                        query=f""" CLUSTER_VARIANTS ( VARIANT ( "{activities}"."{activity_column}" ) , {min_pts}, {epsilon}) """)
        query += PQLColumn(name="ACTIVITIES",
                        query=f""" VARIANT ( "{activities}"."{activity_column}" )  """)
        query += OrderByColumn(query=f""" "{cases}"."{case_column}" """)
        result_df = model.export_data_frame(query)
        case_assignment = result_df[['CID', 'CLUSTER']]

        activity_df = result_df[['ACTIVITIES','CLUSTER']]
        activity_df['ACTIVITIES'] = activity_df['ACTIVITIES'].apply(lambda x: x.split(','))
        activity_df = activity_df.explode('ACTIVITIES')

        result_df['ACTIVITIES'] = result_df['ACTIVITIES'].apply(lambda x: list_of_pairs(x))

        # Postprocess data
        mlb = MultiLabelBinarizer()

        cluster_df = result_df.join(pd.DataFrame(mlb.fit_transform(
            result_df.pop('ACTIVITIES')), columns=mlb.classes_, index=result_df.index))

        cluster_df = cluster_df.loc[:, (cluster_df.columns != 'CID') & (
            cluster_df.columns != 'CLUSTER')]

        # Dimension reduction
        if dimension_alg == "PCA":
            pca = PCA(2, random_state=2001, svd_solver="full") # for dense tables
        elif dimension_alg == "TSVD":
            pca = TruncatedSVD(2, random_state=2001) # for sparse tables
        elif dimension_alg == "PaCMAP":
            pca = PaCMAP(2, distance="hamming", random_state=2001) # maintains local and global relations
        pca_data = None
        print("Used:", type(pca))
        if isinstance(pca, PaCMAP):
            pca_data = pd.DataFrame(pca.fit_transform(
                cluster_df, init="pca"), columns=['PC1', 'PC2'])
        else:
            pca_data = pd.DataFrame(pca.fit_transform(
                cluster_df), columns=['PC1', 'PC2'])
        
        pca_data['cluster'] = pd.Categorical(result_df.CLUSTER)

        # Plotting
        pca_plot = pca_data.loc[pca_data['cluster'] != -1]

        # No clusters found
        if len(pca_plot) == 0:
            return {}
        
        shapes = []
        for cluster_id in range(max(pca_plot['cluster'])+1):
            pca_sub = pca_data.loc[pca_data['cluster'] == cluster_id]
            if isinstance(pca, PaCMAP):
                try:
                    alpha_shape = alpha.alphashape(pca_sub[['PC1','PC2']], 0.25)
                except:
                    alpha_shape = alpha.alphashape(pca_sub[['PC1','PC2']] + np.random.normal(0, 0.01, [len(pca_sub),2]), 0.25)
            else:
                try:
                    alpha_shape = alpha.alphashape(pca_sub[['PC1','PC2']], 5)
                except:
                    # Alpha shape needs some noise because of singularities
                    alpha_shape = alpha.alphashape(pca_sub[['PC1','PC2']] + np.random.normal(0, 0.01, [len(pca_sub),2]), 5)
            shapes.append(alpha_shape)
            
        res = {}
        colors = {}
        sizes = {}
        areas = []
        cmap = colormaps['hsv']
        for cluster_id in range(len(shapes)): # https://stackoverflow.com/questions/75287534/indexerror-descartes-polygonpatch-wtih-shapely   in C:\\Users\\phil-\\anaconda3\\lib\\site-packages\\descartes
            shape = shapes[cluster_id]
            sub_shapes = []
            pca_sub = pca_data.loc[pca_data['cluster'] == cluster_id]
            if not isinstance(shape, MultiPolygon):
                sub_shapes = [shape]
            else:
                sub_shapes = list(shape.geoms)
            print("Cl.", cluster_id, "-", "Points:", len(pca_sub['PC1']), "Shapes:", len(sub_shapes))
            print("Area:", [sub_shape.buffer(0.5, join_style=1).buffer(-0.5, join_style=1).area for sub_shape in sub_shapes])
            sub_shapes.sort(key=lambda x: x.buffer(0.5, join_style=1).buffer(-0.5, join_style=1).area, reverse=True)
            #for sub_shape in sub_shapes:
            sub_shape = sub_shapes[0].buffer(0.5, join_style=1).buffer(-0.5, join_style=1)
            sub_shape = sub_shape.buffer(0.5, join_style=1).buffer(-0.5, join_style=1)
            if isinstance(sub_shape, MultiPolygon):
                sub_shape.sort(key=lambda x: x.area, reverse=True)
                sub_shape = list(sub_shape.geoms)[0]
            print(type(sub_shape))
            res[cluster_id] = sub_shape
            colors[cluster_id] = cmap(cluster_id/(max(pca_plot['cluster'])+0.01)*0.9)
            sizes[cluster_id] = len(pca_sub['PC1'])
            areas.append(sub_shape.area)
        
        intersections = {}
        
        for i in range(len(res)):
            intersection = 0
            shape1 = res[i]
            for j in range(len(res)):
                if i == j:
                    continue
                shape2 = res[j]
                intersection += shape1.intersection(shape2).area
            intersections[i] = max([1 - intersection/(shape1.area),0])
            print("Quality of", i, intersections[i])
        
        for key in res:
            res[key] = [[x[1],x[0]] for x in list(res[key].exterior.coords)]
        
        # Create response
        resp = {}
        for key in res:
            resp[key] = {
                'coords': res[key],
                'color': to_hex(colors[key]),
                'points': sizes[key],
                'ratio': intersections[key]
            }

        clustering = resp
        return resp
    except Exception as e:
        print(traceback.format_exc())
        return {}

def get_features_clustering_fixed():
    num_features = {}
    cat_features = {}
    date_features = {}
    num_features = {'_CEL_KK_ACTIVITIES': ['_SORTING']}
    cat_features = {'FAHRZEUGE': ['IMPORTEUR', 'DEALER_NO', 'VEHICLE_NO', 'BTYP'],
                    '_CEL_KK_ACTIVITIES': ['ACTIVITY_DE', 'ACTIVITY_EN', 'STATUS', 'LOCATION', 'USERTYPE']}
    date_features = {'_CEL_KK_ACTIVITIES': ['EVENTTIME', 'SOLLDATUM', 'PLANDATUM'],
                     'FAHRZEUGE': ['DATUM', 'SOLLDATUM', 'PLANDATUM']}
    '''cases = case_table # Fahrzeuge
    activities = activity_table
    case_column = '_CASE_KEY'
    for t in [cases, activities]:
        if t.alias:
            t_name = t.alias
        else:
            t_name = t.name
        cols = t.get_columns()
        table_num_col = []
        table_cat_col = []
        table_date_col = []
        for c in cols:
            if c.name != "_CELONIS_CHANGE_DATE" and c.name != case_column:
                if c.type_.value == "INTEGER" or c.type_.value == 'FLOAT':
                    table_num_col.append(c.name)
                elif c.type_.value == 'STRING' or c.type_.value == 'BOOLEAN':
                    table_cat_col.append(c.name)
                elif c.type_.value == 'DATE' or c.type_.value == 'TIME' or c.type_.value == 'DATETIME': 
                    table_date_col.append(c.name)   
        if table_num_col:        
            num_features[t_name] = table_num_col 
        if table_cat_col:           
            cat_features[t_name] = table_cat_col  
        if table_date_col:
            date_features[t_name] = table_date_col'''  
    
    return {'Categorical': cat_features, 'Numerical': num_features, 'Datetime': date_features}

def perform_clustering_fixed():

    global clustering, activity_df, case_assignment, areas
    try:
        alg = manual_alg
        check_celonis()

        if case_table.alias:
            cases = case_table.alias
        else:
            cases = case_table.name

        query = PQL(distinct=False)
        query += PQLColumn(name="CID", query=f""" "{cases}"."{case_column}" """)
        query += OrderByColumn(query=f""" "{cases}"."{case_column}" """)
        result_df = model.export_data_frame(query)

        mlc = MultiLabelBinarizer()

        profiles = result_df

        for table_name in num_selection:
            for feature in num_selection[table_name]:
                    
                query = PQL(distinct=False)
                query += PQLColumn(name="CID", query=f""" "{cases}"."{case_column}" """)
                query += PQLColumn(name=table_name + '::' + feature, query=f""" "{table_name}"."{feature}"  """)
                query += OrderByColumn(query=f""" "{cases}"."{case_column}" """)

                tmp = model.export_data_frame(query)
                tmp = tmp.fillna(0)

                tmp = tmp.groupby('CID').mean()
                col = tmp[table_name + '::' + feature]
                tmp[table_name + '::' + feature] = (col-col.min())/(col.max()-col.min())
                
                profiles = pd.merge(profiles, tmp, on="CID", how="inner")

        for table_name in cat_selection:
            for feature in cat_selection[table_name]:
                    
                query = PQL(distinct=False)
                query += PQLColumn(name="CID", query=f""" "{cases}"."{case_column}" """)
                query += PQLColumn(name="TARGET", query=f""" "{table_name}"."{feature}"  """)
                query += OrderByColumn(query=f""" "{cases}"."{case_column}" """)
                
                tmp = model.export_data_frame(query)
                tmp = tmp.fillna("")
                
                if len(tmp[tmp.duplicated(['CID'], keep=False)]) > 0:
                    # we are not on case level yet, so aggregate to list
                    agg = tmp.groupby('CID').agg(list)
                    #agg['TARGET'] = agg['TARGET'].map(list_to_tuple) # for pairs
                else:
                    # we are on caselevel, just make to lists
                    agg = tmp.groupby('CID').agg(list)
                tmp = pd.DataFrame(mlc.fit_transform(agg['TARGET']), columns=mlc.classes_, index=agg.index).add_prefix(table_name + '::' + feature + '::')
                #tmp = tmp.div(tmp.sum(axis=1), axis=0)
                profiles = pd.merge(profiles, tmp, on="CID", how="inner")

        for table_name in date_selection:
            for feature in date_selection[table_name]:
                    
                query = PQL(distinct=False)
                query += PQLColumn(name="CID", query=f""" "{cases}"."{case_column}" """)
                query += PQLColumn(name=table_name + '::' + feature,
                query=f"""  CALC_THROUGHPUT(ALL_OCCURRENCE['Process Start'] TO ALL_OCCURRENCE['Process End'], REMAP_TIMESTAMPS("{table_name}"."{feature}", DAYS)) """)
                query += OrderByColumn(query=f""" "{cases}"."{case_column}" """)

                tmp = model.export_data_frame(query)
                tmp = tmp.fillna(0)

                tmp = tmp.groupby('CID').mean()
                col = tmp[table_name + '::' + feature]
                tmp[table_name + '::' + feature] = (col-col.min())/(col.max()-col.min())
                
                #tmp = tmp.div(tmp.sum(axis=1), axis=0)
                profiles = pd.merge(profiles, tmp, on="CID", how="inner")

        if alg == "kmeans":
            kmeans = KMeans(n_clusters=k, random_state=2001, n_init="auto").fit(profiles.loc[:, profiles.columns != 'CID'])
            labels = kmeans.labels_
        elif alg == "gauss":
            gmm = GaussianMixture(n_components=k, random_state=2001).fit(profiles.loc[:, profiles.columns != 'CID'])
            labels = gmm.predict(profiles.loc[:, profiles.columns != 'CID'])


        result_df['CLUSTER'] = labels
        
        case_assignment = result_df[['CID', 'CLUSTER']]

        cluster_df = profiles
        cluster_df = cluster_df.loc[:, (cluster_df.columns != 'CID') & (cluster_df.columns != 'CLUSTER')]

        # Dimension reduction
        if dimension_alg == "PCA":
            pca = PCA(2, random_state=2001, svd_solver="full") # for dense tables
        elif dimension_alg == "TSVD":
            pca = TruncatedSVD(2, random_state=2001) # for sparse tables
        elif dimension_alg == "PaCMAP":
            pca = PaCMAP(2, distance="hamming", random_state=2001) # maintains local and global relations
        pca_data = None
        print("Used:", type(pca))
        if isinstance(pca, PaCMAP):
            pca_data = pd.DataFrame(pca.fit_transform(
                cluster_df, init="pca"), columns=['PC1', 'PC2'])
        else:
            pca_data = pd.DataFrame(pca.fit_transform(
                cluster_df), columns=['PC1', 'PC2'])
        
        pca_data['cluster'] = pd.Categorical(result_df.CLUSTER)

        # Plotting
        pca_plot = pca_data.loc[pca_data['cluster'] != -1]

        # No clusters found
        if len(pca_plot) == 0:
            return {}
        
        shapes = []
        for cluster_id in range(max(pca_plot['cluster'])+1):
            pca_sub = pca_data.loc[pca_data['cluster'] == cluster_id]
            if isinstance(pca, PaCMAP):
                try:
                    alpha_shape = alpha.alphashape(pca_sub[['PC1','PC2']], 0.25)
                except:
                    alpha_shape = alpha.alphashape(pca_sub[['PC1','PC2']] + np.random.normal(0, 0.01, [len(pca_sub),2]), 0.25)
            else:
                try:
                    alpha_shape = alpha.alphashape(pca_sub[['PC1','PC2']], 5)
                except:
                    # Alpha shape needs some noise because of singularities
                    alpha_shape = alpha.alphashape(pca_sub[['PC1','PC2']] + np.random.normal(0, 0.01, [len(pca_sub),2]), 5)
            shapes.append(alpha_shape)
            
        res = {}
        colors = {}
        sizes = {}
        areas = []
        cmap = colormaps['hsv']
        for cluster_id in range(len(shapes)): # https://stackoverflow.com/questions/75287534/indexerror-descartes-polygonpatch-wtih-shapely   in C:\\Users\\phil-\\anaconda3\\lib\\site-packages\\descartes
            shape = shapes[cluster_id]
            sub_shapes = []
            pca_sub = pca_data.loc[pca_data['cluster'] == cluster_id]
            if not isinstance(shape, MultiPolygon):
                sub_shapes = [shape]
            else:
                sub_shapes = list(shape.geoms)
            print("Cl.", cluster_id, "-", "Points:", len(pca_sub['PC1']), "Shapes:", len(sub_shapes))
            print("Area:", [sub_shape.buffer(0.5, join_style=1).buffer(-0.5, join_style=1).area for sub_shape in sub_shapes])
            sub_shapes.sort(key=lambda x: x.buffer(0.5, join_style=1).buffer(-0.5, join_style=1).area, reverse=True)
            #for sub_shape in sub_shapes:
            sub_shape = sub_shapes[0].buffer(0.5, join_style=1).buffer(-0.5, join_style=1)
            sub_shape = sub_shape.buffer(0.5, join_style=1).buffer(-0.5, join_style=1)
            if isinstance(sub_shape, MultiPolygon):
                sub_shape.sort(key=lambda x: x.area, reverse=True)
                sub_shape = list(sub_shape.geoms)[0]
            print(type(sub_shape))
            res[cluster_id] = sub_shape
            colors[cluster_id] = cmap(cluster_id/(max(pca_plot['cluster'])+0.01)*0.9)
            sizes[cluster_id] = len(pca_sub['PC1'])
            areas.append(sub_shape.area)
        
        intersections = {}
        
        for i in range(len(res)):
            intersection = 0
            shape1 = res[i]
            for j in range(len(res)):
                if i == j:
                    continue
                shape2 = res[j]
                intersection += shape1.intersection(shape2).area
            intersections[i] = max([1 - intersection/(shape1.area),0])
            print("Quality of", i, intersections[i])

        for key in res:
            res[key] = [[x[1],x[0]] for x in list(res[key].exterior.coords)]
        
        # Create response
        resp = {}
        for key in res:
            resp[key] = {
                'coords': res[key],
                'color': to_hex(colors[key]),
                'points': sizes[key],
                'ratio': intersections[key]
            }

        clustering = resp
        return resp
    except Exception as e:
        print(traceback.format_exc())
        return {}
    
def get_dfg(cluster_id):
    """
    Reads the activity data for one cluster and computes the dfg.

    Args:
        cluster_id: The id of the cluster for which the dfg should be computed.

    Returns:
        A dictionary of the form {Nodes: [list of nodes], Edges: [{from: "", to: "", label: ""}]}.    
    """
    #Handle aliasing
    if case_table.alias:
        cases = case_table.alias
    else:
        cases = case_table.name
    
    if activity_table.alias:
        activities = activity_table.alias
    else:
        activities = activity_table.name

    real_activity_column = model.get_process_configurations()[0].activity_column  

    #Query Cluster, Case ID, Activity and Timestamp information
    query = PQL(distinct=False)
    query += PQLColumn(name="Activity",
                    query=f"""  "{activities}"."{real_activity_column}" """)
    query += PQLColumn(name="Timestamp",
                    query=f"""  "{activities}"."{timestamp_column}" """)
    query += PQLColumn(name="CID",
                    query=f"""  "{cases}"."{case_column}" """)
    result_df = model.export_data_frame(query)
    result_df = pd.merge(result_df, case_assignment, on="CID", how="inner")

    #Filter on cluster
    cluster_id = int(cluster_id)
    result_df = result_df[result_df["CLUSTER"] == cluster_id]

    dfg_perf, start_activities_perf, end_activities_perf = pm4py.discover_performance_dfg(result_df, case_id_key='CID', activity_key='Activity', timestamp_key='Timestamp')
    dfg, start_activities, end_activities = pm4py.discover_dfg(result_df, case_id_key='CID', activity_key='Activity', timestamp_key='Timestamp')

    #Get nodes and edges of DFG
    nodes = result_df["Activity"].unique().tolist()
    nodes.append("Process Start")
    nodes.append("Process End")
    edges = []
    for key in dfg:
        perf = {}
        for value in dfg_perf[key]:
            perf[value] = str(dfg_perf[key][value])
        edges.append({'from': key[0], 'to': key[1], 'frequency': int(dfg[key]), 'performance': perf}) 
    for key2 in start_activities:
        edges.append({'from': "Process Start", 'to': key2, 'frequency': int(start_activities[key2]), 'performance': {'mean': " ", 'median': " ", 'max': " ", 'min': " ", 'sum': " ", 'stdev': " "}})
    for key3 in end_activities:
        edges.append({'from': key3, 'to': "Process End", 'frequency': int(end_activities[key3]), 'performance': {'mean': " ", 'median': " ", 'max': " ", 'min': " ", 'sum': " ", 'stdev': " "}})  

    result = {"Nodes": nodes, "Edges": edges}
    return result                    

def get_features():
    """
    Reads all columns from tables that are connected to the case table and groups them into numerical categorical or datetime features.

    Returns:
        A dictionary of form {Categorical: table_name --> list of features, Numerical: table_name --> list of features, Datetime: table_name --> list of features}.
    """

    #Find all tables connected to the case table
    '''connected_tables = [case_table.id]
    not_visited = [case_table.id]        
    for_keys = model.get_foreign_keys()
    while not_visited:
        curr_table = not_visited.pop()
        for k in for_keys:
            if k.source_table_id == curr_table:
                conn_table = k.target_table_id
                if conn_table not in connected_tables:
                    connected_tables.append(conn_table)
                    not_visited.append(conn_table)
            if k.target_table_id == curr_table:
                conn_table = k.source_table_id
                if conn_table not in connected_tables:
                    connected_tables.append(conn_table)
                    not_visited.append(conn_table)

    #Extract columns from each table
    num_features = {}
    cat_features = {}
    date_features = {}               
    for t in tables:
        if t.id in connected_tables: 
            if t.alias:
                t_name = t.alias
            else:
                t_name = t.name
            cols = t.get_columns()
            table_num_col = []
            table_cat_col = []
            table_date_col = []
            for c in cols:
                if c.name != "_CELONIS_CHANGE_DATE" and c.name != case_column:
                    if c.type_.value == "INTEGER" or c.type_.value == 'FLOAT':
                        table_num_col.append(c.name)
                    elif c.type_.value == 'STRING' or c.type_.value == 'BOOLEAN':
                        table_cat_col.append(c.name)
                    elif c.type_.value == 'DATE' or c.type_.value == 'TIME' or c.type_.value == 'DATETIME': 
                        table_date_col.append(c.name)   
            if table_num_col:        
                num_features[t_name] = table_num_col 
            if table_cat_col:           
                cat_features[t_name] = table_cat_col  
            if table_date_col:
                date_features[t_name] = table_date_col          
    features = {'Categorical': cat_features, 'Numerical': num_features, 'Datetime': date_features}'''
    features=  {'Categorical': {'MissingMaterials': ['MISSING MATERIALS'], 'MAERKTE': ['IMPORTEUR', 'DEALER_NO', 'PAG_REGIONTEXTEN', 'COUNTRY_ISO_NAME', 'DEALERTEXTEN'], 'Material_xlsx_Sheet1': ['Material'], 'Country_Codes': ['COUNTRY_ISO_NAME'], 'MODELLE': ['MODELTYPEID', 'VEHICLECLASSTEXT_DE', 'MODELSERIESTEXT_DE', 'VEHICLEGROUPTEXT_DE', 'VEHICLETYPETEXT_DE', 'GENERATIONTEXT_DE'], '_CEL_KK_ACTIVITIES': ['ACTIVITY_DE', 'ACTIVITY_EN', 'STATUS', 'LOCATION', 'USERTYPE'], 'OTD_PREDICTION2': ['LABEL', 'CLASSIFICATION'], 'FAHRZEUGE': ['IMPORTEUR', 'DEALER_NO', 'VEHICLE_NO', 'BTYP'], 'New_Materials_DeliveryBlocked_and_ExpressShipment_xlsx_Sheet1': ['MODELSERIESTEXT_DE', 'MATERIAL_MISSING']}, 'Numerical': {'Country_Codes': ['COUNTRY_ISO_NUM', 'Case count'], '_CEL_KK_ACTIVITIES': ['_SORTING'], 'OTD_PREDICTION2': ['EXCLUDED', 'FITTED', 'TESTED', 'CLASSIFIED', 'PUNCTUAL', 'NOT_PUNCTUAL'], 'Value': ['NET ORDER VALUE']}, 'Datetime': {'_CEL_KK_ACTIVITIES': ['EVENTTIME', 'SOLLDATUM', 'PLANDATUM'], 'FAHRZEUGE': ['DATUM', 'SOLLDATUM', 'PLANDATUM']}}

    return features
             
def get_num_feature(table_name, column_name, intermediate_agg=None):
    """
    Reads the value of a numerical feature (numerical column) aggregated per cluster by taking the mean.

    Args:
        table_name: The name of the table that is queried.
        column_name: The name of the column that is queried.
        intermediate_agg: In case there are multiple values per case this value determines if and how the values should be first aggregated by case level: Possible aggregations: SUM, AVG, None

    Returns:
        A dictionary of form cluster_id --> mean column value per cluster. The dictionary additionally has a value for the overall mean over all clusters, with the key 'overall'.
    """

    # Handle aliasing
    if case_table.alias:
        cases = case_table.alias
    else:
        cases = case_table.name
    
    if activity_table.alias:
        activities = activity_table.alias
    else:
        activities = activity_table.name
    
    # Get clustering
    query = PQL(distinct=False)
    query += PQLColumn(name="CID",
                       query=f""" "{cases}"."{case_column}" """)
    # query += PQLColumn(name="CLUSTER",
    #                    query=f""" CLUSTER_VARIANTS ( VARIANT ( "{activities}"."{activity_column}" ) , {min_pts}, {epsilon}) """)
    query += PQLColumn(name="TARGET",
                       query=f"""  "{table_name}"."{column_name}" """)
    query += OrderByColumn(query=f""" "{cases}"."{case_column}" """)
    try:
        result_df = model.export_data_frame(query)
        result_df = pd.merge(result_df, case_assignment, on="CID", how="inner")
    except:
        raise ValueError("Not valid table or column name")
    
    if not np.issubdtype(result_df['TARGET'].dtype, np.number):
        raise TypeError("Column is not of numerical format")

    result_df['CLUSTER'] = result_df['CLUSTER'].astype(str)

    #First aggregate by cases, if there is a method specified, in case there are multiple values per case
    if intermediate_agg == 'SUM':
        result_df = result_df.groupby('CID').aggregate({'CLUSTER':'first','TARGET':np.sum}).reset_index()
    elif intermediate_agg == 'AVG':
        result_df = result_df.groupby('CID').aggregate({'CLUSTER':'first','TARGET':np.mean}).reset_index()

    #Aggregate by cluster
    overallMean = result_df['TARGET'].mean()
    agg_df = result_df.groupby('CLUSTER').aggregate({'TARGET':np.mean})  

    result = agg_df.to_dict()['TARGET']
    result['overall'] = overallMean

    return result     

def get_cat_feature(table_name, column_name):
    """
    Reads the value of a categorical feature by counting how often each value of the column occurs per cluster.

    Args:
        table_name: The name of the table that is queried.
        column_name: The name of the column that is queried.

    Returns:
        A dictionary of form: feature_value --> {cluster_id --> count}. Cases classified as noise are ignored.
    """

    # Handle aliasing
    if case_table.alias:
        cases = case_table.alias
    else:
        cases = case_table.name
    
    if activity_table.alias:
        activities = activity_table.alias
    else:
        activities = activity_table.name
    
    # Get clustering
    query = PQL(distinct=False)
    query += PQLColumn(name="CID",
                       query=f""" "{cases}"."{case_column}" """)
    # query += PQLColumn(name="CLUSTER",
    #                    query=f""" CLUSTER_VARIANTS ( VARIANT ( "{activities}"."{activity_column}" ) , {min_pts}, {epsilon}) """)
    query += PQLColumn(name="TARGET",
                       query=f"""  "{table_name}"."{column_name}" """)
    try:
        result_df = model.export_data_frame(query)
        result_df = pd.merge(result_df, case_assignment, on="CID", how="inner")
        result_df = result_df.drop('CID', axis=1)
    except:
        raise ValueError("Not valid table or column name")
    
    if result_df["TARGET"].dtype != "object":
        raise TypeError("Column is not of categorical format")
    
    result_df['CLUSTER'] = result_df['CLUSTER'].astype(str)
    result_df = result_df[result_df['CLUSTER'] != "-1"]

    #Transform dataframe such that the feature_value is the index and we have a column for each cluster counting the occurrence
    agg_df = result_df.value_counts(['CLUSTER', 'TARGET']).reset_index(name='count')
    agg_df = agg_df.pivot(index='TARGET', columns='CLUSTER', values='count')
    agg_df = agg_df.fillna(0)

    #In case there are too much feature values only take the 250 most frequent
    if len(agg_df.index) > 250:
        sorted_df = agg_df.assign(sum=agg_df.sum(axis=1)).sort_values(by='sum', ascending=False).iloc[:, :-1]
        agg_df = sorted_df.head(250)

    result = agg_df.to_dict('index')

    return result

def get_date_feature(table_name, column_name):
    """
    Reads the value of a datetime feature by looking at the first and last occurrence.

    Args:
        table_name: The name of the table that is queried.
        column_name: The name of the column that is queried.

    Returns:
        A dictionary of form: cluster_id --> {START --> first_date, END --> last_date}. Cases classified as noise are ignored.
    """

    # Handle aliasing
    if case_table.alias:
        cases = case_table.alias
    else:
        cases = case_table.name
    
    if activity_table.alias:
        activities = activity_table.alias
    else:
        activities = activity_table.name
    
    # Get clustering
    query = PQL(distinct=False)
    # query += PQLColumn(name="CID",
    #                    query=f""" "{cases}"."{case_column}" """)
    query += PQLColumn(name="CID",
                       query=f""" "{cases}"."{case_column}" """)
    # query += PQLColumn(name="CLUSTER",
    #                 query=f""" CLUSTER_VARIANTS ( VARIANT ( "{activities}"."{activity_column}" ) , {min_pts}, {epsilon}) """)
    query += PQLColumn(name="START",
                    query=f"""  MIN("{table_name}"."{column_name}") """)
    query += PQLColumn(name="END",
                    query=f"""  MAX("{table_name}"."{column_name}") """)
    try:
        result_df = model.export_data_frame(query)
        result_df = pd.merge(result_df, case_assignment, on="CID", how="inner")
        result_df = result_df.drop('CID', axis=1)
        result_df['CLUSTER'] = result_df['CLUSTER'].astype(str)
        # result_df = pd.merge(result_df, case_assignment, on="CID", how="inner")
        # result_df = result_df.drop('CID', axis=1)
    except:
        raise ValueError("Not valid table or column name")
    
    if not np.issubdtype(result_df["START"].dtype, np.datetime64):
        raise TypeError("Column is not of datetime format")

    result_df = result_df[result_df['CLUSTER'] != "-1"]

    result_df['CLUSTER'] = result_df['CLUSTER'].astype(str)    
    result_df = result_df.groupby('CLUSTER').aggregate({'START':np.min,'END':np.max}).reset_index()
    result_df = result_df.set_index('CLUSTER')
    result = result_df.to_json(orient='index')
    return result

def get_throughput_time():
    """
    Reads the value of the throughput time by looking at the mean per cluster.

    Returns:
        A dictionary of form cluster_id --> mean column value per cluster. The dictionary additionally has a value for the overall mean over all clusters, with the key 'overall'.
    """

    if case_table.alias:
        cases = case_table.alias
    else:
        cases = case_table.name

    if activity_table.alias:
        activities = activity_table.alias
    else:
        activities = activity_table.name

    # Get clustering
    query = PQL(distinct=False)
    query += PQLColumn(name="CID",
                       query=f""" "{cases}"."{case_column}" """)
    # query += PQLColumn(name="CLUSTER",
    #                    query=f""" CLUSTER_VARIANTS ( VARIANT ( "{activities}"."{activity_column}" ) , {min_pts}, {epsilon}) """)
    query += PQLColumn(name="THROUGHPUT TIME",
                       query=f"""  CALC_THROUGHPUT(ALL_OCCURRENCE['Process Start'] TO ALL_OCCURRENCE['Process End'], REMAP_TIMESTAMPS("{activities}"."{timestamp_column}", DAYS)) """)
    result_df = model.export_data_frame(query)

    result_df = pd.merge(result_df, case_assignment, on="CID", how="inner")
    result_df = result_df.drop('CID', axis=1)
    result_df['CLUSTER'] = result_df['CLUSTER'].astype(str)

    overallMean = result_df['THROUGHPUT TIME'].mean()
    agg_df = result_df.groupby('CLUSTER').aggregate({'THROUGHPUT TIME':np.mean})

    result = agg_df.to_dict()['THROUGHPUT TIME']
    result['overall'] = overallMean

    return result          

def check_celonis():
    """
    Checks if the initialization is likely to be done before.

    Raises:
        TypeError: The Celonis object is not initialized.
    """
    if not celonis:
        raise TypeError("Celonis not initialized.")


def summary_extraction():
    """
    Collects the number of clusters, the average cluster size, and the average number of distinct activities per cluster.

    Returns:
        A dict of the form property --> value describing the three KPIs.
    """
    if clustering == None:
        return {}

    check_celonis()

    if dbscan:
        activity_df_filter = activity_df[activity_df['CLUSTER'] > -1]
        
        num_cluster = [key for key in clustering]
        number_of_clusters = len(num_cluster)

        number_of_cases = []
        length_of_cases = []
        
        for i in [int(x) for x in list(activity_df_filter['CLUSTER'].unique())]:
            
            length_of_cases.append(len(activity_df_filter[activity_df_filter['CLUSTER'] == i]['ACTIVITIES'].unique()))
            
            number_of_cases.append(clustering[i]['points'])

        
        avg_number_distint_activities_per_cluster = sum(length_of_cases)/len(length_of_cases)

        avg_number_of_cases_per_cluster = sum(number_of_cases)/len(number_of_cases)



        return {
                    'number_of_clusters': number_of_clusters,
                    'avg_number_distint_activities_per_cluster': avg_number_distint_activities_per_cluster,
                    'avg_number_of_cases_per_cluster': avg_number_of_cases_per_cluster
                }
    else:
        number_of_clusters = len(clustering)

        sum_points = 0
        for key in clustering:
            sum_points += clustering[key]['points']
        avg_number_of_cases_per_cluster = sum_points / number_of_clusters

        return {
                    'number_of_clusters': number_of_clusters,
                    'avg_number_distint_activities_per_cluster': 0,
                    'avg_number_of_cases_per_cluster': avg_number_of_cases_per_cluster
                }

def export():
    """
    Collects the clustering information of the current clustering and saves it.
    """
    compression = {'pool': pool.id,
                   'model': model.id,
                   'activity_column': activity_column,
                   'dbscan': dbscan,
                   'epsilon': epsilon,
                   'min_pts': min_pts,
                   'dimension_alg': dimension_alg,
                   'num_selection': num_selection,
                   'cat_selection': cat_selection,
                   'date_selection': date_selection,
                   'manual_alg': manual_alg,
                   'k': k,
                   # Information
                   'pool_name': pool.name,
                   'model_name': model.name,
                   'log_size': get_size(),
                   'clusters': len(clustering)
                   } 
    try:
        os.makedirs("./results")
    except FileExistsError:
        # directory already exists
        pass
        
    with open('./results/' + str(current_milliseconds()) + '.json', 'w', encoding='utf-8') as f:
        json.dump(compression, f, ensure_ascii=False, indent=4)

def export_list():
    """
    Reads the collected clusterings and delivers their summaries.

    Returns:
        A dict of the form cluster ID --> description.
    """
    res = {}
    files = Path('./results').glob('*.json')
    for f in files:
        f2 = FileIO(Path(f).absolute(), "rb")
        compression = json.load(f2)
        res[f.stem] = {'pool_name': compression['pool_name'],
                       'model_name': compression['model_name'],
                       'log_size': compression['log_size'],
                       'clusters': compression['clusters']}
    return res


def load(timestamp):
    """
    Reads the clustering information of the provided ID and restores the state.

    Args:
        timestamp: The ID of the clustering to be loaded.
    """
    global dbscan, num_selection, cat_selection, date_selection
    with open('./results/' + str(timestamp) + '.json') as f:
        compression = json.load(f)

        # setup needs already to be done
        get_data_pools()
        get_data_models(compression['pool'])
        get_process_config(compression['model'])
        set_cluster_column(compression['activity_column'])
        dbscan = bool(compression['dbscan'])
        set_epsilon(compression['epsilon'])
        set_min_pts(compression['min_pts'])
        set_dimension_alg(compression['dimension_alg'])
        num_selection = compression['num_selection']
        cat_selection = compression['cat_selection']
        date_selection = compression['date_selection']
        set_manual_alg(compression['manual_alg'])
        set_manual_k(compression['k'])

        # call clustering afterwards