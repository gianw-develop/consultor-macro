import pandas as pd, numpy as np, os, io, json, urllib.request
D=os.path.dirname(os.path.abspath(__file__))+'/data/'
def c(s): return pd.read_csv(D+s+'.csv',index_col=0,parse_dates=True)['close'].dropna()
R={}
spx=c('_GSPC')
# --- Rotation weekly ROC5
def wk(s): return s.resample('W-FRI').last().dropna()
roc5={}
for a in ['XLI','XLF']:
    r=wk(c(a)/c('XLP')); roc5[a]=(r/r.shift(5)-1)*100
R['roc5']={a:[round(v,2) for v in roc5[a].tail(6)] for a in roc5}
both=(roc5['XLI']<=-10)&(roc5['XLF']<=-10)
wspx=wk(spx)
print('ROC5 semanal (últimas 6 semanas):',R['roc5'])
print('Mínimo ROC5 últimas 8 semanas XLI',round(roc5['XLI'].tail(8).min(),2),'XLF',round(roc5['XLF'].tail(8).min(),2))
# episodes: first week of each cluster where both <=-10 within same week; also within 4-week window
def episodes(mask,gap=8):
    idx=list(mask[mask].index); eps=[]
    for d in idx:
        if not eps or (d-eps[-1][-1]).days>gap*7: eps.append([d])
        else: eps[-1].append(d)
    return [e[0] for e in eps]
def fwd(d):
    p=spx.loc[:d].iloc[-1]; out={}
    for m in [1,3,6,12]:
        f=spx.loc[d:d+pd.DateOffset(months=m)]
        out[f'{m}m']=round((f.iloc[-1]/p-1)*100,1) if len(f)>5 and f.index[-1]>=d+pd.DateOffset(months=m)-pd.DateOffset(days=7) else None
    f=spx.loc[d:d+pd.DateOffset(months=6)]; out['maxDD6m']=round((f.min()/p-1)*100,1)
    hi=spx.loc[:d].iloc[-260:].max(); out['desdeMax52s']=round((p/hi-1)*100,1)
    return out
print('\nEPISODIOS ambos ROC5 semanales <= -10 (misma semana):')
for d in episodes(both): print(' ',d.date(),fwd(d))
# within 4 weeks window
w4=(roc5['XLI'].rolling(4).min()<=-10)&(roc5['XLF'].rolling(4).min()<=-10)
print('EPISODIOS ambos <= -10 dentro de 4 semanas:')
for d in episodes(w4): print(' ',d.date(),fwd(d))
# monthly ROC12 XLI/XLP
m=(c('XLI')/c('XLP')).resample('ME').last(); roc12=(m/m.shift(12)-1)*100
print('\nXLI/XLP ROC12 mensual últimos 6:',[ (i.strftime('%Y-%m'),round(v,1)) for i,v in roc12.tail(6).items()])
# XLY/XLP daily
r=(c('XLY')/c('XLP')).dropna(); e50,e200=r.ewm(span=50,adjust=False).mean(),r.ewm(span=200,adjust=False).mean()
print('XLY/XLP diario',round(r.iloc[-1],3),'EMA50',round(e50.iloc[-1],3),'EMA200',round(e200.iloc[-1],3),'12m',round((r.iloc[-1]/r.loc[:r.index[-1]-pd.DateOffset(years=1)].iloc[-1]-1)*100,1))
xl=(c('XLP')/c('XLY')); print('Terremoto XLP/XLY 5 semanas', round((xl.iloc[-1]/xl.iloc[-26]-1)*100,1),'max 5s en 3m', round(((xl/xl.shift(25)-1)*100).tail(63).max(),1))
# Sectors herd: cyclical vs defensive 3m
cyc=['XLK','XLY','XLF','XLC','XLI','XLB']; dfn=['XLP','XLU','XLV']
ret3={s:(c(s).iloc[-1]/c(s).iloc[-64]-1)*100 for s in cyc+dfn+['XLE','XLRE']}
dm=np.mean([ret3[s] for s in dfn]); herd=sum(ret3[s]>dm for s in cyc)
print('Rend 3m sectores',{k:round(v,1) for k,v in ret3.items()},'| defensivos media',round(dm,1),'| cíclicos que les ganan',herd,'/6')
sect=['XLK','XLY','XLF','XLC','XLI','XLB','XLP','XLU','XLV','XLE','XLRE']
abv=sum(c(s).iloc[-1]>c(s).rolling(50).mean().iloc[-1] for s in sect); print('Sectores sobre su SMA50:',abv,'/11')
# Price
for s,n in [('_GSPC','S&P 500'),('_NDX','Nasdaq 100'),('_DJI','Dow'),('_SOX','SOX')]:
    x=c(s); print(n,round(x.iloc[-1],1),'EMA50',round(x.ewm(span=50,adjust=False).mean().iloc[-1],1),'EMA200',round(x.ewm(span=200,adjust=False).mean().iloc[-1],1),'desde máx',round((x.iloc[-1]/x.max()-1)*100,1),'máx',x.idxmax().date())
# Bonds
t10,t2,t3=c('_TNX'),c('2YY_F'),c('_IRX')
print('10Y',t10.iloc[-1],'2Y(fut)',t2.iloc[-1],'3M',t3.iloc[-1],'10Y-2Y',round(t10.iloc[-1]-t2.iloc[-1],2),'2Y cambio 3m',round(t2.iloc[-1]-t2.iloc[-64],2))
# credit/fear
hs=(c('HYG')/c('SPY')); print('HYG/SPY 3m',round((hs.iloc[-1]/hs.iloc[-64]-1)*100,1),'| VIX',c('_VIX').iloc[-1],'máx 1m',round(c('_VIX').tail(22).max(),2))
rs=(c('RSP')/c('SPY')); print('RSP/SPY vs SMA50', round((rs.iloc[-1]/rs.rolling(50).mean().iloc[-1]-1)*100,2),'%')
# Breadth constituents
px=pd.read_csv(D+'sp500_px.csv',index_col=0,parse_dates=True).ffill(limit=3)
sma=px.rolling(50).mean(); valid=sma.notna()&px.notna()
above=((px>sma)&valid).sum(1); n=valid.sum(1)
pct=(above/n.where(n>400)*100).dropna()
print('\n%>SMA50 (S&P500, cálculo propio) hoy',round(pct.iloc[-1],1),'| mín 3m',round(pct.tail(63).min(),1),pct.tail(63).idxmin().date(),'| últimos 8:',[round(v) for v in pct.tail(8)])
# 20->90 impulses (daily within 60 sessions)
imp=[]; lastlow=None
for d,v in pct.items():
    if v<=22: lastlow=d
    if v>=90 and lastlow is not None and (d-lastlow).days<=100:
        imp.append((lastlow.date(),d.date())); lastlow=None
print('Impulsos ≤22 → ≥90 en ≤100 días (5 años):',imp)
hi=(px>=px.rolling(252).max()); lo=(px<=px.rolling(252).min())
nhnl=(hi.sum(1)-lo.sum(1)).where(px.rolling(252).max().notna().sum(1)>400).dropna()
cum=nhnl.cumsum(); ma=cum.rolling(50).mean()
print('NH-NL hoy',int(nhnl.iloc[-1]),'| línea acumulada vs SMA50:', 'ENCIMA' if cum.iloc[-1]>ma.iloc[-1] else 'DEBAJO', '| cruce más reciente:', (cum>ma).astype(int).diff().replace(0,np.nan).dropna().index[-1].date())
# CLI
for a in ['G7','G20','USA']:
    d=pd.read_csv(D+f'CLI_{a}.csv').sort_values('TIME_PERIOD'); v=d[['TIME_PERIOD','OBS_VALUE']].tail(5).values.tolist()
    print('CLI',a,[(p,round(x,2)) for p,x in v])
# CPI
H={'User-Agent':'Mozilla/5.0'}
t=urllib.request.urlopen(urllib.request.Request("https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0/USA.M.N.CPI.PA._T.N.GY?startPeriod=2018-01&format=csvfilewithlabels",headers=H),timeout=40).read().decode()
cp=pd.read_csv(io.StringIO(t)).sort_values('TIME_PERIOD').set_index('TIME_PERIOD')['OBS_VALUE']
e10=cp.ewm(span=10,adjust=False).mean()
print('IPC EE.UU. interanual (OCDE):',[(i,round(v,2),round(e,2)) for (i,v),e in zip(cp.tail(6).items(),e10.tail(6))])
