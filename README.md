# serverless-AWS
Example REST API using the serverless stack from AWS:
    - Lambda
    - DynamoDB
    - SAM
    - API Gateway

- [serverless-AWS](#serverless-aws)
  - [Available endpoints:](#available-endpoints)
  - [Prerequisites](#prerequisites)
  - [How to deploy the API](#how-to-deploy-the-api)
    - [SAM configuration](#sam-configuration)
    - [SAM deploy](#sam-deploy)
  - [Entities](#entities)
    - [Post](#post)
    - [Comment](#comment)
  - [Integration Tests](#integration-tests)

## Available endpoints:
| Method | Resource                             |
| ------ |:------------------------------------:|
| GET    | /posts                               |
| GET    | /posts/{postId}                      |
| POST   | /posts                               |
| POST   | /posts/{postId}/comments             |
| PUT    | /posts/{postId}                      |
| DELETE | /posts/{postId}                      |
| DELETE | /posts/{postId}/comments/{commentId} |

## Prerequisites
In order to deploy this API into you AWS environment, you will first need:
    - AWS account (educate, free tier or normal)
    - [SAM cli installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
    - [AWS credentials configured](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html)

## How to deploy the API
### SAM configuration
You can manually create this file or use the command `sam deploy --guided` to interactively create it.

```
version = 0.1
[default]
[default.deploy]
[default.deploy.parameters]
stack_name = "serverless-aws"
s3_bucket = "s3.cloudapps.codeurjc"
s3_prefix = "serverless-aws"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
```

Important information here is the **S3 Bucket** where your code will get packaged to and it's prefix. Also the **region** in where your API will get deployed, and where your DynamoDB is, please notice lines 4 to 6 in `src/dbManager.js`:

```
AWS.config.update({
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
```
### SAM deploy
Once `samconfig.toml` is in place, you can already perform `sam deploy` and your lambda application sould get deployed in your AWS account. Thanks to the last line of the file `template.yaml`, the logs from deploy should at the very end print the prod url where the API is now available:

```
Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/posts/"
```

Once deployed, feel free to use the provided **Postman** collection against the API.

## Entities
### Post
```
{
	"name": "Jack Nicholson",
	"nickname": "Nicky",
	"title": "My Joker was good too",
	"content": "Respect for Heath Ledger and Joaquin Phoenix",
	"comments": {}
}
```

### Comment
```
{
	"nickname": "Random Internet Guy",
	"comment": "Here is Johnny!",
	"creationDate": "2019-11-26 10:15:55"
}
```

## Integration Tests
Find inside directory `integrationtests` a straightforward postman collection, including test assertions, testing every endpoint and a main application flow:
    1. Create a Post
    2. Get all available Posts
    3. Get a specific Post checking structure
    4. Modify the Post's nickname
    5. Get it again to check whether it was modified correctly
    6. Add a Comment to the Post
    7. Delete the Comment
    8. Delete the Post