# MARA Photography

**Live website:** https://mara.photography  
**Source code:** https://github.com/Maradubu/photography-portfolio-aws

## Overview

MARA Photography is a personal photography portfolio built and deployed on Amazon Web Services (AWS). It showcases original photographic work through a minimalist, responsive interface, with an immersive image gallery, fullscreen lightbox, optional ambient audio and a functional contact form.

The project also serves as a practical cloud engineering and cybersecurity portfolio. It demonstrates the development and deployment of a publicly accessible application using AWS infrastructure, serverless computing, Python, networking, DNS, HTTPS, access controls and operational monitoring.

Rather than relying on traditional server hosting, MARA uses managed AWS services to deliver a lightweight, scalable and cost-conscious application.

**Project status:** Live and operational, with the production contact form successfully tested.

## Features

- Responsive photography gallery with fullscreen lightbox
- Dark and light themes
- Optional ambient audio, loaded on demand
- Functional contact form with email delivery through AWS
- Server-side form validation and basic spam protection
- Optimised WebP photography assets
- Python image-optimisation script
- Custom domain with HTTPS
- Private cloud storage and global content delivery

## AWS Architecture

```text
                       VISITOR
                          |
                          v
                  mara.photography
                          |
                          v
                  Amazon Route 53
                    DNS resolution
                          |
                          v
                  Amazon CloudFront
                  HTTPS / CDN / Cache
                          |
              +-----------+-----------+
              |                       |
              v                       v
       Origin Access             Contact form
       Control (OAC)              JavaScript
              |                       |
              v                       v
        Amazon S3               API Gateway
      Private bucket             HTTP API
      Website assets                 |
                                     v
                                 AWS Lambda
                               Python backend
                               Input validation
                                     |
                                     v
                                 Amazon SES
                               Email delivery
                                     |
                                     v
                              Outlook mailbox
```

AWS Certificate Manager (ACM) provides the TLS certificate used by CloudFront.

Amazon CloudWatch supports Lambda troubleshooting and operational monitoring. Amazon Simple Notification Service (SNS) is used for selected Amazon SES delivery-problem notifications.

### Architecture decisions

The frontend is hosted in a private Amazon S3 bucket and delivered through Amazon CloudFront.

The contact form uses a serverless architecture consisting of:

1. **Amazon API Gateway:** Receives HTTPS contact-form requests.
2. **AWS Lambda:** Runs Python code to validate submitted information.
3. **Amazon Simple Email Service (SES):** Processes the email request and sends it to a predefined recipient.

This separation allows the static website and backend to operate independently.

The application does not require an always-running Amazon EC2 instance or a customer-managed Virtual Private Cloud (VPC).

## Technology Stack

| Area | Technology | Purpose |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | Website interface and interactions |
| Backend | Python 3.13 | Serverless contact-form processing |
| Image processing | Python, WebP | Image optimisation |
| Storage | Amazon S3 | Private website assets |
| Content delivery | Amazon CloudFront | CDN, caching and HTTPS delivery |
| DNS | Amazon Route 53 | Domain resolution |
| TLS certificates | AWS Certificate Manager | HTTPS certificate management |
| API | Amazon API Gateway HTTP API | Public contact-form endpoint |
| Serverless compute | AWS Lambda | Backend execution |
| Email | Amazon SES | Email processing and delivery |
| Notifications | Amazon SNS | Selected SES delivery-problem alerts |
| Monitoring | Amazon CloudWatch | Lambda logs and troubleshooting |
| Identity and access | AWS IAM | AWS permissions and access management |
| Source control | Git, GitHub | Version control and source repository |
| Development | Visual Studio Code | Local development |

## Repository Structure

```text
photography-portfolio-aws/
├── website/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── images/
│   └── audio/
│
├── backend/
│   └── lambda_function.py
│
├── scripts/
│   └── optimise_images.py
│
├── .gitignore
└── README.md
```

The frontend and backend are maintained in the same Git repository, allowing application code to be tracked together.

AWS infrastructure was configured manually using the AWS Management Console and AWS Command Line Interface (CLI).

Infrastructure as Code (IaC) and automated production deployment have not yet been implemented.

## Contact Form Implementation

The contact form provides a practical example of integrating a static website with a cloud-hosted Python backend.

### Request flow

1. A visitor completes the contact form.
2. JavaScript sends a JSON request to the API Gateway endpoint using `fetch()`.
3. API Gateway invokes the Lambda function.
4. Lambda parses and validates the submitted fields.
5. Valid submissions are passed to Amazon SES.
6. SES processes the message using the verified `mara.photography` sending identity.
7. Lambda returns an HTTP response to the browser.
8. JavaScript displays a success or error message.

A successful SES API response confirms that SES accepted the email request; it does not independently guarantee final inbox delivery.

### Backend validation

The Python Lambda function implements:

- JSON request parsing
- Field type validation
- Required-field checks
- Input length restrictions
- Basic email address format validation
- Whitespace normalisation
- Honeypot field checking
- A 10 KB request-body limit for string request bodies
- HTTP error responses
- Amazon SES exception handling

The sender and recipient addresses are fixed in the backend configuration.

The visitor's submitted email address is used as the reply-to address after validation, rather than allowing arbitrary destination addresses.

### Spam and abuse protection

API Gateway throttling is configured with:

- **Rate limit:** 2 requests per second
- **Burst limit:** 5 requests

These limits apply to the API stage and help reduce excessive request volume.

The frontend also includes a honeypot field to discourage simple automated submissions.

These protections reduce abuse risk but are not equivalent to comprehensive bot detection, per-IP rate limiting or a guaranteed spending cap.

## Security

Security was considered throughout development rather than added only after deployment.

### Storage security

- Amazon S3 Block Public Access is enabled.
- Website files are delivered through CloudFront.
- CloudFront Origin Access Control (OAC) is used for private origin access.
- The website does not rely on a public S3 static website endpoint.

A final independent review of the distribution-scoped S3 bucket policy remains a useful hardening task.

### Transport security

- HTTPS is provided through CloudFront.
- An ACM certificate covers `mara.photography` and `www.mara.photography`.
- The certificate is hosted in `us-east-1`, as required for CloudFront.
- The CloudFront security policy was configured as `TLSv1.2_2021`.
- DNS validation records are retained for certificate renewal.

### Identity and permissions

- An IAM administrative identity with multi-factor authentication (MFA) was configured.
- The Lambda execution role has an SES sending permission scoped to the application's verified sending identity.
- A broader least-privilege review remains planned.

### Backend security

- Input types and lengths are validated server-side.
- Oversized request bodies are rejected before JSON parsing.
- API Gateway throttling reduces excessive invocation rates.
- Sender and recipient email addresses are controlled by the backend.
- The application returns generic error messages rather than exposing SES errors to visitors.

### Email authentication

Amazon SES is configured with:

- Verified `mara.photography` domain identity
- DomainKeys Identified Mail (DKIM) signing
- A Domain-based Message Authentication, Reporting and Conformance (DMARC) DNS record using `p=none`
- A configuration set for email event monitoring

The SES account remains in sandbox mode, with delivery directed to a verified recipient.

The DMARC policy is currently monitoring-oriented rather than enforcing quarantine or rejection.

### Remaining security improvements

Potential future improvements include:

- Stronger automated-spam protection
- HTTP security headers
- More comprehensive IAM policy review
- Automated security testing
- Improved monitoring and alerting

## AWS Deployment

### 1. Static website hosting

The frontend was developed locally and uploaded to a private S3 bucket in the Europe (London) AWS Region, `eu-west-2`.

A CloudFront distribution was configured to deliver the website globally.

The distribution uses the S3 origin and a default root object of `index.html`.

### 2. Domain configuration

The `mara.photography` domain was registered through Namecheap.

Amazon Route 53 provides authoritative DNS using a public hosted zone.

Apex and `www` alias records point to CloudFront.

### 3. HTTPS certificate

An ACM certificate was requested in `us-east-1` for both hostnames.

DNS validation required CNAME records.

During setup, an incorrect validation hostname prevented certificate issuance. The record was corrected and the certificate was successfully issued.

### 4. DNS delegation

Namecheap's authoritative nameservers were changed to the Route 53 nameservers.

DNS delegation was verified using command-line tools including:

```bash
dig +trace NS mara.photography
```

Additional DNS troubleshooting involved querying authoritative and public resolvers, flushing the macOS DNS cache and restarting the browser.

### 5. Serverless backend

A Python Lambda function named `mara-contact-form` was deployed in `eu-west-2`.

An API Gateway HTTP API was created with a `POST /contact` route integrated with Lambda.

Cross-Origin Resource Sharing (CORS) was configured for the production website hostnames and the local development origin.

### 6. Email integration

Amazon SES was configured with a verified domain identity, DKIM signing and a verified recipient.

The contact form was tested from the local development environment before production deployment.

### 7. Production release

Updated frontend files were uploaded to Amazon S3.

A CloudFront invalidation was created for:

```text
/index.html
/script.js
```

The production contact form was subsequently tested successfully through `https://mara.photography`, including confirmation of email receipt.

## Testing and Troubleshooting

Several real deployment and operational problems were investigated during development.

### DNS and certificate validation

An incorrect ACM DNS validation hostname prevented certificate issuance.

The issue was diagnosed by inspecting DNS records and corrected before proceeding with CloudFront configuration.

### Local DNS resolution

After domain delegation, public DNS resolution worked while the local browser initially failed.

Testing with `dig`, checking public resolvers and clearing local DNS state helped isolate the problem.

### API Gateway and CORS

The frontend initially encountered cross-origin request problems.

API Gateway CORS configuration was updated to permit the intended website origins and HTTP methods.

### Lambda syntax error

After introducing request-size validation, an oversized request unexpectedly returned HTTP 500.

CloudWatch logs identified a Python indentation error:

```text
Runtime.UserCodeSyntaxError
```

The indentation was corrected and the function redeployed.

The oversized-request test subsequently returned:

```text
HTTP 413
{"message": "Request too large."}
```

This demonstrated the value of examining execution logs rather than diagnosing errors from browser responses alone.

### Regression testing

After backend security changes, a legitimate contact-form submission was tested successfully.

The same functionality was then tested on the production website after the CloudFront cache invalidation.

## Monitoring and Cost Management

The project was designed around managed and serverless AWS services to avoid the operational overhead of an always-running server.

Implemented measures include:

- AWS Budgets and billing monitoring
- API Gateway throttling
- Lambda request validation
- CloudWatch Lambda execution logs
- Selected SES event notifications through SNS
- Manual deployment and post-deployment verification

### Lambda concurrency

The AWS account currently has a concurrency quota of 10.

An attempt to configure two reserved concurrent executions for the contact function was rejected because AWS requires a minimum unreserved concurrency allocation.

The function therefore continues to use the account's shared concurrency pool.

### Cost limitations

API throttling and serverless architecture can reduce operational costs, but they do not guarantee a maximum monthly bill.

AWS promotional credits are available on the account. Actual underlying service usage and costs should be reviewed independently of those credits.

## Local Development

Clone the repository:

```bash
git clone https://github.com/Maradubu/photography-portfolio-aws.git
cd photography-portfolio-aws
```

Start a local web server:

```bash
cd website
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

The frontend uses a deployed AWS API endpoint for contact-form submissions. Running the local web server does not create or emulate the AWS backend.

The Lambda source is stored in `backend/lambda_function.py` for version control and reference.

## GitHub and Deployment Workflow

Git is used to track frontend and backend changes.

The production deployment currently uses manual AWS operations:

1. Develop and test changes locally.
2. Commit application code to Git.
3. Push changes to GitHub.
4. Deploy backend changes to Lambda when required.
5. Upload changed frontend files to S3.
6. Invalidate relevant CloudFront cached objects.
7. Test the production website.

GitHub Actions deployment to AWS has not yet been implemented.

### GitHub Pages retirement

The project previously used GitHub Pages during development.

Now that the AWS-hosted website is operational, the previous Pages deployment should be disabled to avoid maintaining duplicate public versions.

Retirement has not yet been independently confirmed.

## Skills Demonstrated

This project provides practical experience across several technical areas.

**Cloud engineering**
- AWS service configuration and integration
- Static website hosting and content delivery
- Serverless application architecture
- Cloud resource management

**Networking**
- DNS records and authoritative nameservers
- Domain delegation
- HTTPS and TLS certificates
- HTTP APIs and CORS
- CDN caching and invalidation

**Python and application development**
- AWS Lambda functions
- JSON processing
- Input validation
- Exception handling
- AWS SDK for Python (Boto3)

**Cybersecurity**
- Identity and access management
- Private cloud storage
- Server-side validation
- API throttling
- Email authentication
- Logging and error investigation

**Development practices**
- Git and GitHub version control
- Local development and testing
- Debugging and regression testing
- Technical documentation

## Roadmap

Planned improvements include:

- Automate deployment using GitHub Actions and short-lived AWS credentials.
- Add automated frontend and backend tests.
- Introduce stronger spam protection for the public contact endpoint.
- Configure and test HTTP security headers, including HSTS, CSP, `X-Content-Type-Options` and `Referrer-Policy`.
- Review IAM permissions and S3 origin policies.
- Evaluate S3 versioning for rollback and recovery.
- Review CloudTrail activity logging and retention.
- Improve operational monitoring and alerting.
- Decide whether the `www` hostname should redirect to the apex domain.
- Review actual AWS costs after the first billing period.
- Retire the previous GitHub Pages deployment.

## Project Status

| Component | Status |
|---|---|
| Photography website | Live |
| Custom domain | Configured |
| HTTPS | Configured |
| S3 and CloudFront hosting | Operational |
| Contact form | Operational |
| API Gateway and Lambda | Operational |
| Amazon SES integration | Tested |
| API throttling | Configured |
| Backend source control | Completed |
| Automated AWS deployment | Planned |
| Additional security hardening | Planned |

**Production deployment:** 7 November 2026  
**Live application:** https://mara.photography

---

MARA Photography is both a creative portfolio and an ongoing practical learning project in cloud engineering, Python and cybersecurity. The repository documents implemented functionality, verified tests, technical decisions and future improvements separately.