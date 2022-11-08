import requests
from bs4 import BeautifulSoup
import openpyxl
import pandas as pd
import numpy as np
import ast
import json
import re
hour2month = 24*30
def rec_gcp(vendor,region,cpu,memory,gpu,name,operation,topN):
    try:
        cost=0
        text = operation.lower()
        web = requests.get("https://gcpinstances.doit-intl.com/data.json")
        s = BeautifulSoup(web.content, "html.parser")

        js = json.loads(s.text)
        vm_type = list(js.keys())
        vm_type = vm_type[2:-1]
        specific = []
        for i in range(len(vm_type)):
            s = list(js[vm_type[i]].keys())
            specific.append(s)
        detail = list(js[vm_type[0]][specific[0][0]].keys())
        gcp = []
        for i in range(len(vm_type)):
            for j in range(len(specific[i])):
                df = pd.DataFrame.from_dict(js[vm_type[i]][specific[i][j]][detail[0]]).transpose().reset_index()
                df = df.rename(columns = {"ondemand":"Linux cost", "index":"Region"})
                df["vCPUs"] = js[vm_type[i]][specific[i][j]][detail[1]]["cores"]
                df["memory"] = js[vm_type[i]][specific[i][j]][detail[1]]["memory"]

                df["GPUs"] = js[vm_type[i]][specific[i][j]][detail[1]]["gpu"]
                df["vm name"] = specific[i][j]
                df["Window cost"] = df["Linux cost"] + 0.046*df["vCPUs"]
                c = []
                for k in range(len(df)):
                    check = re.search('\d',df.iloc[k,0])
                    check = str(check)
                    if check=='None':
                        c.append(k)
                df = df.drop(c, axis=0).reset_index().drop("index", axis=1)
                df = df[["vm name","vCPUs","memory","Linux cost", "Window cost","GPUs", "Region"]]
                gcp.append(df)
        gcp_data = pd.concat(gcp)
        gcp_data = gcp_data.fillna(0)
        gcp_data = gcp_data[gcp_data["Region"]==region]
        #gcp_data
        
        select = gcp_data[gcp_data["vm name"]==name]
        # print(select)
        # sep window & linux
        if operation == "Windows":
            cost = select.iloc[0,4]
            text= "Window cost"
        elif operation == "Linux":
            cost = select.iloc[0,3]
            text = "Linux cost"
            
        up_cost = cost+cost*gcp_data[text].std()
        down_cost = cost-0.6*cost
            # find range of CPU
        cpu = select.iloc[0,1]
        cpu_con_down = 0.5*float(cpu)
        cpu_con_up = 2.5*float(cpu)
            # find range of memory
        memory = select.iloc[0,2]
        mem_con_down = 0.5*float(memory)
        mem_con_up = 2*float(memory)
        
        #if gpu=0:
        if gpu==0:
            rec = gcp_data[gcp_data[text]!=0]
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
            # print(type(rec))
            for i in range(len(rec)):
                rec.loc[i,"point"] = (rec.iloc[i,1]-cpu)/cpu + (rec.iloc[i,2]-memory)/memory
                rec.loc[i,"saving"] = (1-rec.loc[i,text]/cost)*100
        
            rec = rec.sort_values(by = ["point","saving"], ascending=False).reset_index().drop("index", axis=1)
        
            for i in range(len(rec)):
                rec.loc[i,"kpi"] = (rec.iloc[i,7]/rec["point"].mean())+((rec.iloc[i,8]/rec["saving"].mean()))
            rec = rec.sort_values(by = "kpi", ascending=True).reset_index().drop("index", axis=1)
        rec = rec[rec["vm name"]!=name] 
        #print(rec)
        # return rec

        result = []
        rec = rec.reset_index().drop("index", axis=1)

        if len(rec) ==0:
            return 'norec'
        rec_len_max = min(topN,len(rec))

        for i in range(rec_len_max):
            temp = { 'vendor': "GCP",'machineType' : rec.loc[i,"vm name"],'vCPUs' : str(rec.loc[i,"vCPUs"]), 'memory' : str(rec.loc[i,"memory"]), 'Linux Cost' : str(rec.loc[i,"Linux cost"]*hour2month), 'Windows Cost' : str(rec.loc[i,"Window cost"]*hour2month), 'region' : rec.loc[i,"Region"],'gPUs': str(rec.loc[i,"GPUs"]),'point': str(rec.loc[i,"point"]),'saving': str(rec.loc[i,"saving"]),'kpi': str(rec.loc[i,"kpi"])}
            result.append(temp)
        
        return result
    except:
        print('ERROR code')
        return 'norec'