import requests
from bs4 import BeautifulSoup
import openpyxl
import pandas as pd
import numpy as np
import ast
import json
hour2month = 24*30
def rec_aws(vendor,region,cpu,memory,gpu,name,operation,topN):
    try:
        aws_gpu = ['g4dn.12xlarge', 'g4dn.16xlarge', 'g4dn.2xlarge', 'g4dn.4xlarge',
        'g4dn.8xlarge', 'g4dn.metal', 'g4dn.xlarge', 'g5.12xlarge',
        'g5.16xlarge', 'g5.24xlarge', 'g5.2xlarge', 'g5.48xlarge',
        'g5.4xlarge', 'g5.8xlarge', 'g5.xlarge', 'p2.16xlarge',
        'p2.8xlarge', 'p2.xlarge', 'g2.2xlarge', 'g2.8xlarge',
        'g3.16xlarge', 'g3.4xlarge', 'g3.8xlarge', 'g3s.xlarge',
        'g5g.16xlarge', 'g5g.2xlarge', 'g5g.4xlarge', 'g5g.8xlarge',
        'g5g.metal', 'g5g.xlarge', 'p3.16xlarge', 'p3.2xlarge',
        'p3.8xlarge', 'p4d.24xlarge', 'g4ad.16xlarge', 'g4ad.2xlarge',
        'g4ad.4xlarge', 'g4ad.8xlarge', 'g4ad.xlarge', 'p3dn.24xlarge',
        'p4de.24xlarge']
        n_gpu = [4, 1, 1, 1, 1, 8, 1, 4, 1, 4, 1, 8, 1, 1, 1, 16, 8, 1, 1, 4, 4, 1, 2, 
            1, 2, 1, 1, 1, 2, 1, 8, 1, 4, 8, 4, 1, 1, 2, 1, 8, 8]

        reg = region.replace(" ", "%20")
        if operation == "Linux":
            http = "https://b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps/ec2/USD/current/ec2-ondemand-without-sec-sel/"+str(reg)+"/Linux/index.json?"
        
        
        else:
            http = "https://b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps/ec2/USD/current/ec2-ondemand-without-sec-sel/"+str(reg)+"/Windows/index.json?"
        
        #print(http)
        web =requests.get(http)
        # print(web)
        s = BeautifulSoup(web.content, "html.parser")
        js = json.loads(s.text)
        d = js["regions"][region]
        
        df = pd.DataFrame.from_dict(d, orient='index')
        df = df[["Instance Type","vCPU","Memory","price"]].reset_index().drop("index", axis=1)
        df = df.rename(columns = {"Instance Type":"vm name", "vCPU":"vCPUs","Memory":"memory"})

        # print(df)
        #print(df[df["vm name"]==name])
        for i in range(len(df)):
            df.iloc[i,1] = float(df.iloc[i,1])
            df.iloc[i,2] = float(df.iloc[i,2].replace(" GiB", ""))
            df.iloc[i,3] = float(df.iloc[i,3])
            for j in range(len(aws_gpu)):
                if df.iloc[i,0]==aws_gpu[j]:
                    df.loc[i,"GPUs"] = n_gpu[j]
        # print(df)
        df["GPUs"] = df["GPUs"].fillna(0)
        df["region"] = region
        df["vendor"] = "aws"

        # print(df[df["vm name"]==name])
        cost = df[df["vm name"]==name].iloc[0,3]
        text = "price"
        
        select = df[df["vm name"]==name]
        up_cost = cost+cost*df[text].std()
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
                rec.loc[i,"kpi"] = (rec.loc[i,"point"]/rec["point"].std())+(rec.loc[i,"saving"]/rec["saving"].std())
            rec = rec.sort_values(by = "kpi", ascending=False).reset_index().drop("index", axis=1)
            #print(rec)
    
        
        elif gpu!=0:
            rec = df[df["GPUs"]!=0].reset_index().drop("index", axis=1)
            # print(type(rec))
            for i in range(len(rec)):
                rec.loc[i,"point"] = (rec.iloc[i,1]-cpu)/cpu + (rec.iloc[i,2]-memory)/memory
                rec.loc[i,"saving"] = (1-rec.loc[i,text]/cost)*100
        
            rec = rec.sort_values(by = ["point","saving"], ascending=False).reset_index().drop("index", axis=1)
        
            for i in range(len(rec)):
                rec.loc[i,"kpi"] = (rec.loc[i,"point"]/rec["point"].mean())+((rec.loc[i,"saving"]/rec["saving"].mean()))
            rec = rec.sort_values(by = "kpi", ascending=True).reset_index().drop("index", axis=1)
            
            
        rec = rec[rec["vm name"]!=name] 
        # print(rec)
        # return rec

        result = []
        rec = rec.reset_index().drop("index", axis=1)

        if len(rec) ==0:
            return 'norec'
        rec_len_max = min(topN,len(rec))

        for i in range(rec_len_max):
            temp = { 'vendor': "AWS",'machineType' : rec.loc[i,"vm name"],'vCPUs' : str(rec.loc[i,"vCPUs"]), 'memory' : str(rec.loc[i,"memory"]), 'monthlyCost' : str(rec.loc[i,"price"]*hour2month), 'region' : rec.loc[i,"region"],'gPUs': str(rec.loc[i,"GPUs"]),'point': str(rec.loc[i,"point"]),'saving': str(rec.loc[i,"saving"]),'kpi': str(rec.loc[i,"kpi"])}
            result.append(temp)
        return result
    except:
        print('ERROR code')
        return 'norec'