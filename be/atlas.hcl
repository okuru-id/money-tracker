env "local" {
  src = "file://migrations"
  url = "postgres://app_user:app_password@localhost:5432/money_tracker?sslmode=disable"
  dev = "docker://postgres:17"
}

lint {
  non_linear = error
}