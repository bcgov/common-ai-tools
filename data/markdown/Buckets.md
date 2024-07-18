
### Configuring Buckets

- COMS is [configured with a 'default' bucket](Config.md#object-storage). Various object management endpoints will use this bucket if no `bucketId` parameter is provided. (**Note:** the default bucket fall-back behaviour is not available in the BC Gov Hosted COMS service.)

- Additional buckets can be added to the COMS system using the [createBucket](https://coms.api.gov.bc.ca/api/v1/docs#tag/Bucket/operation/createBucket) endpoint.

- When a bucket is created, if the createBucket API request is authenticated with a User ID token (JWT), that user will be granted all [5 permissions](Permissions.md#permission-codes). Bucket Permissions can be granted to other users ([bucketAddPermissions](https://coms.api.gov.bc.ca/api/v1/docs#tag/Permission/operation/bucketAddPermissions)), if the request is authenticated with a JWT for a user with `MANAGE` permission.

If you are self-hosting COMS you can also manage permissions for any object or bucket by using these endpoints with [basic authentication](Authentication.md#basic-auth).

### Using the Bucket **Key**

When you create a bucket in COMS, technically you are 'mounting' your  S3 bucket (actual bucket provisioned) at a specified path in the `key` property of the [createBucket](https://coms-dev.api.gov.bc.ca/api/v1/docs#tag/Bucket/operation/createBucket) request body.

COMS will only operate with objects at that 'folder' within the actual bucket. A COMS `bucket` can more accurately be thought of as a 'mount' to a single path within a bucket.

To work with objects in 'sub-folders' (with other prefixes), you can create multiple COMS 'buckets' mounted at different paths by specifying different keys.
