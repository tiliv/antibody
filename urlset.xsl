---
layout: sitemap
index: true
title: URLs
note: This must render as valid xml via the layout.
---
<h1>{{ page.author }}</h1>
<table>
  <tr>
    <th>URL</th>
    <th>Last Modified</th>
    <th>Change Frequency</th>
    <th>Priority</th>
  </tr>
  <xsl:for-each select="//s:url">
    <tr>
      <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
      <td><xsl:value-of select="s:lastmod"/></td>
      <td><xsl:value-of select="s:changefreq"/></td>
      <td><xsl:value-of select="s:priority"/></td>
    </tr>
  </xsl:for-each>
</table>
