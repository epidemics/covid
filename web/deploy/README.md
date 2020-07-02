# Adding a new custom site 

The main configuration parameters are the following:
* BRANCH_NAME: branch on which you will trigger the deployment
* BRANCH_CHANNEL: channel of the website

I will use these as 'environment' variables in the examples, with the interpolation %BRANCH_NAME%.

First you have to configure the deployment script to trigger on pushes to the branch. Go to `.github/workflows/deploy.yml` and add your branch under here:
```
on:
  push:
    branches:
      - master
      - staging
      - balochistan
      - %BRANCH_NAME%
```

Next create a k8 namespace for the custom site. The name can be the branch name.
You can execute this script locally or in Google Cloud Shell (no need of local installation):
```
gcloud container clusters get-credentials --region us-west1-c epidemics

kubectl create namespace %BRANCH_NAME%
```

Second add an entry to `./deploy/site_configs.json`:
```
  "%BRANCH_NAME%": {
    "values": "./deploy/chart/values.%BRANCH_NAME%.yaml",
    "static": "gs://static-covid/static/%BRANCH_NAME%/",
    "namespace": "%BRANCH_NAME%"
  }
```
The key of the entry should be the branch name that the deployment script will listen to for deployment. The fields are:
* values: a configuration file for deployment
* static: the bucket where to upload the static data for the website 
* namespace: the name of the namespace you created earlier

Next create the deployment configuration file, for example `./deploy/chart/values.balochistan.yaml`:
```
ingress:
  externalIpName: loadbalance-%BRANCH_NAME%

web:
  replicasCount: 1

env:
  staticUrl: "https://storage.googleapis.com/static-covid/static/%BRANCH_NAME%"
  nodeEnv: "production"
  defaultEpiforChannel: "%BRANCH_CHANNEL%"
```

Main fields of note:
* ingress.externalIpName: make it unique to get a IP address
* web.replicasCount: number of instances to run in a load balancing group
* env.*: all of these configure the environment variables for the node server
  * staticUrl: should match the staticUrl you specified in site_configs.json
  * nodeEnv: should be production unless you want to have some sort of dev instance
  * defaultEpiforChannel: set the channel for the website

Finally, push this configuration and soon you should see a new service in the K8 engine: 
https://console.cloud.google.com/kubernetes/discovery?project=epidemics-270907. Once it starts up and a IP address is 
assigned, you can access the website on that IP. Configure DNS as necessary.
