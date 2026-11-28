import json, urllib.request, pandas as pd, sys, os, io
OUT=os.path.dirname(os.path.abspath(__file__))+'/data'; os.makedirs(OUT,exist_ok=True)
H={'User-Agent':'Mozilla/5.0'}
def yahoo(sym, rng='15y'):
    u=f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(sym)}?range={rng}&interval=1d"
    j=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30))
    r=j['chart']['result'][0]; q=r['indicators']['quote'][0]
    adj=r['indicators'].get('adjclose',[{}])[0].get('adjclose')
    s=pd.Series(q['close'],index=pd.to_datetime(r['timestamp'],unit='s').normalize(),name=sym)
    a=pd.Series(adj,index=s.index) if adj else s
    return pd.DataFrame({'close':s,'adj':a}).dropna()
import urllib.parse
syms=['XLI','XLP','XLF','XLY','XLK','XLB','XLC','XLU','XLV','XLE','XLRE','^GSPC','^NDX','^DJI','^VIX','^TNX','2YY=F','^IRX','HYG','RSP','SPY','^SOX','QQQ','IWM']
for s in syms:
    try:
        df=yahoo(s); df.to_csv(f"{OUT}/{s.replace('^','_').replace('=','_')}.csv"); print(s,len(df),df.index[-1].date(),round(df.close.iloc[-1],3))
    except Exception as e: print('ERR',s,e)
# OECD CLI
for area in ['G7','G20','USA']:
    u=f"https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI,4.1/{area}.M.LI...AA...H?startPeriod=2018-01&format=csvfilewithlabels"
    try:
        t=urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=40).read().decode()
        open(f"{OUT}/CLI_{area}.csv",'w').write(t); d=pd.read_csv(io.StringIO(t)); print('CLI',area,d[['TIME_PERIOD','OBS_VALUE']].tail(3).values.tolist())
    except Exception as e: print('ERR CLI',area,e)
