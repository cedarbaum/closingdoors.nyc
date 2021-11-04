import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as acm from "@aws-cdk/aws-certificatemanager";
import {
  OriginAccessIdentity,
  ViewerCertificate,
} from "@aws-cdk/aws-cloudfront";
import { BlockPublicAccess } from "@aws-cdk/aws-s3";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const oia = new OriginAccessIdentity(this, "OIA");
    const bucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName: "closingdoorssite",
      websiteIndexDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
    bucket.grantRead(oia);

    let certificate = undefined;
    if (process.env.DNS_CERT_ARN) {
      certificate = acm.Certificate.fromCertificateArn(
        this,
        "DnsCertificate",
        process.env.DNS_CERT_ARN
      );
    }

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "web-dist",
      {
        ...(certificate !== undefined && {
          viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
            aliases: ["closingdoors.nyc", "www.closingdoors.nyc"],
          }),
        }),
        comment: "web-dist",
        defaultRootObject: "index.html",
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oia,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
          {
            behaviors: [
              {
                pathPattern: "/graphql",
                allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
                compress: true,
              },
            ],
            customOriginSource: {
              domainName: cdk.Fn.select(
                2,
                cdk.Fn.split("/", process.env.GRAPHQL_API_URL!)
              ),
              originPath: "",
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
              originHeaders: {
                "x-api-key": process.env.GRAPHQL_API_KEY!,
              },
            },
          },
        ],
      }
    );

    new s3deploy.BucketDeployment(this, "deploy-with-invalidation", {
      sources: [s3deploy.Source.asset("../build/")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
