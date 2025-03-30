import unittest
import sys
sys.path.insert(0, '..')
import clustering as cl

class Test(unittest.TestCase):
    key = ['https://group-2.try.celonis.cloud/', 'ZjY2MjAyMzItYjRlZC00ZTZmLTg1ODEtMThjZTYzMzk2YzExOnFzSXNwaWw1VU1EUUNlQlVjMENVclc3TFdUWTFFSUFESnY5RElkbXA4MGFw', 'APP_KEY']
    pool_id = '9ef7cb4d-4185-4a60-b944-fa91ae992f1c'
    model_id = '3fa86a55-71cc-4907-bccb-63ad117faab1'
    activity_column = 'ACTIVITY_EN'
    case_column = '_CASE_KEY'
    activity_table_id = 'a2bdf0a5-e316-49ec-9ec4-cfab433860a2'
    case_table_id = 'c2652480-1883-430e-b1d2-0e07ab302bfa'

    def test_setup_with_wrong_key(self):
        cl.celonis = None
        self.assertRaises(Exception, cl.setup, ['https://group-2.try.celonis.cloud/', 'ZjY2MjAyMzItYjRlZC00ZTZmLTg1ODEtMThjZTYzMzk2YzExOnFzSXNwaWw1VU1EUUNlQlVjMENVclc3TFdUWTFFSUFESnY5RElkbXA4MGFW', 'APP_KEY'])

    def test_setup_with_correct_key(self):
        cl.celonis = None
        try:
            cl.setup(self.key)
        except Exception:
            self.fail("Cannot instantiate Celonis object although correct key!")
        self.assertIsNotNone(cl.celonis)
    
    def test_get_pools_with_celonis_obj(self):
        cl.setup(self.key)
        try:
            res = cl.get_data_pools()
        except Exception:
            self.fail("Cannot load data pools although Celonis instance was created!")
        self.assertGreater(len(res), 0)
    
    def test_get_pools_without_celonis_obj(self):
        cl.celonis = None
        self.assertRaises(Exception, cl.get_data_pools)
    
    def test_get_data_models_pools_existing_pool_id(self):
        cl.setup(self.key)
        cl.get_data_pools()
        try:
            res = cl.get_data_models(self.pool_id)
        except Exception:
            self.fail("Cannot load data models although Celonis instance was created and pools are loaded!")
        self.assertGreater(len(res), 0)
        self.assertIsNotNone(cl.pool)
    
    def test_get_data_models_pools_wrong_pool_id(self):
        cl.setup(self.key)
        cl.get_data_pools()
        self.assertRaises(Exception, cl.get_data_models, '9ef7cb4d-4185-4a60-b944-fa91ae992f1C')
    
    def test_get_process_config_existing_model_id(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        try:
            res = cl.get_process_config(self.model_id)
            cl.set_cluster_column(self.activity_column)
        except Exception:
            self.fail("Cannot load process config although Celonis instance was created, pools are loaded, and model is selected!")
        self.assertEqual(len(res), 7)
        self.assertEqual(cl.activity_column, self.activity_column)
        self.assertEqual(cl.case_column, self.case_column)
        self.assertEqual(cl.activity_table_id, self.activity_table_id)
        self.assertEqual(cl.case_table_id, self.case_table_id)
        self.assertIsNotNone(cl.model)
    
    def test_get_process_config_wrong_model_id(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        self.assertRaises(Exception, cl.get_process_config, '3fa86a55-71cc-4907-bccb-63ad117faab2')
    
    def test_get_size(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        res = cl.get_size()
        self.assertEqual(res, "58238")
    
    def test_set_min_pts(self):
        cl.set_min_pts(12345)
        self.assertEqual(cl.min_pts, 12345)
    
    def test_set_epsilon(self):
        cl.set_epsilon(4)
        self.assertEqual(cl.epsilon, 4)
    
    def test_set_dim_alg(self):
        cl.set_dimension_alg("TEST")
        self.assertEqual(cl.dimension_alg, "TEST")
    
    def test_get_min_pts(self):
        cl.min_pts = 12345
        res = cl.get_min_pts()
        self.assertEqual(res, "12345")
    
    def test_get_epsilon(self):
        cl.epsilon = 4
        res = cl.get_epsilon()
        self.assertEqual(res, "4")
    
    def test_get_dim_alg(self):
        cl.dimension_alg = "TEST"
        res = cl.get_dimension_alg()
        self.assertEqual(res, "TEST")
    
    def test_perform_clustering_dbscan_correct_settings(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        cl.epsilon = 3
        cl.min_pts = 579
        cl.dimension_alg = "TSVD"
        try:
            res = cl.perform_clustering_dbscan()
        except Exception:
            self.fail("Cannot perform clustering although all data available")
        self.assertEqual(len(res), 10)
        for key in res:
            self.assertEqual(len(res[key]), 4)
    
    def test_perform_clustering_dbscan_incorrect_settings(self):
        # for example with an inconsistent MIN_PTS value
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        cl.epsilon = 3
        cl.min_pts = 10e7
        cl.dimension_alg = "TSVD"
        try:
            res = cl.perform_clustering_dbscan()
        except Exception:
            self.fail("Cannot perform clustering although all data available")
        self.assertEqual(len(res), 0)

    def test_summary_extraction(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        cl.epsilon = 3
        cl.min_pts = 579
        cl.dimension_alg = "TSVD"
        cl.perform_clustering_dbscan()
        try:
            res = cl.summary_extraction()
        except Exception:
            self.fail("Cannot perform summary extraction although all data available")
        self.assertEqual(len(res), 3)

    """    
    def def test_get_features(self)::
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        try:
            res = cl.get_features()
        except Exception:
            self.fail("Cannot get features even though all data available")       
        self.assertGreater(len(res), 0)
    """

    def test_get_num_feature_correct_settings(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        cl.epsilon = 3
        cl.min_pts = 579
        cl.perform_clustering_dbscan()
        try:
            res = cl.get_num_feature("Value", "NET ORDER VALUE", None)
        except:
            self.fail("Cannot get feature values even though all data available")    
        self.assertEqual(len(res), 12)
        self.assertGreater(res['overall'], 100)

    def test_get_num_feature_not_real_table(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        self.assertRaises(ValueError, cl.get_num_feature, "table", "column", None)

    def test_get_num_feature_wrong_column_type(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        self.assertRaises(TypeError, cl.get_num_feature, "FAHRZEUGE", "IMPORTEUR", None)

    def test_get_cat_feature_correct_settings(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        cl.epsilon = 3
        cl.min_pts = 579
        cl.perform_clustering_dbscan()
        try:
            res = cl.get_cat_feature("_CEL_KK_ACTIVITIES", "ACTIVITY_EN")
        except:
            self.fail("Cannot get feature values even though all data available")    
        self.assertEqual(len(res), 29)

    def test_get_cat_feature_not_real_table(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        self.assertRaises(ValueError, cl.get_cat_feature, "table", "column")

    def test_get_cat_feature_wrong_column_type(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        self.assertRaises(TypeError, cl.get_cat_feature, "Value", "NET ORDER VALUE")

    def test_get_date_feature_correct_settings(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        cl.epsilon = 3
        cl.min_pts = 579
        cl.perform_clustering_dbscan()
        try:
            res = cl.get_date_feature("_CEL_KK_ACTIVITIES", "EVENTTIME")
        except:
            self.fail("Cannot get feature values even though all data available")    
        self.assertIsNotNone(res)
        self.assertGreater(len(res[0]), 0)

    def test_get_date_feature_not_real_table(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        self.assertRaises(ValueError, cl.get_date_feature, "table", "column")

    def test_get_cat_feature_wrong_column_type(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        self.assertRaises(TypeError, cl.get_date_feature, "Value", "NET ORDER VALUE")   

    def test_get_throughput_time(self):
        cl.setup(self.key)
        cl.get_data_pools()
        cl.get_data_models(self.pool_id)
        cl.get_process_config(self.model_id)
        cl.set_cluster_column(self.activity_column)
        cl.epsilon = 3
        cl.min_pts = 579
        cl.perform_clustering_dbscan()
        try:
            res = cl.get_throughput_time()
        except:
            self.fail("Cannot get feature values even though all data available")    
        self.assertGreater(res['overall'], 100)
        self.assertEqual(len(res), 12)          

if __name__ == '__main__':
    unittest.main()