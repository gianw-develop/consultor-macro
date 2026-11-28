import json, urllib.request, urllib.parse, pandas as pd, os, concurrent.futures as cf
D=os.path.dirname(os.path.abspath(__file__))+'/data/'
H={'User-Agent':'Mozilla/5.0'}
def get(s,rng='2y'):
    u=f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(s)}?range={rng}&interval=1d"
    r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30))['chart']['result'][0]
    x=pd.Series(r['indicators']['quote'][0]['close'],index=pd.to_datetime(r['timestamp'],unit='s').normalize()); return s,x[~x.index.duplicated()]
dow=['AAPL','AMGN','AMZN','AXP','BA','CAT','CRM','CSCO','CVX','DIS','GS','HD','HON','IBM','JNJ','JPM','KO','MCD','MMM','MRK','MSFT','NKE','NVDA','PG','SHW','TRV','UNH','V','VZ','WMT']
with cf.ThreadPoolExecutor(8) as ex: px=pd.DataFrame(dict(ex.map(get,dow+['^DJI','QQQ','QQEW','RSP','SPY','DIA']))).sort_index()
px.to_csv(D+'dow_px.csv')
ratio=(px['^DJI']/px[dow].sum(1)).dropna()
m=ratio.resample('ME').last()
print('Divisor implícito (Dow / suma de precios), fin de mes:'); print(m.tail(14).round(6).to_string())
