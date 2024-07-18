
To compare with features with the BC Gov Hosted Service, see the [Hosting Considerations](Hosting-Considerations.md) page.

## Reasons to self-host

- There's a [Docker image](https://hub.docker.com/r/bcgovimages/common-object-management-service/) and [Helm chart](https://github.com/bcgov/common-object-management-service/blob/master/charts/coms/Chart.yaml) to help deploy COMS on OpenShift.
- Your application uses a custom OIDC realm or has custom integration requirements with other IDPs.
- You just need a user-friendly, REST-based S3 client 'wrapper'.
- You can configure COMS to suit your needs:
  - Refer to the different [Authentication Modes](Config.md#authentication-modes)
  - Use the default S3 bucket to use for all operations
  - Disable the strict [Privacy Controls](Config.md#privacy-controls) to make object metadata searchable
- You want to modify COMS source code before running (it's a REST API built with NodeJS and Express)
- You want to be the custodians of the COMS database that contains user permissions and document metadata

## Getting started

To run COMS on your local computer, see the following::

- [Application README](https://github.com/bcgov/common-object-management-service/blob/master/app/README.md)
- [Docker Image](https://hub.docker.com/r/bcgovimages/common-object-management-service/)
- [GitHub repo](https://github.com/bcgov/common-object-management-service/)
- [API Specifiction](https://coms.api.gov.bc.ca/api/v1/docs)

## Contact us to find out more

COMS is developed by the [Common Services Team](https://bcgov.github.io/common-service-showcase/).<br />
Email: <NR.CommonServiceShowcase@gov.bc.ca><br />
Community help: [Rocket.Chat](https://chat.developer.gov.bc.ca/channel/nr-common-services-showcase)
