source "https://rubygems.org"

gem "jekyll", "~> 4.3"

# Markdown engine + GitHub-flavored parser
gem "kramdown", "~> 2.4"
gem "kramdown-parser-gfm", "~> 1.1"

# Syntax highlighter
gem "rouge", "~> 4.2"

# Things jekyll-link-attributes fails to do for us
# We pick 1.13 because it's still compatible with macOS's ancient ruby
gem "nokogiri", ">= 1.13"

group :jekyll_plugins do
  gem "jekyll-link-attributes"
  gem "jekyll-redirect-from"
end
