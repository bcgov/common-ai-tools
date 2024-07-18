### Should I self-host COMS or use the hosted service?

Feature Comparison:

| &nbsp; Feature | &nbsp; Hosted | &nbsp; Self-Hosted |
| :--- | :--- | :--- |
| &nbsp; Keycloak Realm | &nbsp; SSO '[Standard Realm](https://github.com/bcgov/sso-keycloak/wiki#standard-service)' | &nbsp; any OIDC realm
| &nbsp; IDP support | &nbsp; `IDIR`<br />&nbsp; `Basic BCeID`<br />&nbsp; `Business BCeID` | &nbsp; Configurable
| &nbsp; [BCBox](https://bcbox.nrs.gov.bc.ca/) integration | <ul><li>[x] </li></ul> | <ul><li>[ ] </li></ul>
| &nbsp; Hosting Platform | &nbsp; [OpenShift](Architecture-Hosted.md#infrastructure) | &nbsp; [Source Code](https://github.com/bcgov/common-object-management-service/)<br />&nbsp; [Docker](https://hub.docker.com/r/bcgovimages/common-object-management-service/)<br />&nbsp; [OpenShift](Architecture-Hosted.md#infrastructure)
| &nbsp; Database Custodians | &nbsp; Us | &nbsp; You
| &nbsp; Object Storage Custodians | &nbsp; You | &nbsp; You
| &nbsp; Multi-bucket support | <ul><li>[x] </li></ul> | <ul><li>[x] </li></ul>
| &nbsp; Strict [Privacy mode](Config.md#privacy-controls)  | <ul><li>[x] </li></ul> | &nbsp; Configurable
| &nbsp; [No-Auth mode](Config.md#unauthenticated)| <ul><li>[ ] </li></ul> | &nbsp; Configurable
| &nbsp; Custom configuration options | <ul><li>[ ] </li></ul> | <ul><li>[x] </li></ul>
