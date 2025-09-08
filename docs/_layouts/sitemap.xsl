---
layout: null
---
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:template match="/">
<html>
<head>
  <title>{{ page.title | default: "Sitemap" }}</title>
  <style>
    body { font: 14px sans-serif; margin: 2rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 0.4rem; }
    th { background: #eee; text-align: left; }
  </style>
</head>
<body>
  <h1>Sitemap: {{ page.title }}</h1>
  {{ content }}
</body>
</html>
</xsl:template>
</xsl:stylesheet>
