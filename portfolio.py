import pandas as pd
import yfinance as yf
import numpy as np
from numpy import  linalg
import sys
#from pandas_datareader import data as prd

class my_strategy:
    def __init__ (self, name , pr):
        self.name = name
        self.rate = pr
        
    def get_stock_info(self):
        df = yf.download(self.name[0], start='2020-12-02', end='2021-12-01', progress=False)
        df_pick = df['Adj Close']
        info = (df_pick - df_pick.shift(axis=0)).div(df_pick.shift(axis=0),axis=0)
        info.name = self.name[0]
        info = pd.DataFrame(info,dtype=float)

        df1 = yf.download(self.name[1], start='2020-12-02', end='2021-12-01', progress=False)
        df1_pick = df1['Adj Close']
        info1 = (df1_pick - df1_pick.shift(axis=0)).div(df1_pick.shift(axis=0),axis=0)
        info1.name = self.name[1]
        info1 = pd.DataFrame(info1,dtype=float)

        df2 = yf.download(self.name[2], start='2020-12-02', end='2021-12-01', progress=False)
        df2_pick = df2['Adj Close'] 
        info2 = (df2_pick - df2_pick.shift(axis=0)).div(df2_pick.shift(axis=0),axis=0)
        info2.name = self.name[2]
        info2 = pd.DataFrame(info2,dtype=float)

        mama = pd.concat([info,info1,info2],axis=1)
        return mama

    def blacklitterman(self, returns):
        tau = 0.1
        pick1 = np.array([1,1,1])
        q1 = np.array([0.003*4])
        pick2 = np.array([0.5,0.5,-1])
        q2 = np.array([0.001])
        P = np.array([pick1,pick2])
        Q = np.array([q1,q2])
        mu = returns.mean()
        sigma = returns.cov()
        pil = np.expand_dims(mu,axis = 0).T
        ts = tau * sigma
        ts_1 = linalg.inv(ts)
        Omega = np.dot(np.dot(P,ts), P.T)* np.eye(Q.shape[0])
        Omega_1 = linalg.inv(Omega)
        er = np.dot(linalg.inv(ts_1 + np.dot(np.dot(P.T,Omega_1),P)),(np.dot(ts_1 ,pil)+np.dot(np.dot(P.T,Omega_1),Q)))
        posterirorSigma = linalg.inv(ts_1 + np.dot(np.dot(P.T,Omega_1),P))
        return [er, posterirorSigma]

    def blminVar(self, blres):
        covs = np.array(blres[1],dtype=float)
        means = np.array(blres[0],dtype=float)
        L1 = np.append(np.append(covs.swapaxes(0,1),[means.flatten()],axis=0),
                       [np.ones(len(means))],axis=0).swapaxes(0,1)

        L2 = list(np.ones(len(means)))
        L2.extend([0,0])
        L3 = list(means)
        L3.extend([0,0])
        L4 = np.array([L2,L3],dtype=float)
        L = np.append(L1,L4,axis=0)
        results = linalg.solve(L,np.append(np.zeros(len(means)),[1,self.rate]))

        return pd.DataFrame(results[:-2],columns = ['p_weight'])

#L = ["NVDA","BABA","AAPL"]#股票名
#r = 0.7/252 #0.7是需要输入的user的期望收益率
if __name__ == "__main__":
    L = [sys.argv[1],sys.argv[2],sys.argv[3]]
    r = float(sys.argv[4])/252
    strategy = my_strategy(L , r)
    info = strategy.get_stock_info()
    res = strategy.blacklitterman(info)
    blresult = strategy.blminVar(res) 
    print(int(blresult["p_weight"][0]*100))
    print(int(blresult["p_weight"][1]*100))
    print(int(blresult["p_weight"][2]*100))