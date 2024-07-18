This page outlines the general deployment decisions you will need to consider before standing up COMS and is mainly intended for a technical audience, and for people who want to have a better understanding of how the system features interact with each other. For instructions on running COMS, please refer to our [Application README](https://github.com/bcgov/common-object-management-service/blob/master/app/README.md).

- [Object Storage](#object-storage)
- [Authentication Modes](#authentication-modes)
- [Bucket Credentials Encryption](#bucket-credential-encryption)
- [Privacy Controls](#privacy-controls)

The configuration of COMS is done using the NodeJS [config](https://www.npmjs.com/package/config) library.
environment variables for the COMS application are listed [here](https://raw.githubusercontent.com/bcgov/common-object-management-service/master/app/config/custom-environment-variables.json). These variables can be created in each deployment environment. In this page we explain these configuration options:

**Note:** Some features are enabled using `enabled: "true"`. To disable the feature, omit this line (or environment variable) entirely from your config.

## Object Storage

This group of variables define a **default** object storage location and bucket. A default is required and provides the scope for various COMS endpoints where bucketId is optional. If no bucketId parameter is passed, the default bucket will be used.

```sh
"objectStorage": {
  "accessKeyId": "<Access Key ID>", # eg: The ECS Object User or IAM ID
  "bucket": "<ID or name of a bucket>" # eg: climatedocs,
  "defaultTempExpiresIn": "<time in milliseconds>" # expiry time for pre-signed urls (eg `300`),
  "endpoint": "<Object Storage service host url>" # eg: `https://nrs.objectstore.gov.bc.ca`,
  "key": "<Path Prefix where COMS will mount bucket>" # eg: `2024/wildfires`,
  "secretAccessKey": "<Secret Access Key>" # eg: The ECS Object User’s Secret Key or IAM Secret Access Key
},
```

## Authentication Modes

COMS provides a combination of authentication modes, intended to makes COMS more *compatible* with your architecture. Depending on the roles you expect COMS to play in your use case, you will need to choose between one of the following four authentication modes:

- [OIDC](#oidc-keycloak) (`OIDCAUTH`)
- [Basic](#basic) (`BASICAUTH`)
- [Full](#full) (`FULLAUTH`)
- [Unauthenticated](#unauthenticated) (`NOAUTH`)

### OIDC (Keycloak)

This mode is generally recommended for systems where you expect users to interact with COMS in parallel to your line of business application. Here you specify a single OIDC (eg Keycloak) realm. Client app user JWT's must also be issued in this realm.

- Clients require an OIDC JWT Authorization token header ([RFC 9068](https://datatracker.ietf.org/doc/html/rfc9068))
- In this mode, COMS should be configured to use the same OIDC realm as your client application
- If a user has logged into your application, COMS can also verify the identity of the current user with the same existing JWT (jwt.sub or configured identity key)
- The JWT user subject or any identity key claim (configurable with the `identityKey`) will serve as the primary identifier for that user entity in the database
- File permissions can be granted and managed for users through the COMS API

```sh
"keycloak": {
    "enabled": "true", # if OIDC auth is enabled
   ...
    "identityKey": "<Claim in JWT to identify user>" # eg: idir_user_guid,bceid_user_guid
```

### Basic

This mode is generally recommended for systems where you expect to use COMS at a service-client level. Basic user/password protection is granted and enforced.

- Clients require a Basic Authorization header ([RFC 7617](https://datatracker.ietf.org/doc/html/rfc7617))
- Provides an "all or nothing" permission model
- Suitable for an admin interface to the object store
- Suitable for service client-level operations where the request is authorized in the scope of the application rather than for a specific user

```sh
"basicAuth": {
  "enabled": "true", # note: to disable, delete this environment variable
  "password": "<custom Basic Auth Password.",
  "username": "<custom Basic Auth Username>"
},
```

### Full

This mode is generally recommended for systems that need both user level and administrative level access to objects. This grants the full suite of functionality COMS offers, but care must be taken to ensure that access to objects is done securely from your line of business application.

- Both OIDC and [Basic](#basic) and [OIDC](#oidc-keycloak) authentication modes are simultaneously enabled

### Unauthenticated

This mode is generally recommended when you expect to run COMS in a highly secured network environment and do not have concerns about access control to objects as you have another application handling that already.

- Clients do not require an Authorization header
- File access can be granted through a temporary expiring download link
- This mode is suitable for allowing arbitrary file uploads from unauthenticated users
- This mode would suit a workflow where authentication is provided by the client application

## Bucket Credential encryption

In a multi-bucket COMS deployment (where buckets exist in the COMS database, in addition to the [default bucket](#object-storage)), bucket credentials (`Access Key ID` and `Secret Access Key`) are stored in the database as encrypted strings. Encryption is done by NodeJS's internal `crypto` library. The key for encryption is assigned to the `SERVER_PASSPHRASE` environment variable, and is only available inside the scope of the COMS app container.

```sh
  "server": {
    "passphrase": "<custom or random string>",
    ...
  }
```

## Privacy Controls

COMS can be configured to run with a stricter content privacy masking. This is typically required when you want to limit object search results to just data that the current user has `READ` permission for.

By default, COMS will run in the standard permissive mode, allowing for greater search and discovery features, unless the `SERVER_PRIVACY_MASK` environment variable is set to true.

```sh
  "server": {
    "privacyMask": "true"
    ...
  }
```

When enabled, the COMS API endpoints that search for objects or list objects matching input parameters will not expose metadata or tags related to objects.

Requests to the following endpoints will scope the results to data related to objects that the current user has READ permission for (either through the object, or inherited through the bucket in which the object exists.):

- `GET /object`
- `GET /object/tagging`
- `GET /object/metadata`
- `GET /version/tagging`
- `GET /version/metadata`

In addition, the following two endpoints that search/list all tags (or metadata) that exist in a COMS database will only return the tag/metadata `Key` and not allow you to filter by `Value`:

- `GET /tagging`
- `GET /metadata`

All behaviour affected by this Privacy is ignored when the API request is authenticated using the [Basic](#basic) Authentication.
For more details. Please see the COMS API Spec.
