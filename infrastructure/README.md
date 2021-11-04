# Deploying website

## Environment

- `DNS_CERT_ARN`: an optional certificate ARN for an SSL certificate stored in AWS certificate manager.
- `GRAPHQL_API_URL`: the AppSync URL
- `GRAPHQL_API_KEY`: the AppSync API key

## Deploy to AWS

1. Ensure the website has been built from the root repository folder.
2. `npm install && npm run build`   
3. `cdk deploy --require-approval never`