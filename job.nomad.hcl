job "styrdokument" {
  type = "service"

  group "styrdokument" {
    network {
      port "http" { }
    }

    service {
      name     = "styrdokument"
      port     = "http"
      provider = "nomad"
      tags = [
        "traefik-external.enable=true",
        "traefik-external.http.routers.styrdokument.rule=Host(`styrdokument.datasektionen.se`)",
        "traefik-external.http.routers.styrdokument.entrypoints=websecure",
        "traefik-external.http.routers.styrdokument.tls.certresolver=default",
      ]
    }

    task "styrdokument" {
      driver = "docker"

      config {
        image = var.image_tag
        ports = ["http"]
      }

      template {
        data        = <<ENV
TAITAN_URL=http://taitan-styrdokument.nomad.dsekt.internal
PORT={{ env "NOMAD_PORT_http" }}
ENV
        destination = "local/.env"
        env         = true
      }
    }
  }
}

variable "image_tag" {
  type = string
  default = "ghcr.io/datasektionen/styrdokument-bawang:latest"
}
