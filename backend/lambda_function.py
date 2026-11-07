import json
import re
import boto3
from botocore.exceptions import ClientError

# Amazon SES configuration
ses = boto3.client("ses", region_name="eu-west-2")

SENDER = "contact@mara.photography"
RECIPIENT = "mara.mph@outlook.com"


# Helper function for HTTP responses
def respond(status_code, message):
    return {
        "statusCode": status_code,
        "body": json.dumps({
            "message": message
        })
    }


# Main AWS Lambda function
def lambda_handler(event, context):

    # Step 1: Parse incoming request
    try:
        body = event.get("body", event)

        # Reject excessively large requests (10 KB maximum)
        if isinstance(body, str) and len(body.encode("utf-8")) > 10_240:
            return respond(413, "Request too large.")

        if isinstance(body, str):
            body = json.loads(body)

        if not isinstance(body, dict):
            return respond(400, "Invalid request format.")

    except (ValueError, TypeError, AttributeError):
        return respond(400, "Invalid request format.")

    # Step 2: Extract form fields
    name = body.get("name", "")
    email = body.get("email", "")
    message = body.get("message", "")
    website = body.get("website", "")

    # Step 3: Validate field types
    if not all(
        isinstance(value, str)
        for value in [name, email, message, website]
    ):
        return respond(400, "Invalid field types.")

    # Remove unnecessary whitespace
    name = name.strip()
    email = email.strip()
    message = message.strip()

    # Step 4: Honeypot spam protection
    if website.strip():
        return respond(200, "Message received.")

    # Step 5: Validate form content
    valid_email = re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+",
        email
    )

    if (
        not name
        or not message
        or len(name) > 100
        or len(email) > 254
        or len(message) > 2000
        or not valid_email
    ):
        return respond(
            400,
            "Please check your form details."
        )

    # Step 6: Send email through Amazon SES
    try:
        ses.send_email(
            Source=SENDER,
            Destination={
                "ToAddresses": [RECIPIENT]
            },
            ReplyToAddresses=[email],
            Message={
                "Subject": {
                    "Data": "New MARA photography enquiry",
                    "Charset": "UTF-8"
                },
                "Body": {
                    "Text": {
                        "Data": (
                            f"Name: {name}\n"
                            f"Email: {email}\n\n"
                            f"Message:\n{message}"
                        ),
                        "Charset": "UTF-8"
                    }
                }
            }
        )

        return respond(
            200,
            "Message sent successfully!"
        )

    # Step 7: Handle Amazon SES errors
    except ClientError as error:
        print(
            "SES error code:",
            error.response["Error"]["Code"]
        )

        print(
            "SES error message:",
            error.response["Error"]["Message"]
        )

        return respond(
            500,
            "Unable to send message. Please try again."
        )

