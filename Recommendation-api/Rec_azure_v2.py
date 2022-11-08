import requests
from bs4 import BeautifulSoup
import openpyxl
import pandas as pd
import numpy as np
import ast
import json

azure_q = []
azure_r = []

hour2month = 24*30
def init():
    web_azure = requests.get('https://azureprice.net/')
    s = BeautifulSoup(web_azure.content, "html.parser")
    # All Region option
    option = s.find_all("option")
    option = option[24:-10]
    #option

    azure_query = []
    # print(option)
    
    for i in range(len(option)):
        o = str(option[i])
        o1 = o.replace("selected=\"\"", "")
        o1 = o1.split("\"")[1]
        o2 = o.split(">")[1]
        o2 = o2.split("<")[0].split(" (")
        http = "https://api.azureprice.net/api/v1/price?currency=USD&region="+o1+"&tier=standard&paymentType=payasyougo"
        azure_q.append(o1)
        azure_r.append(o2[0])
        azure_query.append(http)
    #azure_query


def rec_azure(vendor,region,cpu,memory,gpu,name,operation,topN):
    try:
        for i in range(len(azure_q)):
            if region==azure_r[i]:
                region = azure_q[i]
        # print(region)
        http = "https://api.azureprice.net/api/v1/price?currency=USD&region="+region+"&tier=standard&paymentType=payasyougo"
        web = requests.get(http)
        s = BeautifulSoup(web.content, "html.parser")
        js = json.loads(s.text)
        d = js["listVmInformations"]
        df = pd.DataFrame(d)
        df = df[["name","numberOfCores","memoryInMB","linuxPrice","windowsPrice","gpUs","regionName"]]
        df = df.rename(columns={"name":"vm name", "numberOfCores":"vCPUs",
                                        "memoryInMB":"memory", "linuxPrice":"Linux cost",
                                        "windowsPrice":"Window cost","gpUs":"GPUs",
                                            "regionName":"Region"})
        #print(df["Window cost"].std())
        # print(df)
        select = df[df["vm name"]==name]
        # sep window & linux
        con = df[df["vm name"]==name]
        if operation == "Windows":
            cost = con.iloc[0,4]
            text= "Window cost"
        elif operation == "Linux":
            cost = con.iloc[0,3]
            text = "Linux cost"
            
        cpu = select.iloc[0,1]
        up_cost = cost+cost*df[text].std()
        down_cost = cost-0.6*cost
            # find range of CPU
        cpu_con_down = 0.5*float(cpu)
        cpu_con_up = 2.5*float(cpu)
            # find range of memory

        memory = select.iloc[0,2]
        mem_con_down = 0.5*float(memory)
        mem_con_up = 2*float(memory)
        
        #if gpu=0:
        if gpu==0:
            rec = df[df[text]!=0]
            rec = rec[(rec[text]>=down_cost) & (rec[text]<=up_cost)].reset_index().drop("index", axis=1)
            rec = rec[(rec['vCPUs']>=cpu_con_down) & (rec['vCPUs']<=cpu_con_up)].reset_index().drop("index", axis=1)
            rec = rec[(rec['memory']>=mem_con_down) & (rec['memory']<=mem_con_up)].reset_index().drop("index", axis=1)
            rec = rec.sort_values(by=text).reset_index().drop("index", axis=1)
            #print(rec)
            for i in range(len(rec)):
                    rec.loc[i,"point"] = (rec.iloc[i,1]-cpu)/cpu + (rec.iloc[i,2]-memory)/memory
                    rec.loc[i,"saving"] = (1-rec.loc[i,text]/cost)*100
            #print(rec)
            rec = rec[(rec["saving"]>=-100)&(rec["saving"]<=100)].reset_index().drop("index", axis=1)
            rec = rec.sort_values(by = ["point","saving"], ascending=False).reset_index().drop("index", axis=1)
            
            for i in range(len(rec)):
                rec.loc[i,"kpi"] = (rec.iloc[i,7]/rec["point"].std())+(rec.iloc[i,8]/rec["saving"].std())
            rec = rec.sort_values(by = "kpi", ascending=False).reset_index().drop("index", axis=1)
            #print(rec)
        #rec = rec[rec["vm name"]!=name]
        #print(rec)
        
        elif gpu!=0:
            rec = df[df["GPUs"]!=0].reset_index().drop("index", axis=1)
            print(type(rec))
            for i in range(len(rec)):
                rec.loc[i,"point"] = (rec.iloc[i,1]-cpu)/cpu + (rec.iloc[i,2]-memory)/memory
                rec.loc[i,"saving"] = (1-rec.loc[i,text]/cost)*100
        
            rec = rec.sort_values(by = ["point","saving"], ascending=False).reset_index().drop("index", axis=1)
        
            for i in range(len(rec)):
                rec.loc[i,"kpi"] = (rec.iloc[i,7]/rec["point"].mean())+((rec.iloc[i,8]/rec["saving"].mean()))
            rec = rec.sort_values(by = "kpi", ascending=True).reset_index().drop("index", axis=1)
        rec = rec[rec["vm name"]!=name]

        #rec = rec[rec["vm name"]!=name]
        # print(rec)
        result = []

        #,'vCPUs' : str(v["vCPUs"]), 'memory' : str(v["memory"]), 'Linux Cost' : str(v["Linux cost"]), 'Windows Cost' : str(v["Window cost"]), 'region' : v["Region"],'gPUs': str(v["GPUs"]),'point': str(v["point"]),'saving': str(v["saving"]),'kpi': str(v["kpi"])
        # print(rec.iloc[0,:9])
        # print('rec len',len(rec))
        rec = rec.reset_index().drop("index", axis=1)

        if len(rec) ==0:
            return 'norec'
        rec_len_max = min(topN,len(rec))

        for i in range(rec_len_max):
            temp = { 'vendor': "Azure",'machineType' : rec.loc[i,"vm name"],'vCPUs' : str(rec.loc[i,"vCPUs"]), 'memory' : str(rec.loc[i,"memory"]/1024), 'Linux Cost' : str(rec.loc[i,"Linux cost"] *hour2month), 'Windows Cost' : str(rec.loc[i,"Window cost"]*hour2month), 'region' : rec.loc[i,"Region"],'gPUs': str(rec.loc[i,"GPUs"]),'point': str(rec.loc[i,"point"]),'saving': str(rec.loc[i,"saving"]),'kpi': str(rec.loc[i,"kpi"])}
            result.append(temp)
        # return rec
        return result
    except:
        print('ERROR code')
        return 'norec'