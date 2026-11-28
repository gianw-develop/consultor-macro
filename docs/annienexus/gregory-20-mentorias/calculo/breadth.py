import json, urllib.request, urllib.parse, pandas as pd, io, os, concurrent.futures as cf, time
D=os.path.dirname(os.path.abspath(__file__))+'/data/'
H={'User-Agent':'Mozilla/5.0'}
cons=pd.read_csv(io.StringIO(urllib.request.urlopen(urllib.request.Request("https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv",headers=H),timeout=30).read().decode()))
syms=[s.replace('.','-') for s in cons['Symbol']]
def get(s):
    for k in range(3):
        try:
            u=f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(s)}?range=5y&interval=1d"
            r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30))['chart']['result'][0]
            return s,pd.Series(r['indicators']['quote'][0]['close'],index=pd.to_datetime(r['timestamp'],unit='s').normalize())
        except Exception as e: time.sleep(1+k)
    return s,None
out={}
with cf.ThreadPoolExecutor(8) as ex:
    for s,ser in ex.map(get,syms):
        if ser is not None: out[s]=ser[~ser.index.duplicated()]
px=pd.DataFrame(out).sort_index(); px.to_csv(D+'sp500_px.csv'); print('ok',px.shape, px.index[-1].date())
