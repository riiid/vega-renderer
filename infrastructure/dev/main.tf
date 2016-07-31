/**
 * resources
 */
resource "aws_iam_role" "role" {
    name = "apigateway-lambda"
    assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "policy" {
  name = "lambda-invoke-policy"
  role = "${aws_iam_role.role.id}"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}
resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}"
  description = "render vaga spec into image."
}

resource "aws_api_gateway_resource" "png" {
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  parent_id   = "${aws_api_gateway_rest_api.api.root_resource_id}"
  path_part   = "png"
}

module "png-post" {
  source          = "./api-gateway-method"
  method          = "POST"
  rest_api_id     = "${aws_api_gateway_rest_api.api.id}"
  parent_id       = "${aws_api_gateway_rest_api.api.root_resource_id}"
  resource_id     = "${aws_api_gateway_resource.png.id}"
  aws_region      = "${var.aws_region}"
  credentials     = "${aws_iam_role.role.arn}"
  lambda_function = "${var.apex_function_png}"
}

resource "aws_api_gateway_resource" "svg" {
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  parent_id   = "${aws_api_gateway_rest_api.api.root_resource_id}"
  path_part   = "svg"
}

module "svg-post" {
  source          = "./api-gateway-method"
  method          = "POST"
  rest_api_id     = "${aws_api_gateway_rest_api.api.id}"
  parent_id       = "${aws_api_gateway_rest_api.api.root_resource_id}"
  resource_id     = "${aws_api_gateway_resource.svg.id}"
  aws_region      = "${var.aws_region}"
  credentials     = "${aws_iam_role.role.arn}"
  lambda_function = "${var.apex_function_svg}"
}

module "deploy" {
  source      = "./api-gateway-deploy"
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  stage_name  = "${var.apex_environment}"
  depends_id  = "${module.png-post.id},${module.svg-post.id}"
}

resource "aws_s3_bucket" "bucket" {
  bucket = "${var.project_name}"
  acl    = "public-read"
}

/**
 * outputs
 */
output "api-png" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.apex_environment}/png"
}

output "api-svg" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.apex_environment}/svg"
}
