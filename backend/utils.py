import time

def list_of_pairs(x):
    x_split = x.split(',')
    res = []
    for i in range(len(x_split)-1):
        res.append((x_split[i], x_split[i+1]))
    return res

def cm2inch(*tupl):
    inch = 2.54
    if isinstance(tupl[0], tuple):
        return tuple(i/inch for i in tupl[0])
    else:
        return tuple(i/inch for i in tupl)

def rand_jitter(arr):
    stdev = 0
    if isinstance(pca, PaCMAP):
        stdev = .006 * (max(arr) - min(arr))
    else:
        stdev = .05 * (max(arr) - min(arr))
    return arr + np.random.randn(len(arr)) * stdev

def current_milliseconds():
    return round(time.time() * 1000)