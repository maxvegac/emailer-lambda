# Backend configuration for OpenTofu state
terraform {
  backend "s3" {
    bucket         = "emailer-terraform-state-1759818669"
    key            = "emailer/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
