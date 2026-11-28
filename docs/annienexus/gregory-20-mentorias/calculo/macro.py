import pandas as pd, os
D=os.path.dirname(os.path.abspath(__file__))+'/data/fred/'
def s(k):
    d=pd.read_csv(D+k+'.csv',index_col=0,parse_dates=True).iloc[:,0]; return pd.to_numeric(d,errors='coerce').dropna()
def show(k,fmt=lambda x:f"{x:,.1f}"):
    x=s(k); return x
p=s('PERMIT'); print('PERMISOS', [(i.strftime('%Y-%m'),int(v)) for i,v in p.tail(6).items()], 'YoY',round((p.iloc[-1]/p.iloc[-13]-1)*100,1),'% | media3m vs 3m previos',round((p.tail(3).mean()/p.iloc[-6:-3].mean()-1)*100,1))
h=s('HOUST'); print('INICIADAS', [int(v) for v in h.tail(6)])
c=s('IC4WSA'); print('SOLICITUDES 4s', [int(v/1000) for v in c.tail(8)],'mín 52s',int(c.tail(52).min()/1000),'vs mín',round((c.iloc[-1]/c.tail(52).min()-1)*100,1),'%')
cc=s('CCSA'); print('CONTINUAS', [int(v/1000) for v in cc.tail(6)], 'YoY', round((cc.iloc[-1]/cc.iloc[-53]-1)*100,1))
for k in ['DGS2','DGS10','T10Y2Y','T10Y3M','BAMLH0A0HYM2']:
    x=s(k); print(k, x.iloc[-1], '| hace 1m',round(x.iloc[-22],2),'| hace 3m',round(x.iloc[-64],2),'| mín 12m',round(x.tail(252).min(),2),'máx 12m',round(x.tail(252).max(),2))
print('FED sup', s('DFEDTARU').iloc[-1], '| 2Y - Fed =', round(s('DGS2').iloc[-1]-s('DFEDTARU').iloc[-1],2))
for k in ['AMTMNO','NEWORDER']:
    x=s(k); print(k,[(i.strftime('%Y-%m'),round((v/x.iloc[j-1]-1)*100,1)) for j,(i,v) in enumerate(x.items()) if j>=len(x)-4],'YoY',round((x.iloc[-1]/x.iloc[-13]-1)*100,1))
print('MICHIGAN',[ (i.strftime('%Y-%m'),v) for i,v in s('UMCSENT').tail(4).items()])
g=s('GDPNOW'); print('GDPNOW',[(i.strftime('%Y-%m'),round(v,2)) for i,v in g.tail(4).items()])
m=s('M1REAL'); print('M1 real 6m',round((m.iloc[-1]/m.iloc[-7]-1)*100,2),'%')
q=s('GDPC1'); print('PIB real anualizado',[(i.strftime('%Y-%m'),round(((v/q.iloc[j-1])**4-1)*100,1)) for j,(i,v) in enumerate(q.items()) if j>=len(q)-4])
pe=s('PAYEMS'); dd=pe.diff(); print('NFP',[ (i.strftime('%Y-%m'),int(v)) for i,v in dd.tail(6).items()],'media3m',int(dd.tail(3).mean()))
r=s('RSAFS')/s('CPIAUCSL'); r=r.dropna(); print('Ventas reales m/m',[ (i.strftime('%Y-%m'),round((v/r.iloc[j-1]-1)*100,2)) for j,(i,v) in enumerate(r.items()) if j>=len(r)-4],'YoY',round((r.iloc[-1]/r.iloc[-13]-1)*100,1))
ip=s('INDPRO'); print('Prod. industrial YoY',round((ip.iloc[-1]/ip.iloc[-13]-1)*100,1),'m/m',round((ip.iloc[-1]/ip.iloc[-2]-1)*100,2))
w=s('W875RX1'); print('Ingreso real YoY',round((w.iloc[-1]/w.iloc[-13]-1)*100,1))
for k in ['CPIAUCSL','CPILFESL','PCEPI','PCEPILFE']:
    x=s(k); y=(x/x.shift(12)-1)*100; e=y.ewm(span=10,adjust=False).mean()
    print(k,'YoY',[(i.strftime('%Y-%m'),round(v,2)) for i,v in y.tail(4).items()],'EMA10',round(e.iloc[-1],2),'| 3m anualizado',round(((x.iloc[-1]/x.iloc[-4])**4-1)*100,2))
st=s('CORESTICKM159SFRBATL'); print('Sticky',[round(v,2) for v in st.tail(4)])
print('PARO',[v for v in s('UNRATE').tail(6)],'SAHM',s('SAHMREALTIME').iloc[-1])
