require "uri"

puts ">>> HERE"

# `piece_url`: meant to be an internal url
# `any_url`: meant to be any public url

module Jekyll
  module Antibody
    def antibody_data_key(piece_url)
      # We eat some punctuation & the extension that jekyll disallows in _data.
      # Namely, ' and /, and the .md suffix.
      # / is safe when talking about path traversals in _data, but we make _data
      # files which contain whole paths in them, preprocessing `/` to `,`.

      piece_url.to_s.gsub(/[\'\/]/, "").sub(/\.md\z/, "")
    end

    def antibody_domain(any_url)
      host = URI.parse(any_url.to_s).host rescue nil
      return host if host
      any_url.to_s.sub(/\Ahttps?:\/\//, "").split("/").first
    end

    def antibody_unscheme(any_url, mode = "link")
      # We softly downgrade our own links so that if/when an http downgrade
      # attack is made against a user, they are offered a chance to think very
      # carefully about what is going on invisibly in their browser.
      # i.e., //example.com reuses the existing scheme whatever that is.

      case mode
      when "label"
        any_url.to_s.sub(/\Ahttps?:/, ":")  # label-only, semi-pretty
      else
        any_url.to_s.sub(/\Ahttps?:/, "")  # actual routable // link
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::Antibody)
