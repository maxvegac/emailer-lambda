# Backend configuration for OpenTofu state
terraform {
  backend "s3" {
    # These values will be provided via backend config file or CLI arguments
    # bucket         = "your-terraform-state-bucket"
    # key            = "emailer/terraform.tfstate"
    # region         = "us-east-1"
    # dynamodb_table = "terraform-state-lock"
    # encrypt        = true
  }
}
