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
        "traefik.enable=true",
        "traefik.http.routers.styrdokument.rule=Host(`styrdokument.datasektionen.se`)",
        "traefik.http.routers.styrdokument.tls.certresolver=default",
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

      resources {
        memory = 100
      }
    }
  }
}

variable "image_tag" {
  type = string
  default = "ghcr.io/datasektionen/styrdokument-bawang:latest"
}
