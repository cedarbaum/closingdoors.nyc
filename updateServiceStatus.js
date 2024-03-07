const fs = require("fs");
const dotenv = require("dotenv");
const AWS = require("aws-sdk");

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

// Configure AWS SDK
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY_ID,
  secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
});

// Function to upload file to DigitalOcean Spaces
function uploadToSpaces(bucketName, fileName, fileData) {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileData,
    ACL: "public-read", // Adjust the ACL as needed
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
}

// Main function to read JSON file and upload it to Spaces
async function uploadJSONToSpaces(jsonFilePath, bucketName) {
  try {
    // Read JSON file
    const jsonData = fs.readFileSync(jsonFilePath, "utf8");

    // Upload JSON data to Spaces
    const uploadedLocation = await uploadToSpaces(
      bucketName,
      "service_status.json",
      jsonData,
    );

    console.log("File uploaded successfully to:", uploadedLocation);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

// Usage: node udpateServiceStatus <jsonFilePath>
const jsonFilePath = process.argv[2];
const bucketName = process.env.DO_SPACES_BUCKET_NAME;

if (!jsonFilePath) {
  console.error("Please provide path to the JSON file.");
} else if (!bucketName) {
  console.error(
    "DigitalOcean Spaces bucket name is not provided in .env.local file.",
  );
} else {
  uploadJSONToSpaces(jsonFilePath, bucketName);
}
