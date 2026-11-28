import pandas as pd, numpy as np, os, json
D=os.path.dirname(os.path.abspath(__file__))+'/data/'; F=D+'fred/'
def f(k): d=pd.read_csv(F+k+'.csv',index_col=0,parse_dates=True).iloc[:,0]; return pd.to_numeric(d,errors='coerce').dropna()
def y(s): return pd.read_csv(D+s+'.csv',index_col=0,parse_dates=True)['close'].dropna()
def yoy(x): p=x.copy(); p.index=p.index+pd.DateOffset(years=1); return ((x/p.reindex(x.index))-1)*100
def cli(a): d=pd.read_csv(D+f'CLI_{a}.csv').sort_values('TIME_PERIOD'); return pd.Series(d.OBS_VALUE.values,index=pd.to_datetime(d.TIME_PERIOD))
o={}
def put(k,s,n,r=2,fmt='%Y-%m'): s=s.dropna().tail(n); o[k]={'d':[i.strftime(fmt) for i in s.index],'v':[round(float(v),r) for v in s.values]}
put('cliG7',cli('G7'),13); put('cliG20',cli('G20'),13); put('cliUS',cli('USA'),13)
pce=yoy(f('PCEPI')); put('pce',pce,13); put('pcecore',yoy(f('PCEPILFE')),13)
cpi=yoy(f('CPIAUCNS')); put('cpi',cpi,13); put('cpiema',cpi.dropna().ewm(span=10,adjust=False).mean(),13)
put('sticky',f('CORESTICKM159SFRBATL'),13)
w=lambda s: s.resample('W-FRI').last()
put('y2',w(f('DGS2')),26,2,'%Y-%m-%d'); put('fed',w(f('DFEDTARU')),26,2,'%Y-%m-%d'); put('curve',w(f('T10Y2Y')),26,2,'%Y-%m-%d'); put('hy',w(f('BAMLH0A0HYM2')),26,2,'%Y-%m-%d')
put('claims',f('IC4WSA')/1000,26,0,'%Y-%m-%d'); put('permit',f('PERMIT')/1000,13,3); put('capgoods',yoy(f('NEWORDER')),13,1); put('mich',f('UMCSENT'),13,1)
put('nfp',f('PAYEMS').diff(),13,0); put('unrate',f('UNRATE'),13,1)
r=(y('XLY')/y('XLP')).dropna(); put('xlyxlp',w(r),52,3,'%Y-%m-%d'); put('xlyxlp_e50',w(r.ewm(span=50,adjust=False).mean()),52,3,'%Y-%m-%d'); put('xlyxlp_e200',w(r.ewm(span=200,adjust=False).mean()),52,3,'%Y-%m-%d')
for a in ['XLI','XLF']:
    rr=w(y(a)/y('XLP')); put('roc5_'+a,(rr/rr.shift(5)-1)*100,26,1,'%Y-%m-%d')
m=(y('XLI')/y('XLP')).resample('ME').last(); put('roc12',(m/m.shift(12)-1)*100,13,1)
spx=y('_GSPC'); put('spx',w(spx),52,0,'%Y-%m-%d'); put('spx_e50',w(spx.ewm(span=50,adjust=False).mean()),52,0,'%Y-%m-%d'); put('spx_e200',w(spx.ewm(span=200,adjust=False).mean()),52,0,'%Y-%m-%d')
dq=(y('_DJI')/y('_NDX')); put('dow_ndx',w(dq/dq.loc['2025-11-28':].iloc[0]*100),52,1,'%Y-%m-%d')
put('vix',w(y('_VIX')),26,1,'%Y-%m-%d'); put('sox',w(y('_SOX')),52,0,'%Y-%m-%d')
sp=pd.read_csv(D+'sp500_px.csv',index_col=0,parse_dates=True).ffill(limit=3)
lo=(sp<=sp.rolling(252,min_periods=200).min()).sum(axis=1); hi=(sp>=sp.rolling(252,min_periods=200).max()).sum(axis=1)
wk=pd.DataFrame({'h':hi,'l':lo}).resample('W-FRI').sum().tail(16); o['newhl']={'d':[i.strftime('%Y-%m-%d') for i in wk.index],'h':wk.h.astype(int).tolist(),'l':wk.l.astype(int).tolist()}
sma=sp.rolling(50).mean(); v=sma.notna()&sp.notna(); pct=((sp>sma)&v).sum(axis=1)/v.sum(axis=1).where(v.sum(axis=1)>400)*100; put('s5fi',w(pct),52,0,'%Y-%m-%d')
# quadrant trail: x = CLI G7 3m change, y = PCE yoy minus its EMA10
g=cli('G7'); x=(g-g.shift(3)); pe=pce.dropna(); yv=pe-pe.ewm(span=10,adjust=False).mean()
q=pd.DataFrame({'x':x,'y':yv}).dropna().tail(12); o['quad']={'d':[i.strftime('%Y-%m') for i in q.index],'x':[round(v,3) for v in q.x],'y':[round(v,3) for v in q.y]}
json.dump(o,open(D+'spark.json','w')); print({k:(v['v'][-3:] if 'v' in v else '') for k,v in o.items()}); print(o['quad'])
