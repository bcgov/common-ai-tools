This page outlines the general usage patterns and organization of the COMS API. This article is intended for a technical audience, and for people who are planning on using the API endpoints.

**The COMS API is documented using the [Open API Specification](https://coms.api.gov.bc.ca/api/v1/docs)**

## Table of Contents

- [Bucket](#bucket)
- [Object](#object)
  - [Metadata](#metadata)
  - [Tag](#tag)
  - [Versions](#versions)
- [Permission](#permission)
- [Invite URL's](#invite-urls)
- [Sync](#sync)
- [User](#user)

## Bucket

Bucket operations offer the usual CRUD operations for bucket resource management. For example:

- `CREATE /bucket` and `PATCH /bucket/{bucketId}` will pre-emptively check to see if the proposed credential changes represent a network-accessible bucket. These endpoints will yield an error if it is unable to validate the bucket.

## Object

Object endpoints directly influence and manipulate S3 objects and information inherent to them. These endpoints serve as the main core of COMS, focusing on CRUD operations for the objects themselves.

- Uploading (`POST /object`) or updating an object ( `POST /object/{objectId}`) accepts a file in a multipart/form-data body. You can include metadata (via headers) and tags (using query params) in this request.
- `GET /object/{objectId}` is the main endpoint for users to directly access and download a single object.
- `HEAD /object/{objectId}` should be used for situations where you need to get information about the object, but do not want the binary stream of the object itself.
- `DELETE /object/{objectId}` deletes either the object or a specific version of the object. COMS follows the S3 standard for [deleting versioned objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html)
  - If versioning is enabled, calling `/object/{objectId}` is a soft-delete, adding a 'delete-marker' version. To restore this object, remove the delete-marker with `/object/{objectId}?versionId={VersionId of delete-marker}`. To hard-delete a versioned object, you must delete the last version `/object/{objectId}?versionId={last version}`.
  - Calling in the Delete endpoint on a bucket without versioning is a hard-delete.
- The `GET /object` search and `PATCH /object/{objectId}/public` public toggle require a backing database in order to function.

## Metadata

Metadata operation endpoints directly focus on the manipulation of metadata of S3 Objects. Each endpoint will create a copy of the object with the modified metadata attached.

More details found here: [Metadata and Tags](Metadata-Tag.md)

## Tag

Tag operation endpoints directly focus on the manipulation of tags of S3 Objects. Unlike Metadata, Tags can be modified without the need to create new versions of the object.

More details found here: [Metadata and Tags](Metadata-Tag.md)

## Versions

Version specific operations focus on listing and discovering versioning information known by COMS. While the majority of version-specific operations are available as query parameters in the Objects endpoints, the `GET /object/{objectId}/version` endpoint focuses on letting users discover and list what versions are available to work with.

## Permissions

Permission operation endpoints directly focus on associating users to objects with specific permissions. All of these endpoints require a database to function. Existing permissions can be searched for using `GET /permission/object` and `GET /permission/bucket`, and standard create, read and delete operations for permissions exist to allow users to modify access control for specific objects they have management permissions over.

## Invite URL's

COMS also offers a user invite feature. Generate a time-limited, single use invitation token which can be used by an authenticated user to acquire `READ` or other permissions to a specific resource (object or bucket). Optional email-user validation may be specified to ensure the link is only used by the intended recipient. To create an invite link one must have the MANAGE permission on the resource being shared.

See [API Specification](https://coms.api.gov.bc.ca/api/v1/docs#tag/Permission/operation/createInvite)

## Sync

*Available in COMS v0.7+*

Sync endpoints allow synchronizing COMS' internal state with that of the actual S3 bucket/object. This can be useful for setting up a S3 bucket with preexisting files for use with COMS without having to re-upload everything through the COMS API, or for synchronizing changes made through an external S3 client (e.g. S3 Browser, Cyberduck etc) to an object already managed by COMS.

API calls to the sync endpoints do not immediately add all detected changes to COMS' internal database; instead, they are added to a queue where they are eventually processed. The endpoint `GET /sync/status` returns the number of items that are currently sitting in this queue.

At the time of writing, synchronization is not done automatically, so the sync endpoints must be used in order for COMS to know of any changes to the bucket/object.

## User

User operation endpoints focus on exposing known tracked users and identity providers. These endpoints serve as a reference point for finding the right user and identity to manipulate in the Permission endpoints. As COMS is relatively agnostic to how a user logs in (it only cares that you exist), the onus of determining which identity provider a user uses falls onto the line of business to handle, should that be something that needs monitoring.
