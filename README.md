# MARA Photography

**Live website:** https://mara.photography  
**Source code:** https://github.com/Maradubu/photography-portfolio-aws

## Overview

MARA Photography is a personal portfolio presenting my original photographic work. The website is designed to give the images room to speak for themselves, with a restrained interface, responsive gallery and immersive viewing experience. It is **live on AWS** at [mara.photography](https://mara.photography).

The project also serves a second purpose: developing and demonstrating practical skills in **cloud engineering, networking, automation and cybersecurity**. Rather than stopping at a local website, I built and deployed a working public service, connected a custom domain, configured HTTPS and private storage, and investigated real DNS and certificate-validation issues. The architecture is deliberately small and cost-conscious, with further improvements planned as my skills develop.

## Features

- Responsive photography gallery with fullscreen lightbox
- Dark and light themes
- Optional ambient audio, loaded on demand
- Contact form interface (**email delivery is not yet connected**)
- Optimised WebP images and a Python image-optimisation script

## Architecture

```text
Visitor requests https://mara.photography
                 |
                 v
Amazon Route 53 — DNS resolution (apex and www aliases)
                 |
                 v
Amazon CloudFront — HTTPS, CDN and caching
       |         AWS Certificate Manager certificate
       |         (us-east-1)
       v
CloudFront Origin Access Control (OAC)*
                 |
                 v
Private Amazon S3 bucket — static website assets
(eu-west-2; Block Public Access enabled)
```


The domain is registered at Namecheap, but Amazon Route 53 hosts authoritative DNS. The website uses managed AWS services, so it does not require a customer-managed Virtual Private Cloud (VPC), Amazon EC2 instance or public S3 website endpoint.

## Technology stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Frontend | HTML, CSS, JavaScript | Portfolio interface and interactions |
| Asset preparation | Python, WebP | Image optimisation |
| Storage | Amazon S3 | Private static assets |
| Delivery | Amazon CloudFront | CDN, caching and HTTPS endpoint |
| Certificate | AWS Certificate Manager (ACM) | Managed TLS certificate |
| DNS | Amazon Route 53 | Apex and `www` alias records |
| Registrar | Namecheap | Domain registration |
| Source control | Git and GitHub | Version history and project source |

## Deployment process

1. Built the frontend locally, version-controlled the code with Git and published the repository on GitHub.
2. Optimised the photographs using Python and uploaded the static site files to a private S3 bucket in **Europe (London), `eu-west-2`**.
3. Enabled **S3 Block Public Access** and configured private CloudFront access to the S3 origin. **Origin Access Control (OAC)** is the mechanism to confirm in the distribution's origin settings. With OAC, the intended bucket policy allows the **CloudFront service principal** to read objects only for the specific distribution, using an `AWS:SourceArn` condition—not anonymous public access.
4. Created a CloudFront distribution, set `index.html` as its default root object and tested the initial CloudFront website address.
5. Registered `mara.photography` at Namecheap after discovering that Route 53 domain registration was unavailable to the AWS Free Plan account.
6. Requested a public ACM certificate in **US East (N. Virginia), `us-east-1`**, for `mara.photography` and `www.mara.photography`, as required by CloudFront.
7. Created DNS-validation CNAME records, diagnosed the missing `.www` suffix on one validation hostname and obtained an **Issued** certificate.
8. Attached the certificate and both alternate domain names to CloudFront. Selected security policy **`TLSv1.2_2021`**, with HTTP/2 and HTTP/3 enabled.
9. Created a public Route 53 hosted zone, added **A alias records** for the apex and `www` domains pointing to CloudFront, and copied both ACM validation CNAME records to Route 53 for certificate renewal.
10. Changed Namecheap's authoritative nameservers to the four Route 53 nameservers. Used `dig +trace NS mara.photography` to verify that the `.photography` registry delegated the domain to AWS.
11. Diagnosed a local browser DNS error: direct queries to an AWS nameserver and the `1.1.1.1` resolver returned addresses, while the browser initially failed. Flushed the macOS DNS cache, restarted Brave and successfully opened the live website.

## Security and operational decisions

- **Private S3 storage:** S3 Block Public Access is enabled; the site is served via CloudFront, not public S3 website hosting.
- **CloudFront origin restriction:** Private origin access is configured. The OAC setting and distribution-scoped S3 bucket policy are **pending a final console verification** (see Architecture).
- **AWS account access:** An IAM user with **multi-factor authentication (MFA)** was configured for administration, rather than using the root user for routine work. This does **not**, by itself, establish least-privilege permissions; an IAM policy review remains planned.
- **Transport encryption:** An ACM-issued certificate covers the apex and `www` hostnames; CloudFront uses the `TLSv1.2_2021` security policy.
- **Certificate renewal:** Both DNS validation CNAME records are retained in Route 53.
- **Cost controls:** AWS Budgets was configured, and the design avoids always-on EC2 instances and optional high-cost CloudFront legacy-client support. Actual costs will be documented after the first billing period.

## Local development and deployment

The frontend lives under `website/`; the image optimisation script is under `scripts/optimise_images.py`. Open `website/index.html` for simple local checks, or serve `website/` with a local development server where needed.

The current AWS deployment was performed through the AWS console. **Automated GitHub Actions deployment to AWS has not yet been implemented.** The historical GitHub Pages workflow is not the production deployment method.

## GitHub Pages retirement

The former GitHub Pages deployment should be retired now that the AWS-hosted domain is live, to avoid maintaining two public copies of the site.

1. Confirm the AWS website and both hostnames work as intended.
2. In **GitHub → repository → Settings → Pages**, disable the existing Pages publication (**Source: Deploy from a branch → None**, if available, or use the current Pages unpublish control).
3. Disable or remove `.github/workflows/deploy-pages.yml` after confirming it is no longer needed; do not remove unrelated workflows.
4. Update **GitHub repository → About → Website** to `https://mara.photography`, and replace any old GitHub Pages URL used as the *current live website* in project metadata or content. Preserve historical URLs where they are explicitly part of the project history.
5. Verify that the old Pages URL no longer serves a second copy of the portfolio. If the old URL has already been indexed, search-engine results may take time to disappear.

**Status:** Retirement instructions documented; not yet confirmed executed.

## Roadmap

- Connect the contact form through Amazon API Gateway, AWS Lambda and Amazon Simple Email Service (SES), with server-side validation and abuse protection.
- Build a GitHub Actions → AWS deployment pipeline with short-lived credentials and CloudFront cache invalidation.
- Add **HTTP security headers**, including **HTTP Strict Transport Security (HSTS)**, Content Security Policy (CSP), `X-Content-Type-Options` and an appropriate `Referrer-Policy`; test compatibility before enforcement.
- Evaluate and enable **S3 versioning** for rollback and recovery, taking storage costs into account.
- Enable and review **AWS CloudTrail** activity logging, with appropriate retention and cost controls.
- Review IAM permissions for least privilege; improve monitoring and security checks.
- Decide whether `www.mara.photography` should redirect to the canonical `mara.photography` hostname.
- **Record actual AWS costs after the first bill**, distinguishing any promotional credits from underlying usage charges.
- Complete the outstanding Verification checks and retire GitHub Pages.

## Status

**Production website:** https://mara.photography  
**Hosting:** Amazon S3 + CloudFront  
**Authoritative DNS:** Route 53  
**HTTPS certificate:** AWS Certificate Manager  
**Deployment date:** 7 November 2026

This README distinguishes implemented functionality, observed test results and future work. It does not claim that the contact backend, automated AWS deployment, security headers, versioning or CloudTrail configuration have already been completed.
