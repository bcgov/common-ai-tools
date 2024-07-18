### Common COMS API use-cases

- Users of your web application submitting documents to BC Government employees.
- Uploading files and making them publicly available to download in a browser.
- Sharing files between an authorized group of users.
- Integration with BCBox allows users to find their files in our hosted user-interface.

### API Usage Patterns

The following steps describe how a document management interface in your application could potentially leverage COMS:

#### Uploading a file

1. `User A` logs in to your application via an OIDC Authentication realm; the user's JWT is stored in the browser's cache.
2. The user fills in a web form on your website attaching a document from their computer (a common user experience).
3. When the user submits this web form, the client application sends a HTTP multipart/form-data POST to the [Create Object](https://coms.api.gov.bc.ca/api/v1/docs#tag/Object/operation/createObjects) endpoint (attaching the User A's JWT in an Authorization header).
4. COMS will do the following
    - Inspect the JWT and create a user record in the COMS database
    - Pass the file to an S3 bucket
    - Grant all PERMISSIONS to that user

#### Sharing a file

5. Client application can do the following:
    - Call the COMS [User Search](https://coms.api.gov.bc.ca/api/v1/docs#tag/User/operation/searchUsers) endpoint to return a list of matching users in the COMS database.
    - Call the [Add Permission](https://coms.api.gov.bc.ca/api/v1/docs#tag/Permission/operation/objectAddPermissions) endpoint to grant a Government employee READ permission on the file.

#### Downloading a file

6. `User B` logs in to the client application.
7. Client application makes request to [Read Object](https://coms.api.gov.bc.ca/api/v1/docs#tag/Object/operation/readObject) endpoint (with User B's JWT in an Authorization header)
    - COMS will verify User B using the JWT and look up permissions for the file in the COMS database
    - COMS will then respond with a redirect to a pre-signed url to the source object in the storage server or allow direct download via proxy. Read the section on [OIDC AUthentication](Authentication.md#authentication-flow-for-readobject) for more details.

For full implementation details of the COMS API, visit the [BCBox](https://github.com/bcgov/bcbox) repository.
