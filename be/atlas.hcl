env "local" {
  src = "file://migrations"
  url = format(
    "postgres://%s:%s@%s:%s/%s?sslmode=%s",
    getenv("DB_USER"),
    getenv("DB_PASSWORD"),
    getenv("DB_HOST"),
    getenv("DB_PORT"),
    getenv("DB_NAME"),
    getenv("DB_SSLMODE"),
  )
  dev = "docker://postgres:17"
}
