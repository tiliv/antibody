source "https://rubygems.org"

# Same major/minor line GitHub Pages uses
gem "jekyll", "~> 3.9.3"

# Markdown engine + GitHub-flavored parser
gem "kramdown", "~> 2.3"
gem "kramdown-parser-gfm", "~> 1.1"

# Syntax highlighter
gem "rouge", "~> 3.26"

# Things jekyll-link-attributes fails to do for us
# We pick 1.13 because it's still compatible with macOS's ancient ruby
gem "nokogiri", ">= 1.13"

group :jekyll_plugins do
  gem "jekyll-link-attributes"
  gem "jekyll-redirect-from"
end
