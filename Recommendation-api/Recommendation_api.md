# Recommendation-api

## Python Flask API
   1. __Install environment__
      ```
        conda activate $YOUR_ENV_NAME
        pip install -r requirements.txt
      ``` 
      
   2. __Run api server__
      ```
        sudo python3 run.py
      ``` 
      
   3. __Test api__
   
      * URL
        * Azure: http://(your ip address):3389/azure_v2
        * GCP: http://(your ip address):3389/gcp_v2
        * AWS: http://(your ip address):3389/aws_v2
        
      * Notice
        * Region: AWS and GCP use region, Azure use regionID
        * Memory: Azure use Megabyte(MB)
        * Project ip address = 35.204.125.116
        
      * Example
      
        * AWS Post
          ```json
            {
                "vendor" : "aws",
                "cpu" : 2,
                "memory":16,
                "gpu":0,
                "region":"Asia Pacific (Singapore)",
                "OS":"Windows",
                "name":"r5dn.large",
                "topN":5
            }
          ```
         
         * Azure Post
            ```json
              {
                  "vendor" : "Azure",
                  "cpu" : 8,
                  "memory":16384,
                  "gpu":0,
                  "region":"centralindia",
                  "OS":"Windows",
                  "name":"Standard_B4ms",
                  "topN":5
              }
            ```
         
## Vendor data source
  * [Azure](https://azureprice.net/)
  * [GCP](https://gcpinstances.doit-intl.com/)
  * [AWS](https://aws.amazon.com/tw/ec2/pricing/on-demand/)

## 尚未完成 待續
