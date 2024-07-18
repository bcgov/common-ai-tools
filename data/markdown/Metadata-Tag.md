This page outlines the general design used for managing Metadata and Tags on S3 Objects. This page is mainly targeted for users and for people who are planning on implementing and leveraging the API endpoints.

## Table of Contents

- [Overview](#overview)
  - [Metadata](#metadata)
  - [Tag](#tag)
- [Usage in COMS](#usage-in-coms)
  - [General Operations](#general-operations)
  - [Search](#search)

## Overview

In general, metadata is "data that provides information about other data", but is not considered a part of the content of the data itself. Your line of business may require metadata to do things like the following:

- Describe the contents of the object
- Explain the structure of the object
- Track administrative lifecycles of the object
- Reference other related objects
- Record legal/licensing information about the object

For these scenarios, having a pragmatic way to assign, manage, and lookup these pieces of metadata in an effective way is indispensable. While S3 does support assigning and managing metadata and tags, the S3 API does not provide a way to efficiently search for objects using metadata and tags. This is where COMS can fill in the gap.

### Metadata

S3 supports the the manipulation of metadata on S3 objects. The key behavior to understand with metadata is that in S3, metadata is considered a part of the object definition itself. As such, each operation on metadata will create a copy of the object with the modified metadata attached. When the metadata for an object has to change, if the object resides in a version-enabled bucket, it will create a new version of the object with the new metadata and a copy of the original object bytestream.

Other general key notes to consider when implementing user-defined metadata are the following:

- S3 stores user-defined metadata keys in lowercase.
- The request header maximum size for user-defined metadata shall not exceed 2KB in size.
- The size of user-defined metadata is measured by taking the sum of the number of bytes in the UTF-8 encoding of each key and value.
- Avoid using characters outside the US-ASCII and UTF-8 standards for metadata values

More details found here: [AWS: Working with object metadata](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html)

### Tag

S3 also supports the manipulation of tags on S3 objects. While tags are logically similar to metadata, S3 treats tags differently than metadata. The key behavior to understand with tags is that in S3, unlike metadata, tags can be modified without the need to create new versions of the object. As such, operations on tags can be ad-hoc manipulated without triggering the creation of a new version of the object.

Other general key notes to consider when implementing user-defined tags are the following:

- Only up to 10 tags may be associated with an object at a time.
- Tags that are associated with an object must have unique tag keys.
- A tag key can be up to 128 Unicode characters in length
- A tag value can be up to 256 Unicode characters in length.
- Keys and values are case sensitive.

More details found here: [AWS: Categorizing your storage using tags](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-tagging.html)

## Usage in COMS

COMS for the most part follows the general patterns found in the S3 API. To this end, since metadata is handled in `x-amz-meta-*` headers, COMS does the same. Since tags do not have quite as well of a defined structure, COMS follows the spirit of the Tagging > Tagset structure by using a deepObject query model to define multiple key/value tagsets in the query (looks like `tagset[x]=a&tagset[y]=b`). In COMS, the pattern for interacting with metadata and tags will be consistent across the entire API, so you can expect metadata in headers, and tags in the query parameters.

### General Operations

For most general object operations, we recommend you to define your metadata and tags, should you need them, during the creation or uploading of the objects themselves. This is because the createObject and updateObject endpoints can both handle metadata and tags concurrently. By defining them during the creation and update stages, you can minimize the number of network calls needed to be done to COMS and the S3 endpoint.

However, we do also support out-of-band metadata and tag manipulation with a set of PATCH, PUT and DELETE operands. These operations allow you to add, replace or delete metadata and tags respectively for a specific object. New object versions will be transparently generated if metadata is altered. As such, COMS is capable of allowing the full lifecycle of metadata and tag management at any point in time.

### Search

One of the most powerful features of COMS is its dynamic searchObjects endpoint. Using its database, It is capable of searching metadata and tags.

This search works using a set intersection model; you can be as specific or broad with your search parameters, and the search endpoint will happily do so.

For example, to search objects with the following criteria...

* **Metadata:** `foo=bar`, `baz=bam`

* **Tags:** `x=a`, `y=b`

...add the following to the API call:

* **Headers:** `x-amz-meta-foo=bar` ,  `x-amz-meta-baz=bam`

* **Query parameters:** `tagset[x]=a&tagset[y]=b`

The response will be a list of objects that have all of the specified metadata and tags (as expected for a set intersection).

The search endpoint also allows you to search objects with a specific key without a corresponding value. For example, searching for objects with the metadata `foo` (i.e. `x-amz-meta-foo=""`) and tag `x` (i.e. `tagset[x]`) will return objects that have the specified metadata and tags, regardless of what the corresponding values are.

These metadata and tag selectors can also be combined with other supported query parameters for [the search query endpoint](https://coms-dev.api.gov.bc.ca/api/v1/docs#tag/Object/operation/searchObjects).

Search results can also be scoped to a current user's permissions by enabling the COMS `PrivacyMask` [Privacy Configuration](Config.md#privacy-controls).
